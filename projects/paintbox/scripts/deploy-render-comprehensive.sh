#!/bin/bash

# Paintbox Comprehensive Render.com Deployment Script
# This script provides a complete deployment pipeline for Paintbox to Render.com
# with AWS Secrets Manager integration, validation, and monitoring

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
RENDER_SERVICE_NAME="paintbox-app"
RENDER_REGION="oregon"
AWS_SECRET_NAME="paintbox/secrets"
REQUIRED_ENV_VARS=(
    "NODE_ENV"
    "ANTHROPIC_API_KEY"
    "COMPANYCAM_API_KEY"
    "COMPANYCAM_COMPANY_ID"
    "SALESFORCE_CLIENT_ID"
    "SALESFORCE_CLIENT_SECRET"
    "SALESFORCE_USERNAME"
    "SALESFORCE_PASSWORD"
    "SALESFORCE_SECURITY_TOKEN"
)

# Logging functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_debug() {
    echo -e "${BLUE}[DEBUG]${NC} $1"
}

# Error handling
handle_error() {
    local exit_code=$?
    log_error "Deployment failed at line $1 with exit code $exit_code"
    cleanup
    exit $exit_code
}

trap 'handle_error $LINENO' ERR

# Cleanup function
cleanup() {
    log_info "Cleaning up temporary files..."
    rm -f "$PROJECT_ROOT/.env.render" 2>/dev/null || true
    rm -f "$PROJECT_ROOT/render-secrets.json" 2>/dev/null || true
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Install dependencies
install_dependencies() {
    log_info "Installing required dependencies..."

    # Install Node.js dependencies
    if [ ! -d "$PROJECT_ROOT/node_modules" ]; then
        log_info "Installing Node.js dependencies..."
        cd "$PROJECT_ROOT"
        npm install
    fi

    # Install Render CLI
    if ! command_exists render; then
        log_info "Installing Render CLI..."
        if command_exists brew; then
            brew install render
        elif command_exists npm; then
            npm install -g @render-com/render-cli
        else
            log_error "Cannot install Render CLI. Please install brew or npm first."
            exit 1
        fi
    else
        log_info "Render CLI already installed"
    fi

    # Install AWS CLI
    if ! command_exists aws; then
        log_info "Installing AWS CLI..."
        if command_exists brew; then
            brew install awscli
        else
            log_warn "AWS CLI not found. Please install manually: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
        fi
    else
        log_info "AWS CLI already installed"
    fi

    # Install jq for JSON processing
    if ! command_exists jq; then
        log_info "Installing jq..."
        if command_exists brew; then
            brew install jq
        elif command_exists apt-get; then
            sudo apt-get install -y jq
        else
            log_warn "jq not found. Some features may not work properly."
        fi
    fi
}

# Check AWS credentials
check_aws_credentials() {
    log_info "Checking AWS credentials..."

    # Try Infisical first
    if command_exists infisical; then
        log_info "Attempting to load credentials from Infisical..."
        if infisical run --env=prod -- aws sts get-caller-identity >/dev/null 2>&1; then
            log_info "Successfully authenticated with AWS via Infisical"
            export USE_INFISICAL=true
            return 0
        fi
    fi

    # Check standard AWS credentials
    if aws sts get-caller-identity >/dev/null 2>&1; then
        log_info "Successfully authenticated with AWS"
        return 0
    fi

    # Check environment variables
    if [[ -n "$AWS_ACCESS_KEY_ID" && -n "$AWS_SECRET_ACCESS_KEY" ]]; then
        log_info "Using AWS credentials from environment variables"
        return 0
    fi

    log_error "No valid AWS credentials found. Please set up AWS credentials using one of:"
    log_error "1. infisical login (preferred)"
    log_error "2. aws configure"
    log_error "3. Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables"
    exit 1
}

# Fetch secrets from AWS Secrets Manager
fetch_aws_secrets() {
    log_info "Fetching secrets from AWS Secrets Manager..."

    local aws_cmd="aws"
    if [[ "$USE_INFISICAL" == "true" ]]; then
        aws_cmd="infisical run --env=prod -- aws"
    fi

    # Fetch the secret
    local secret_value
    if ! secret_value=$($aws_cmd secretsmanager get-secret-value --secret-id "$AWS_SECRET_NAME" --query SecretString --output text 2>/dev/null); then
        log_error "Failed to fetch secret '$AWS_SECRET_NAME' from AWS Secrets Manager"
        log_error "Please ensure the secret exists and you have proper permissions"
        exit 1
    fi

    # Parse and validate JSON
    if ! echo "$secret_value" | jq . >/dev/null 2>&1; then
        log_error "Secret value is not valid JSON"
        exit 1
    fi

    echo "$secret_value" > "$PROJECT_ROOT/render-secrets.json"
    log_info "Successfully fetched secrets from AWS"
}

# Extract environment variables from secrets
extract_env_vars() {
    log_info "Extracting environment variables from secrets..."

    if [ ! -f "$PROJECT_ROOT/render-secrets.json" ]; then
        log_error "Secrets file not found. Run fetch_aws_secrets first."
        exit 1
    fi

    local secrets_file="$PROJECT_ROOT/render-secrets.json"
    local env_file="$PROJECT_ROOT/.env.render"

    # Create environment file
    cat > "$env_file" << EOF
# Render Environment Variables
# Generated automatically by deploy-render-comprehensive.sh
NODE_ENV=production
PORT=3000
SALESFORCE_LOGIN_URL=https://test.salesforce.com
EOF

    # Extract secrets using jq
    if command_exists jq; then
        # Extract Anthropic API key
        local anthropic_key
        anthropic_key=$(jq -r '.anthropic?.apiKey // .ANTHROPIC_API_KEY // ""' "$secrets_file")
        if [[ -n "$anthropic_key" && "$anthropic_key" != "null" ]]; then
            echo "ANTHROPIC_API_KEY=$anthropic_key" >> "$env_file"
        fi

        # Extract CompanyCam credentials
        local companycam_key companycam_id
        companycam_key=$(jq -r '.companyCam?.apiToken // .COMPANYCAM_API_KEY // ""' "$secrets_file")
        companycam_id=$(jq -r '.companyCam?.companyId // .COMPANYCAM_COMPANY_ID // ""' "$secrets_file")

        if [[ -n "$companycam_key" && "$companycam_key" != "null" ]]; then
            echo "COMPANYCAM_API_KEY=$companycam_key" >> "$env_file"
        fi
        if [[ -n "$companycam_id" && "$companycam_id" != "null" ]]; then
            echo "COMPANYCAM_COMPANY_ID=$companycam_id" >> "$env_file"
        fi

        # Extract Salesforce credentials
        local sf_client_id sf_client_secret sf_username sf_password sf_token
        sf_client_id=$(jq -r '.salesforce?.clientId // .SALESFORCE_CLIENT_ID // ""' "$secrets_file")
        sf_client_secret=$(jq -r '.salesforce?.clientSecret // .SALESFORCE_CLIENT_SECRET // ""' "$secrets_file")
        sf_username=$(jq -r '.salesforce?.username // .SALESFORCE_USERNAME // ""' "$secrets_file")
        sf_password=$(jq -r '.salesforce?.password // .SALESFORCE_PASSWORD // ""' "$secrets_file")
        sf_token=$(jq -r '.salesforce?.securityToken // .SALESFORCE_SECURITY_TOKEN // ""' "$secrets_file")

        if [[ -n "$sf_client_id" && "$sf_client_id" != "null" ]]; then
            echo "SALESFORCE_CLIENT_ID=$sf_client_id" >> "$env_file"
        fi
        if [[ -n "$sf_client_secret" && "$sf_client_secret" != "null" ]]; then
            echo "SALESFORCE_CLIENT_SECRET=$sf_client_secret" >> "$env_file"
        fi
        if [[ -n "$sf_username" && "$sf_username" != "null" ]]; then
            echo "SALESFORCE_USERNAME=$sf_username" >> "$env_file"
        fi
        if [[ -n "$sf_password" && "$sf_password" != "null" ]]; then
            echo "SALESFORCE_PASSWORD=$sf_password" >> "$env_file"
        fi
        if [[ -n "$sf_token" && "$sf_token" != "null" ]]; then
            echo "SALESFORCE_SECURITY_TOKEN=$sf_token" >> "$env_file"
        fi
    else
        log_warn "jq not available. Manual secret extraction required."
    fi

    log_info "Environment variables extracted to .env.render"
}

# Validate required environment variables
validate_env_vars() {
    log_info "Validating required environment variables..."

    local env_file="$PROJECT_ROOT/.env.render"
    local missing_vars=()

    if [ ! -f "$env_file" ]; then
        log_error "Environment file not found: $env_file"
        exit 1
    fi

    # Source the environment file
    export $(grep -v '^#' "$env_file" | xargs)

    # Check required variables
    for var in "${REQUIRED_ENV_VARS[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done

    if [ ${#missing_vars[@]} -gt 0 ]; then
        log_error "Missing required environment variables:"
        for var in "${missing_vars[@]}"; do
            log_error "  - $var"
        done
        log_error "Please check your AWS Secrets Manager configuration"
        exit 1
    fi

    log_info "All required environment variables are present"
}

# Build the application
build_application() {
    log_info "Building the application..."

    cd "$PROJECT_ROOT"

    # Clean previous builds
    rm -rf .next dist

    # Install dependencies
    npm install

    # Run build
    if ! npm run build; then
        log_error "Build failed. Please fix errors before deploying."
        exit 1
    fi

    log_info "Build completed successfully"
}

# Authenticate with Render
authenticate_render() {
    log_info "Authenticating with Render..."

    # Check if already authenticated
    if render auth whoami >/dev/null 2>&1; then
        log_info "Already authenticated with Render"
        return 0
    fi

    # Check for API key in environment
    if [ -n "$RENDER_API_KEY" ]; then
        log_info "Using RENDER_API_KEY from environment"
        render auth login --api-key "$RENDER_API_KEY"
        return 0
    fi

    # Interactive login
    log_info "Please authenticate with Render. This will open a browser window."
    if ! render auth login; then
        log_error "Failed to authenticate with Render"
        exit 1
    fi

    log_info "Successfully authenticated with Render"
}

# Create or update Render service
deploy_to_render() {
    log_info "Deploying to Render..."

    local env_file="$PROJECT_ROOT/.env.render"

    # Check if service exists
    local service_exists=false
    if render services list --format json | jq -r '.[].name' | grep -q "^$RENDER_SERVICE_NAME$"; then
        service_exists=true
        log_info "Service '$RENDER_SERVICE_NAME' already exists. Updating..."
    else
        log_info "Creating new service '$RENDER_SERVICE_NAME'..."
    fi

    # Prepare environment variables for Render CLI
    local env_vars=()
    while IFS='=' read -r key value; do
        if [[ -n "$key" && ! "$key" =~ ^# ]]; then
            env_vars+=("--env" "$key=$value")
        fi
    done < "$env_file"

    if [ "$service_exists" = true ]; then
        # Update existing service
        log_info "Updating service environment variables..."
        for ((i=0; i<${#env_vars[@]}; i+=2)); do
            local flag="${env_vars[i]}"
            local var="${env_vars[i+1]}"
            render services update "$RENDER_SERVICE_NAME" "$flag" "$var"
        done

        # Trigger deployment
        log_info "Triggering deployment..."
        render deploy --service "$RENDER_SERVICE_NAME"
    else
        # Create new service
        log_error "Service creation through CLI not fully supported yet."
        log_error "Please create the service manually in the Render dashboard first."
        log_error "Then run this script again to update environment variables."
        exit 1
    fi
}

# Wait for deployment to complete
wait_for_deployment() {
    log_info "Waiting for deployment to complete..."

    local max_attempts=30
    local attempt=0
    local deployment_id

    # Get latest deployment
    deployment_id=$(render services get "$RENDER_SERVICE_NAME" --format json | jq -r '.latestDeploy.id')

    while [ $attempt -lt $max_attempts ]; do
        local status
        status=$(render deploys get "$deployment_id" --format json | jq -r '.status')

        case "$status" in
            "live")
                log_info "Deployment completed successfully!"
                return 0
                ;;
            "build_failed"|"deploy_failed"|"canceled")
                log_error "Deployment failed with status: $status"
                return 1
                ;;
            "building"|"deploying")
                log_info "Deployment in progress... (attempt $((attempt + 1))/$max_attempts)"
                sleep 30
                ;;
        esac

        ((attempt++))
    done

    log_warn "Deployment status check timed out"
    return 1
}

# Health check
health_check() {
    log_info "Performing health check..."

    local service_url
    service_url=$(render services get "$RENDER_SERVICE_NAME" --format json | jq -r '.serviceDetails.url')

    if [ -z "$service_url" ] || [ "$service_url" = "null" ]; then
        log_error "Could not determine service URL"
        return 1
    fi

    log_info "Service URL: $service_url"

    # Wait for service to be available
    local max_attempts=10
    local attempt=0

    while [ $attempt -lt $max_attempts ]; do
        if curl -f -s "$service_url/api/health" >/dev/null 2>&1; then
            log_info "Health check passed!"
            log_info "Service is running at: $service_url"
            return 0
        fi

        log_info "Health check failed, retrying... (attempt $((attempt + 1))/$max_attempts)"
        sleep 15
        ((attempt++))
    done

    log_warn "Health check timed out, but deployment may still be successful"
    log_warn "Please check manually: $service_url"
    return 0
}

# Main deployment flow
main() {
    log_info "🎨 Paintbox Comprehensive Render Deployment"
    log_info "============================================"

    # Change to project directory
    cd "$PROJECT_ROOT"

    # Deployment steps
    install_dependencies
    check_aws_credentials
    fetch_aws_secrets
    extract_env_vars
    validate_env_vars
    build_application
    authenticate_render
    deploy_to_render
    wait_for_deployment
    health_check

    # Cleanup
    cleanup

    log_info "🎉 Deployment completed successfully!"
    log_info ""
    log_info "Next steps:"
    log_info "1. Test your application functionality"
    log_info "2. Monitor logs: render logs --service $RENDER_SERVICE_NAME"
    log_info "3. Check metrics in Render dashboard"
    log_info ""
    log_info "Troubleshooting:"
    log_info "- View deployment logs: render deploys get <deployment-id> --logs"
    log_info "- Check service status: render services get $RENDER_SERVICE_NAME"
    log_info "- Monitor performance: render metrics --service $RENDER_SERVICE_NAME"
}

# Help function
show_help() {
    cat << EOF
Paintbox Comprehensive Render Deployment Script

Usage: $0 [OPTIONS]

OPTIONS:
    -h, --help              Show this help message
    -s, --service NAME      Set service name (default: paintbox-app)
    -r, --region REGION     Set region (default: oregon)
    --skip-build           Skip the build step
    --skip-health-check    Skip the health check
    --dry-run              Show what would be done without executing

ENVIRONMENT VARIABLES:
    RENDER_API_KEY         Render API key for authentication
    AWS_SECRET_NAME        AWS Secrets Manager secret name (default: paintbox/secrets)
    USE_INFISICAL          Use Infisical for AWS credential management

EXAMPLES:
    $0                              # Standard deployment
    $0 --service my-paintbox        # Deploy with custom service name
    $0 --dry-run                    # Preview deployment steps
    $0 --skip-health-check          # Deploy without health check

EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -s|--service)
            RENDER_SERVICE_NAME="$2"
            shift 2
            ;;
        -r|--region)
            RENDER_REGION="$2"
            shift 2
            ;;
        --skip-build)
            SKIP_BUILD=true
            shift
            ;;
        --skip-health-check)
            SKIP_HEALTH_CHECK=true
            shift
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        *)
            log_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Execute main function if not dry run
if [ "$DRY_RUN" = true ]; then
    log_info "DRY RUN - Would execute the following steps:"
    log_info "1. Install dependencies"
    log_info "2. Check AWS credentials"
    log_info "3. Fetch secrets from AWS Secrets Manager"
    log_info "4. Extract environment variables"
    log_info "5. Validate environment variables"
    if [ "$SKIP_BUILD" != true ]; then
        log_info "6. Build application"
    fi
    log_info "7. Authenticate with Render"
    log_info "8. Deploy to Render service: $RENDER_SERVICE_NAME"
    log_info "9. Wait for deployment completion"
    if [ "$SKIP_HEALTH_CHECK" != true ]; then
        log_info "10. Perform health check"
    fi
else
    main "$@"
fi
