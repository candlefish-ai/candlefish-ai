# Terraform Variables for Paintbox Infrastructure

variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
  
  validation {
    condition     = can(regex("^[a-z]+-[a-z]+-[0-9]+$", var.aws_region))
    error_message = "AWS region must be a valid region format."
  }
}

variable "environment" {
  description = "Environment name (staging, production)"
  type        = string
  
  validation {
    condition     = contains(["staging", "production"], var.environment)
    error_message = "Environment must be either 'staging' or 'production'."
  }
}

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "paintbox"
}

# Database Variables
variable "db_username" {
  description = "Database master username"
  type        = string
  default     = "paintbox_admin"
  sensitive   = true
}

variable "db_password" {
  description = "Database master password"
  type        = string
  sensitive   = true
  
  validation {
    condition     = length(var.db_password) >= 16
    error_message = "Database password must be at least 16 characters long."
  }
}

# Redis Variables
variable "redis_auth_token" {
  description = "Redis authentication token"
  type        = string
  sensitive   = true
  
  validation {
    condition     = length(var.redis_auth_token) >= 32
    error_message = "Redis auth token must be at least 32 characters long."
  }
}

# Application Secrets
variable "salesforce_client_id" {
  description = "Salesforce OAuth client ID"
  type        = string
  sensitive   = true
}

variable "salesforce_client_secret" {
  description = "Salesforce OAuth client secret"
  type        = string
  sensitive   = true
}

variable "salesforce_username" {
  description = "Salesforce username"
  type        = string
  sensitive   = true
}

variable "salesforce_password" {
  description = "Salesforce password"
  type        = string
  sensitive   = true
}

variable "salesforce_security_token" {
  description = "Salesforce security token"
  type        = string
  sensitive   = true
}

variable "salesforce_instance_url" {
  description = "Salesforce instance URL"
  type        = string
  default     = "https://kindhomesolutions1--bartsand.sandbox.my.salesforce.com"
}

variable "companycam_api_token" {
  description = "Company Cam API token"
  type        = string
  sensitive   = true
}

variable "companycam_webhook_secret" {
  description = "Company Cam webhook secret"
  type        = string
  sensitive   = true
}

variable "anthropic_api_key" {
  description = "Anthropic API key"
  type        = string
  sensitive   = true
}

variable "encryption_key" {
  description = "Application encryption key"
  type        = string
  sensitive   = true
  
  validation {
    condition     = length(var.encryption_key) == 64
    error_message = "Encryption key must be exactly 64 characters long."
  }
}

variable "jwt_secret" {
  description = "JWT signing secret"
  type        = string
  sensitive   = true
  
  validation {
    condition     = length(var.jwt_secret) >= 32
    error_message = "JWT secret must be at least 32 characters long."
  }
}

variable "nextauth_secret" {
  description = "NextAuth.js secret"
  type        = string
  sensitive   = true
  
  validation {
    condition     = length(var.nextauth_secret) >= 32
    error_message = "NextAuth secret must be at least 32 characters long."
  }
}

# Monitoring Variables
variable "enable_detailed_monitoring" {
  description = "Enable detailed CloudWatch monitoring"
  type        = bool
  default     = false
}

variable "alert_email" {
  description = "Email address for alerts"
  type        = string
  default     = "alerts@candlefish.ai"
  
  validation {
    condition     = can(regex("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$", var.alert_email))
    error_message = "Alert email must be a valid email address."
  }
}

# WAF Variables
variable "enable_waf" {
  description = "Enable AWS WAF for web application firewall"
  type        = bool
  default     = true
}

variable "waf_rate_limit" {
  description = "WAF rate limit per 5-minute period"
  type        = number
  default     = 2000
  
  validation {
    condition     = var.waf_rate_limit >= 100 && var.waf_rate_limit <= 20000
    error_message = "WAF rate limit must be between 100 and 20000."
  }
}

# Backup Variables
variable "backup_retention_days" {
  description = "Number of days to retain backups"
  type        = number
  default     = 30
  
  validation {
    condition     = var.backup_retention_days >= 1 && var.backup_retention_days <= 90
    error_message = "Backup retention days must be between 1 and 90."
  }
}

# Auto Scaling Variables
variable "min_capacity" {
  description = "Minimum number of instances"
  type        = number
  default     = 1
}

variable "max_capacity" {
  description = "Maximum number of instances"
  type        = number
  default     = 10
}

variable "desired_capacity" {
  description = "Desired number of instances"
  type        = number
  default     = 2
}

# Instance Variables
variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.medium"
  
  validation {
    condition = contains([
      "t3.micro", "t3.small", "t3.medium", "t3.large",
      "t3a.micro", "t3a.small", "t3a.medium", "t3a.large",
      "m5.large", "m5.xlarge", "m5.2xlarge"
    ], var.instance_type)
    error_message = "Instance type must be a supported type."
  }
}

# Certificate Variables
variable "domain_name" {
  description = "Domain name for SSL certificate"
  type        = string
  default     = ""
}

variable "create_certificate" {
  description = "Create ACM certificate for domain"
  type        = bool
  default     = false
}

# Tags
variable "additional_tags" {
  description = "Additional tags to apply to resources"
  type        = map(string)
  default     = {}
}