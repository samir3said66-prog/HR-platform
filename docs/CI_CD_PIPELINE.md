# CI/CD Pipeline Documentation

## Overview

The HR Analytics Platform uses a comprehensive CI/CD pipeline built with GitHub Actions to automate testing, building, and deployment processes.

## Pipeline Architecture

### Workflow Stages

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Push/PR Event                      │
└────────────────────────┬────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
    ┌────────┐      ┌────────┐      ┌──────────┐
    │  Lint  │      │ Tests  │      │ Security │
    └────────┘      └────────┘      └──────────┘
        │                │                │
        └────────────────┼────────────────┘
                         │
                         ▼
                    ┌─────────┐
                    │  Build  │
                    └────┬────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
    ┌─────────┐    ┌──────────┐    ┌────────────┐
    │ Staging │    │Production│    │Performance │
    │ Deploy  │    │ Deploy   │    │  Testing   │
    └─────────┘    └──────────┘    └────────────┘
```

## Jobs

### 1. Lint & Code Quality

**Trigger**: All pushes and pull requests

**Tasks**:
- Run ESLint for code quality
- Check code formatting with Prettier
- Run TypeScript compiler for type checking

**Failure Handling**: Blocks merge if linting fails

### 2. Unit Tests

**Trigger**: After lint passes

**Tasks**:
- Run unit tests with Vitest
- Generate coverage reports
- Upload coverage to Codecov

**Coverage Requirements**:
- Services: >80%
- Components: >80%
- State Management: >80%

**Failure Handling**: Blocks merge if tests fail

### 3. Build

**Trigger**: After tests pass

**Tasks**:
- Build Angular application
- Analyze bundle size
- Upload build artifacts

**Build Artifacts**:
- Stored for 5 days
- Used for deployment

**Failure Handling**: Blocks deployment if build fails

### 4. Security Scan

**Trigger**: After lint passes

**Tasks**:
- Run npm audit
- Check for vulnerabilities
- Scan dependencies

**Failure Handling**: Warns but doesn't block (can be configured)

### 5. Deploy to Staging

**Trigger**: Push to `develop` branch

**Environment**: Staging

**Tasks**:
- Download build artifacts
- Deploy to staging environment
- Run smoke tests
- Notify deployment status

**URL**: https://staging.hr-analytics.example.com

### 6. Deploy to Production (Blue-Green)

**Trigger**: Push to `main` branch

**Environment**: Production

**Strategy**: Blue-Green Deployment

**Tasks**:
1. Deploy to inactive environment (Blue or Green)
2. Run health checks
3. Switch traffic if healthy
4. Rollback if health checks fail

**URL**: https://hr-analytics.example.com

### 7. Performance Testing

**Trigger**: Pull requests

**Tasks**:
- Run Lighthouse CI
- Analyze performance metrics
- Generate performance reports

**Targets**:
- Lighthouse score: >94
- Performance score: >95
- Accessibility score: >98

### 8. Notify Results

**Trigger**: After all jobs complete

**Tasks**:
- Comment on PR with results
- Create deployment records
- Notify via GitHub status

## Deployment Strategies

### Staging Deployment

**Trigger**: Push to `develop` branch

**Process**:
1. Build Docker image
2. Push to registry
3. Update Kubernetes deployment
4. Wait for rollout
5. Run smoke tests

**Rollback**: Manual via `kubectl rollout undo`

### Production Deployment (Blue-Green)

**Trigger**: Push to `main` branch (requires approval)

**Process**:

1. **Identify Current Environment**
   - Check which environment is active (Blue or Green)
   - Target the inactive environment

2. **Deploy to Target Environment**
   - Build Docker image
   - Push to registry
   - Update target deployment
   - Wait for rollout

3. **Health Checks**
   - Check `/api/health` endpoint
   - Verify database connectivity
   - Verify cache connectivity
   - Verify WebSocket connectivity
   - Retry up to 30 times (5 minutes)

4. **Traffic Switch**
   - If health checks pass: Switch traffic to new environment
   - If health checks fail: Automatic rollback

5. **Verification**
   - Run smoke tests on production
   - Monitor error rates
   - Check performance metrics

**Rollback**: Automatic if health checks fail, or manual via kubectl

## Configuration

### Environment Variables

**GitHub Secrets** (configure in repository settings):

```
AWS_ACCESS_KEY_ID          # AWS credentials
AWS_SECRET_ACCESS_KEY      # AWS credentials
DOCKER_USERNAME            # Docker registry username
DOCKER_PASSWORD            # Docker registry password
SLACK_WEBHOOK_URL          # Slack notifications
SENTRY_AUTH_TOKEN          # Error tracking
```

**GitHub Variables** (configure in repository settings):

```
REGISTRY                   # Container registry (ghcr.io)
IMAGE_NAME                 # Image name
STAGING_BUCKET             # S3 bucket for staging
PROD_BLUE_BUCKET           # S3 bucket for production blue
PROD_GREEN_BUCKET          # S3 bucket for production green
```

### Branch Protection Rules

**Main Branch**:
- Require pull request reviews (2 approvals)
- Require status checks to pass
- Require branches to be up to date
- Require code review from code owners
- Dismiss stale pull request approvals

**Develop Branch**:
- Require pull request reviews (1 approval)
- Require status checks to pass
- Require branches to be up to date

## Health Check Endpoints

The application must expose the following health check endpoints:

### `/api/health`
Basic health check - returns 200 if application is running

```bash
curl https://hr-analytics.example.com/api/health
# Response: { "status": "ok" }
```

### `/api/health/ready`
Readiness check - returns 200 if application is ready to serve traffic

```bash
curl https://hr-analytics.example.com/api/health/ready
# Response: { "status": "ready" }
```

### `/api/health/db`
Database connectivity check

```bash
curl https://hr-analytics.example.com/api/health/db
# Response: { "status": "connected" }
```

### `/api/health/cache`
Cache connectivity check

```bash
curl https://hr-analytics.example.com/api/health/cache
# Response: { "status": "connected" }
```

### `/api/health/websocket`
WebSocket connectivity check

```bash
curl https://hr-analytics.example.com/api/health/websocket
# Response: { "status": "connected" }
```

## Deployment Files

### GitHub Actions Workflows

**Location**: `.github/workflows/`

- `ci-cd.yml` - Main CI/CD pipeline
- `deployment-config.yml` - Deployment configuration documentation

### Deployment Scripts

**Location**: `scripts/`

- `deploy.sh` - Deployment script for manual deployments

### Docker Configuration

**Location**: `Dockerfile`

- Multi-stage build for optimized image size
- Non-root user for security
- Health checks configured
- Proper signal handling with dumb-init

### Kubernetes Configuration

**Location**: `k8s/`

- `deployment.yaml` - Blue-green deployments, services, HPA, network policies

## Monitoring & Logging

### Logs

**GitHub Actions Logs**:
- Available in Actions tab
- Retained for 90 days
- Searchable by workflow, job, step

**Application Logs**:
- Structured logging to stdout
- Aggregated to CloudWatch
- Searchable by timestamp, level, component

### Metrics

**Prometheus Metrics**:
- Application metrics on port 9090
- Scraped by Prometheus
- Visualized in Grafana

**Key Metrics**:
- Request latency
- Error rate
- Active connections
- Database query time
- Cache hit rate

### Alerts

**Sentry Alerts**:
- Error tracking and alerting
- Configured in Sentry dashboard
- Notifications to Slack

**CloudWatch Alarms**:
- High error rate
- High latency
- Low availability
- Resource exhaustion

## Troubleshooting

### Pipeline Failures

**Lint Failures**:
```bash
# Fix formatting
npm run format

