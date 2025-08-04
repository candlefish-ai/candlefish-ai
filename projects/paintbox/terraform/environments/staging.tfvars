# Staging Environment Configuration

environment = "staging"
aws_region  = "us-east-1"

# Database Configuration
db_username = "paintbox_staging"
db_password = "REPLACE_WITH_SECURE_PASSWORD" # Replace with actual secure password

# Redis Configuration  
redis_auth_token = "REPLACE_WITH_SECURE_TOKEN" # Replace with actual secure token

# Application Secrets (placeholders - actual values in Secrets Manager)
salesforce_client_id     = "REPLACE_WITH_ACTUAL_VALUE"
salesforce_client_secret = "REPLACE_WITH_ACTUAL_VALUE"
salesforce_username      = "REPLACE_WITH_ACTUAL_VALUE"
salesforce_password      = "REPLACE_WITH_ACTUAL_VALUE"
salesforce_security_token = "REPLACE_WITH_ACTUAL_VALUE"
salesforce_instance_url  = "https://kindhomesolutions1--bartsand.sandbox.my.salesforce.com"

companycam_api_token     = "REPLACE_WITH_ACTUAL_VALUE"
companycam_webhook_secret = "REPLACE_WITH_ACTUAL_VALUE"

anthropic_api_key = "REPLACE_WITH_ACTUAL_VALUE"

encryption_key   = "REPLACE_WITH_64_CHAR_HEX_KEY"
jwt_secret      = "REPLACE_WITH_32_CHAR_SECRET"
nextauth_secret = "REPLACE_WITH_32_CHAR_SECRET"

# Monitoring Configuration
enable_detailed_monitoring = false
alert_email                = "staging-alerts@candlefish.ai"

# WAF Configuration
enable_waf       = true
waf_rate_limit   = 1000

# Backup Configuration
backup_retention_days = 7

# Auto Scaling Configuration
min_capacity     = 1
max_capacity     = 3
desired_capacity = 1

# Instance Configuration
instance_type = "t3.small"

# Certificate Configuration
domain_name        = ""
create_certificate = false

# Additional Tags
additional_tags = {
  CostCenter = "Development"
  Owner      = "DevTeam"
}