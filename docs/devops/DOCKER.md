# Docker Guide
## HR Analytics Platform

> **Related:** Infrastructure setup → `docs/devops/INFRASTRUCTURE.md`
> Deployment → `docs/devops/DEPLOYMENT.md`
> Secrets → `docs/devops/SECRETS.md`

---

## Image Strategy

| Image | Base | Registry | Tag pattern |
|-------|------|----------|------------|
| `frontend` | `nginx:1.27-alpine` | `ghcr.io/hrplatform/frontend` | `v2.0.0`, `main-SHA` |
| `backend` | `node:20-alpine` | `ghcr.io/hrplatform/backend` | `v2.0.0`, `main-SHA` |
| `websocket` | `node:20-alpine` | `ghcr.io/hrplatform/websocket` | `v2.0.0`, `main-SHA` |

Rules:
- Never use `latest` in production — always a pinned version or SHA
- Alpine base images only — smallest attack surface
- Multi-stage builds — no dev dependencies in production image
- Non-root user in every container

---

## Frontend Dockerfile

```dockerfile
# HR-platform/frontend/Dockerfile

# ─── Stage 1: Build ───────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (layer cache)
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# Copy source and build
COPY . .
RUN npm run build

# ─── Stage 2: Serve ───────────────────────────────────────────────
FROM nginx:1.27-alpine AS runner

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx/nginx.conf /etc/nginx/conf.d/hrplatform.conf

# Copy build output
COPY --from=builder /app/dist/hr-analytics-platform/browser /usr/share/nginx/html

# Non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /usr/share/nginx/html /var/cache/nginx /var/run
USER appuser

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
```

---

## Backend Dockerfile

```dockerfile
# HR-platform/backend/Dockerfile

# ─── Stage 1: Dependencies ────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production --ignore-scripts

# ─── Stage 2: Build ───────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts
COPY . .
RUN npm run build

# ─── Stage 3: Runtime ─────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

# Copy production deps + compiled output only
COPY --from=deps    /app/node_modules ./node_modules
COPY --from=builder /app/dist         ./dist
COPY --from=builder /app/package.json ./

# Non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "dist/main.js"]
```

---

## docker-compose.yml — Local Development

```yaml
# HR-platform/docker-compose.yml
version: '3.9'

services:

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      target: builder           # dev: use builder stage, serve via ng serve
    volumes:
      - ./frontend/src:/app/src # hot reload
    ports:
      - "4200:4200"
    command: npm start
    environment:
      - NODE_ENV=development
    depends_on:
      - backend

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
      target: builder
    volumes:
      - ./backend/src:/app/src
    ports:
      - "3000:3000"
    command: npm run start:dev
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://hrplatform:hrplatform@postgres:5432/hrplatform
      REDIS_URL: redis://:hrplatform@redis:6379
      JWT_SECRET: dev-secret-change-in-production
      JWT_EXPIRY: 60m
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy

  websocket:
    build:
      context: ./backend
      dockerfile: Dockerfile.ws
      target: builder
    ports:
      - "3001:3001"
    environment:
      REDIS_URL: redis://:hrplatform@redis:6379
    depends_on:
      - redis

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: hrplatform
      POSTGRES_USER: hrplatform
      POSTGRES_PASSWORD: hrplatform
    ports:
      - "5432:5432"
    volumes:
      - postgres-dev-data:/var/lib/postgresql/data
      - ./backend/db/seed.sql:/docker-entrypoint-initdb.d/seed.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U hrplatform"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass hrplatform --appendonly yes
    ports:
      - "6379:6379"
    volumes:
      - redis-dev-data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "hrplatform", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Optional: Adminer for DB inspection during dev
  adminer:
    image: adminer:4-standalone
    ports:
      - "8080:8080"
    depends_on:
      - postgres

volumes:
  postgres-dev-data:
  redis-dev-data:
```

---

## docker-compose.staging.yml — Staging Override

```yaml
# docker-compose.staging.yml
version: '3.9'

services:
  frontend:
    image: ghcr.io/hrplatform/frontend:${VERSION}
    restart: unless-stopped

  backend:
    image: ghcr.io/hrplatform/backend:${VERSION}
    restart: unless-stopped
    env_file: .env.staging

  websocket:
    image: ghcr.io/hrplatform/websocket:${VERSION}
    restart: unless-stopped

  postgres:
    image: postgres:16-alpine
    restart: unless-stopped
    volumes:
      - postgres-staging-data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    restart: unless-stopped

volumes:
  postgres-staging-data:
```

```bash
# Run staging
docker-compose -f docker-compose.yml -f docker-compose.staging.yml up -d
```

---

## Common Docker Commands

```bash
# Build all images
docker-compose build

# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d backend

# View logs
docker-compose logs -f backend
docker-compose logs -f --tail=50 frontend

# Exec into running container
docker-compose exec backend sh
docker-compose exec postgres psql -U hrplatform

# Stop all
docker-compose down

# Stop and remove volumes (DESTRUCTIVE — deletes DB data)
docker-compose down -v

# Rebuild single image
docker-compose build --no-cache backend

# Check image sizes
docker images | grep hrplatform
```

---

## CI — Build and Push Images

```yaml
# .github/workflows/ci-cd.yml
build-images:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4

    - name: Log in to GitHub Container Registry
      uses: docker/login-action@v3
      with:
        registry: ghcr.io
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}

    - name: Build and push frontend
      uses: docker/build-push-action@v5
      with:
        context: ./frontend
        push: true
        tags: |
          ghcr.io/hrplatform/frontend:${{ github.sha }}
          ghcr.io/hrplatform/frontend:latest
        cache-from: type=gha
        cache-to: type=gha,mode=max

    - name: Build and push backend
      uses: docker/build-push-action@v5
      with:
        context: ./backend
        push: true
        tags: |
          ghcr.io/hrplatform/backend:${{ github.sha }}
          ghcr.io/hrplatform/backend:latest
```

---

## Security Scanning

```bash
# Scan image for vulnerabilities before pushing
docker scout cves ghcr.io/hrplatform/backend:latest

# Or with Trivy
trivy image ghcr.io/hrplatform/backend:latest \
  --severity HIGH,CRITICAL \
  --exit-code 1   # fail CI if HIGH/CRITICAL found
```

Integrated in CI — any HIGH or CRITICAL CVE blocks the build.

---

## .dockerignore

```
# frontend/.dockerignore
node_modules
dist
.git
*.md
.env*
coverage
playwright-report
```