# Fix linting issues
npm run lint:fix
```

**Test Failures**:
```bash
# Run tests locally
npm run test

# Run tests with coverage
npm run test:coverage
```

**Build Failures**:
```bash
# Build locally
npm run build

# Check for errors
npm run type-check
```

### Deployment Issues

**Staging Deployment Fails**:
1. Check GitHub Actions logs
2. Verify AWS credentials
3. Check S3 bucket permissions
4. Verify Kubernetes cluster connectivity

**Production Deployment Fails**:
1. Check health check endpoints
2. Verify database connectivity
3. Check WebSocket connectivity
4. Review application logs
5. Rollback to previous version

### Health Check Failures

**Endpoint Returns 500**:
1. Check application logs
2. Verify database connectivity
3. Check environment variables
4. Verify secrets are configured

**Endpoint Timeout**:
1. Check network connectivity
2. Verify firewall rules
3. Check load balancer configuration
4. Verify DNS resolution

## Best Practices

### Commit Messages

Use conventional commits:
```
feat: Add new feature
fix: Fix bug
docs: Update documentation
test: Add tests
chore: Update dependencies
```

### Pull Requests

1. Create PR from feature branch to develop
2. Ensure all checks pass
3. Request code review
4. Address review comments
5. Merge when approved

### Releases

1. Create release branch from develop
2. Update version numbers
3. Update CHANGELOG
4. Create PR to main
5. Merge after approval
6. Tag release in GitHub

## Performance Targets

- **Build Time**: <5 minutes
- **Test Time**: <3 minutes
- **Deployment Time**: <10 minutes
- **Health Check Time**: <5 minutes
- **Total Pipeline Time**: <20 minutes

## Security

### Secrets Management

- Store secrets in GitHub Secrets
- Never commit secrets to repository
- Rotate secrets regularly
- Use least privilege access

### Container Security

- Run as non-root user
- Use read-only root filesystem
- Drop unnecessary capabilities
- Scan images for vulnerabilities

### Network Security

- Use HTTPS/TLS
- Implement network policies
- Restrict ingress/egress
- Use service mesh for mTLS

## Support

For CI/CD pipeline issues:
- Check GitHub Actions logs
- Review deployment configuration
- Contact DevOps team
- Check Sentry for errors
