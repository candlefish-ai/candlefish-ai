# Production Environment Configuration

environment = "production"
aws_region  = "us-east-1"

# Database Configuration
db_username = "paintbox_prod"
db_password = "REPLACE_WITH_SECURE_PASSWORD" # Replace with actual secure password (16+ chars)

# Redis Configuration  
redis_auth_token = "REPLACE_WITH_SECURE_TOKEN" # Replace with actual secure token (32+ chars)

# Application Secrets (placeholders - actual values in Secrets Manager)
salesforce_client_id     = "REPLACE_WITH_ACTUAL_VALUE"
salesforce_client_secret = "REPLACE_WITH_ACTUAL_VALUE"
salesforce_username      = "REPLACE_WITH_ACTUAL_VALUE"
salesforce_password      = "REPLACE_WITH_ACTUAL_VALUE"
salesforce_security_token = "REPLACE_WITH_ACTUAL_VALUE"
salesforce_instance_url  = "https://login.salesforce.com" # Production Salesforce

companycam_api_token     = "REPLACE_WITH_ACTUAL_VALUE"
companycam_webhook_secret = "REPLACE_WITH_ACTUAL_VALUE"

anthropic_api_key = "REPLACE_WITH_ACTUAL_VALUE"

encryption_key   = "REPLACE_WITH_64_CHAR_HEX_KEY"
jwt_secret      = "REPLACE_WITH_32_CHAR_SECRET"  
nextauth_secret = "REPLACE_WITH_32_CHAR_SECRET"

# Monitoring Configuration
enable_detailed_monitoring = true
alert_email                = "production-alerts@candlefish.ai"

# WAF Configuration
enable_waf       = true
waf_rate_limit   = 2000

# Backup Configuration
backup_retention_days = 30

# Auto Scaling Configuration
min_capacity     = 2
max_capacity     = 10
desired_capacity = 2

# Instance Configuration
instance_type = "t3.medium"

# Certificate Configuration
domain_name        = "paintbox.candlefish.ai"
create_certificate = true

# Additional Tags
additional_tags = {
  CostCenter   = "Production"
  Owner        = "Platform"
  Compliance   = "Required"
  BusinessUnit = "CandlefishAI"
}