#!/bin/bash

# HR Analytics Platform Deployment Script
# Supports blue-green deployment strategy

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-staging}
VERSION=${2:-latest}
REGISTRY=${REGISTRY:-ghcr.io}
IMAGE_NAME=${IMAGE_NAME:-hr-analytics-platform}
FULL_IMAGE="${REGISTRY}/${IMAGE_NAME}:${VERSION}"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Validate environment
validate_environment() {
    if [[ ! "$ENVIRONMENT" =~ ^(development|staging|production)$ ]]; then
        log_error "Invalid environment: $ENVIRONMENT"
        log_info "Valid environments: development, staging, production"
        exit 1
    fi
    log_success "Environment validated: $ENVIRONMENT"
}

# Build Docker image
build_image() {
    log_info "Building Docker image: $FULL_IMAGE"
    docker build -t "$FULL_IMAGE" .
    log_success "Docker image built successfully"
}

# Push image to registry
push_image() {
    log_info "Pushing image to registry: $FULL_IMAGE"
    docker push "$FULL_IMAGE"
    log_success "Image pushed to registry"
}

# Deploy to staging
deploy_staging() {
    log_info "Deploying to staging environment..."
    
    # Update deployment
    kubectl set image deployment/hr-analytics-staging \
        hr-analytics="$FULL_IMAGE" \
        -n staging
    
    # Wait for rollout
    kubectl rollout status deployment/hr-analytics-staging -n staging
    
    log_success "Staging deployment completed"
}

# Deploy to production (blue-green)
deploy_production() {
    log_info "Deploying to production using blue-green strategy..."
    
    # Determine current active environment
    CURRENT_ENV=$(kubectl get service hr-analytics -n production \
        -o jsonpath='{.spec.selector.version}')
    
    if [ "$CURRENT_ENV" = "blue" ]; then
        TARGET_ENV="green"
    else
        TARGET_ENV="blue"
    fi
    
    log_info "Current environment: $CURRENT_ENV"
    log_info "Target environment: $TARGET_ENV"
    
    # Deploy to target environment
    kubectl set image deployment/hr-analytics-$TARGET_ENV \
        hr-analytics="$FULL_IMAGE" \
        -n production
    
    # Wait for rollout
    kubectl rollout status deployment/hr-analytics-$TARGET_ENV -n production
    
    log_success "Deployment to $TARGET_ENV completed"
    
    # Run health checks
    run_health_checks "$TARGET_ENV"
    
    # Switch traffic if health checks pass
    if [ $? -eq 0 ]; then
        switch_traffic "$TARGET_ENV"
    else
        log_error "Health checks failed, rolling back..."
        kubectl rollout undo deployment/hr-analytics-$TARGET_ENV -n production
        exit 1
    fi
}

# Run health checks
run_health_checks() {
    local env=$1
    local url="https://$env.hr-analytics.example.com"
    local max_attempts=30
    local attempt=0
    
    log_info "Running health checks on $env environment..."
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -sf "$url/api/health" > /dev/null; then
            log_success "Health check passed"
            return 0
        fi
        
        attempt=$((attempt + 1))
        log_warning "Health check attempt $attempt/$max_attempts failed, retrying..."
        sleep 10
    done
    
    log_error "Health checks failed after $max_attempts attempts"
    return 1
}

# Switch traffic
switch_traffic() {
    local target_env=$1
    
    log_info "Switching traffic to $target_env environment..."
    
    kubectl patch service hr-analytics -n production \
        -p "{\"spec\":{\"selector\":{\"version\":\"$target_env\"}}}"
    
    log_success "Traffic switched to $target_env"
}

# Rollback deployment
rollback() {
    local env=$1
    
    log_warning "Rolling back $env deployment..."
    
    kubectl rollout undo deployment/hr-analytics-$env -n $env
    kubectl rollout status deployment/hr-analytics-$env -n $env
    
    log_success "Rollback completed"
}

# Verify deployment
verify_deployment() {
    log_info "Verifying deployment..."
    
    # Check pod status
    kubectl get pods -n "$ENVIRONMENT" -l app=hr-analytics
    
    # Check service status
    kubectl get service hr-analytics -n "$ENVIRONMENT"
    
    log_success "Deployment verification completed"
}

# Main execution
main() {
    log_info "Starting deployment process..."
    log_info "Environment: $ENVIRONMENT"
    log_info "Version: $VERSION"
    
    validate_environment
    build_image
    push_image
    
    case $ENVIRONMENT in
        staging)
            deploy_staging
            ;;
        production)
            deploy_production
            ;;
        development)
            log_info "Development deployment not yet implemented"
            ;;
    esac
    
    verify_deployment
    
    log_success "Deployment completed successfully!"
}

# Error handling
trap 'log_error "Deployment failed"; exit 1' ERR

# Run main function
main "$@"
