# Infrastructure Guide
## HR Analytics Platform

> **Related:** Docker setup → `docs/devops/DOCKER.md`
> Deployment procedure → `docs/devops/DEPLOYMENT.md`
> Kubernetes manifest → `HR-platform/k8s/deployment.yaml`

---

## Architecture Overview

```
Internet
    │
    ▼
┌─────────────────────────────┐
│  Cloudflare (DNS + WAF)     │  DDoS protection, CDN edge
└────────────┬────────────────┘
             │
    ┌────────┴────────┐
    │                 │
    ▼                 ▼
┌────────┐     ┌────────────┐
│  CDN   │     │  Load      │
│  (S3 + │     │  Balancer  │  HTTPS termination
│  CF)   │     │  (ALB/Nginx)│
└────────┘     └─────┬──────┘
 Static FE            │
                ┌─────┴──────────────┐
                │                    │
                ▼                    ▼
         ┌──────────┐         ┌──────────┐
         │ Backend  │         │ Backend  │  Kubernetes pods
         │ Pod 1    │         │ Pod 2    │  (auto-scaled)
         └──────┬───┘         └──────┬───┘
                └──────┬─────────────┘
                       │
              ┌────────┴────────┐
              │                 │
              ▼                 ▼
       ┌────────────┐   ┌──────────────┐
       │ PostgreSQL │   │  Redis       │
       │ (Primary + │   │  (Sessions + │
       │  Replica)  │   │   Cache)     │
       └────────────┘   └──────────────┘
              │
              ▼
       ┌────────────┐
       │ WebSocket  │
       │ Server     │  Real-time: attendance, notifications
       └────────────┘
```

---

## Kubernetes

### Cluster Setup

```bash
# Namespace
kubectl create namespace hrplatform

# Apply all manifests
kubectl apply -f HR-platform/k8s/ -n hrplatform

# Verify
kubectl get pods -n hrplatform
kubectl get services -n hrplatform
kubectl get ingress -n hrplatform
```

### Key Manifests (`k8s/`)

```yaml
# k8s/deployment.yaml (existing — already in repo)
# Frontend deployment + Backend deployment + Services

# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: hrplatform-ingress
  annotations:
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  rules:
    - host: hrplatform.com
      http:
        paths:
          - path: /api
            pathType: Prefix
            backend:
              service: { name: backend, port: { number: 3000 } }
          - path: /
            pathType: Prefix
            backend:
              service: { name: frontend, port: { number: 80 } }

# k8s/hpa.yaml — Horizontal Pod Autoscaler
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: backend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: backend
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target: { type: Utilization, averageUtilization: 70 }
```

### Resource Limits

```yaml
resources:
  requests:
    cpu: "250m"
    memory: "256Mi"
  limits:
    cpu: "1000m"
    memory: "512Mi"
```

---

## Nginx (Static Frontend)

```nginx
# /etc/nginx/sites-available/hrplatform
server {
    listen 443 ssl http2;
    server_name hrplatform.com;

    # SSL (managed by certbot / Let's Encrypt)
    ssl_certificate     /etc/letsencrypt/live/hrplatform.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/hrplatform.com/privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;

    root /var/www/hrplatform;
    index index.html;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";

    # Angular SPA routing — send all non-file requests to index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Long-term cache for hashed assets
    location ~* \.(js|css|woff2|svg|png|ico)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # No cache for index.html and manifest
    location ~* (index\.html|manifest\.json|robots\.txt)$ {
        expires 0;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # Proxy API to backend
    location /api {
        proxy_pass         http://backend:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection "upgrade";
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
    }

    # WebSocket
    location /ws {
        proxy_pass         http://websocket:3001;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection "Upgrade";
    }
}

# Redirect HTTP → HTTPS
server {
    listen 80;
    server_name hrplatform.com;
    return 301 https://$host$request_uri;
}
```

---

## Database — PostgreSQL

```bash
# Production: managed PostgreSQL (AWS RDS / Azure Database)
# Connection string stored as secret (docs/devops/SECRETS.md)

# Staging: Docker container
docker run -d \
  --name postgres-staging \
  -e POSTGRES_DB=hrplatform \
  -e POSTGRES_USER=hrplatform \
  -e POSTGRES_PASSWORD=$DB_PASSWORD \
  -p 5432:5432 \
  -v postgres-staging-data:/var/lib/postgresql/data \
  postgres:16-alpine

# Backup (run daily via cron)
pg_dump $DATABASE_URL | gzip > backup-$(date +%Y%m%d).sql.gz
aws s3 cp backup-$(date +%Y%m%d).sql.gz s3://hrplatform-backups/
```

### Connection Pooling (PgBouncer)

```ini
# pgbouncer.ini
[databases]
hrplatform = host=postgres port=5432 dbname=hrplatform

[pgbouncer]
pool_mode = transaction
max_client_conn = 500
default_pool_size = 25
```

---

## Redis

```bash
# Sessions, JWT denylist, WebSocket pub/sub
docker run -d \
  --name redis \
  -p 6379:6379 \
  --requirepass $REDIS_PASSWORD \
  redis:7-alpine redis-server --appendonly yes
```

---

## SSL Certificates

```bash
# Let's Encrypt (free, auto-renews)
certbot --nginx -d hrplatform.com -d staging.hrplatform.com

# Auto-renew (runs via cron)
0 3 * * * certbot renew --quiet && nginx -s reload
```

---

## Environment Sizing

| Environment | Frontend | Backend | DB |
|-------------|----------|---------|-----|
| Staging | 1 pod (0.5 CPU, 256MB) | 1 pod (1 CPU, 512MB) | Shared dev DB |
| Production | 2–4 pods (auto-scale) | 2–10 pods (auto-scale) | RDS Multi-AZ |

---

## Firewall Rules

| Port | Protocol | Source | Purpose |
|------|----------|--------|---------|
| 443 | HTTPS | 0.0.0.0/0 | Public web |
| 80 | HTTP | 0.0.0.0/0 | Redirect to HTTPS |
| 3000 | HTTP | Internal only | Backend API |
| 5432 | TCP | Backend pods only | PostgreSQL |
| 6379 | TCP | Backend pods only | Redis |
| 22 | SSH | DevOps IPs only | Admin access |
