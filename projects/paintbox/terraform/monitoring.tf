# CloudWatch Monitoring and Alerting Configuration

# SNS Topic for Alerts
resource "aws_sns_topic" "paintbox_alerts" {
  name              = "paintbox-alerts-${var.environment}"
  kms_master_key_id = aws_kms_key.paintbox.arn

  tags = local.common_tags
}

resource "aws_sns_topic_subscription" "email_alerts" {
  topic_arn = aws_sns_topic.paintbox_alerts.arn
  protocol  = "email"
  endpoint  = var.alert_email
}

# CloudWatch Alarms for Database
resource "aws_cloudwatch_metric_alarm" "database_cpu" {
  alarm_name          = "paintbox-database-cpu-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/RDS"
  period              = "300"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "This metric monitors RDS CPU utilization"
  alarm_actions       = [aws_sns_topic.paintbox_alerts.arn]

  dimensions = {
    DBInstanceIdentifier = aws_db_instance.paintbox.id
  }

  tags = local.common_tags
}

resource "aws_cloudwatch_metric_alarm" "database_connections" {
  alarm_name          = "paintbox-database-connections-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "DatabaseConnections"
  namespace           = "AWS/RDS"
  period              = "300"
  statistic           = "Average"
  threshold           = "40"
  alarm_description   = "This metric monitors RDS connection count"
  alarm_actions       = [aws_sns_topic.paintbox_alerts.arn]

  dimensions = {
    DBInstanceIdentifier = aws_db_instance.paintbox.id
  }

  tags = local.common_tags
}

resource "aws_cloudwatch_metric_alarm" "database_storage" {
  alarm_name          = "paintbox-database-storage-${var.environment}"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "FreeStorageSpace"
  namespace           = "AWS/RDS"
  period              = "300"
  statistic           = "Average"
  threshold           = "2000000000" # 2GB in bytes
  alarm_description   = "This metric monitors RDS free storage space"
  alarm_actions       = [aws_sns_topic.paintbox_alerts.arn]

  dimensions = {
    DBInstanceIdentifier = aws_db_instance.paintbox.id
  }

  tags = local.common_tags
}

# CloudWatch Alarms for Redis
resource "aws_cloudwatch_metric_alarm" "redis_cpu" {
  alarm_name          = "paintbox-redis-cpu-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ElastiCache"
  period              = "300"
  statistic           = "Average"
  threshold           = "75"
  alarm_description   = "This metric monitors ElastiCache CPU utilization"
  alarm_actions       = [aws_sns_topic.paintbox_alerts.arn]

  dimensions = {
    CacheClusterId = "${aws_elasticache_replication_group.paintbox.replication_group_id}-001"
  }

  tags = local.common_tags
}

resource "aws_cloudwatch_metric_alarm" "redis_memory" {
  alarm_name          = "paintbox-redis-memory-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "DatabaseMemoryUsagePercentage"
  namespace           = "AWS/ElastiCache"
  period              = "300"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "This metric monitors ElastiCache memory utilization"
  alarm_actions       = [aws_sns_topic.paintbox_alerts.arn]

  dimensions = {
    CacheClusterId = "${aws_elasticache_replication_group.paintbox.replication_group_id}-001"
  }

  tags = local.common_tags
}

# Custom CloudWatch Dashboard
resource "aws_cloudwatch_dashboard" "paintbox" {
  dashboard_name = "Paintbox-${var.environment}"

  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "metric"
        x      = 0
        y      = 0
        width  = 12
        height = 6

        properties = {
          metrics = [
            ["AWS/RDS", "CPUUtilization", "DBInstanceIdentifier", aws_db_instance.paintbox.id],
            [".", "DatabaseConnections", ".", "."],
            [".", "FreeStorageSpace", ".", "."]
          ]
          view    = "timeSeries"
          stacked = false
          region  = var.aws_region
          title   = "RDS Metrics"
          period  = 300
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 6
        width  = 12
        height = 6

        properties = {
          metrics = [
            ["AWS/ElastiCache", "CPUUtilization", "CacheClusterId", "${aws_elasticache_replication_group.paintbox.replication_group_id}-001"],
            [".", "DatabaseMemoryUsagePercentage", ".", "."],
            [".", "CurrConnections", ".", "."]
          ]
          view    = "timeSeries"
          stacked = false
          region  = var.aws_region
          title   = "ElastiCache Metrics"
          period  = 300
        }
      },
      {
        type   = "log"
        x      = 0
        y      = 12
        width  = 12
        height = 6

        properties = {
          query   = "SOURCE '${aws_cloudwatch_log_group.paintbox_app.name}' | fields @timestamp, @message | filter @message like /ERROR/ | sort @timestamp desc | limit 100"
          region  = var.aws_region
          title   = "Application Errors"
        }
      },
      {
        type   = "log"
        x      = 0
        y      = 18
        width  = 12
        height = 6

        properties = {
          query   = "SOURCE '${aws_cloudwatch_log_group.paintbox_api.name}' | fields @timestamp, @message | filter @message like /5[0-9][0-9]/ | sort @timestamp desc | limit 100"
          region  = var.aws_region
          title   = "API Server Errors"
        }
      }
    ]
  })

  tags = local.common_tags
}

# CloudWatch Log Metric Filters
resource "aws_cloudwatch_log_metric_filter" "error_count" {
  name           = "paintbox-error-count-${var.environment}"
  log_group_name = aws_cloudwatch_log_group.paintbox_app.name
  pattern        = "ERROR"

  metric_transformation {
    name      = "ErrorCount"
    namespace = "Paintbox/${var.environment}"
    value     = "1"
  }
}

resource "aws_cloudwatch_log_metric_filter" "api_errors" {
  name           = "paintbox-api-errors-${var.environment}"
  log_group_name = aws_cloudwatch_log_group.paintbox_api.name
  pattern        = "[timestamp, request_id, level=\"ERROR\", ...]"

  metric_transformation {
    name      = "APIErrors"
    namespace = "Paintbox/${var.environment}"
    value     = "1"
  }
}

# CloudWatch Alarm for Error Rate
resource "aws_cloudwatch_metric_alarm" "high_error_rate" {
  alarm_name          = "paintbox-high-error-rate-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "ErrorCount"
  namespace           = "Paintbox/${var.environment}"
  period              = "300"
  statistic           = "Sum"
  threshold           = "10"
  alarm_description   = "High error rate detected"
  alarm_actions       = [aws_sns_topic.paintbox_alerts.arn]
  treat_missing_data  = "notBreaching"

  tags = local.common_tags
}

# CloudWatch Insights Queries
resource "aws_cloudwatch_query_definition" "error_analysis" {
  name = "paintbox-error-analysis-${var.environment}"

  log_group_names = [
    aws_cloudwatch_log_group.paintbox_app.name,
    aws_cloudwatch_log_group.paintbox_api.name
  ]

  query_string = <<EOF
fields @timestamp, @message, @logStream
| filter @message like /ERROR/
| stats count() by bin(5m)
| sort @timestamp desc
EOF
}

resource "aws_cloudwatch_query_definition" "performance_analysis" {
  name = "paintbox-performance-analysis-${var.environment}"

  log_group_names = [
    aws_cloudwatch_log_group.paintbox_api.name
  ]

  query_string = <<EOF
fields @timestamp, @message, @requestId, @duration
| filter @type = "REPORT"
| stats avg(@duration), max(@duration), min(@duration) by bin(5m)
| sort @timestamp desc
EOF
}

# EventBridge Rule for Security Events
resource "aws_cloudwatch_event_rule" "security_events" {
  name        = "paintbox-security-events-${var.environment}"
  description = "Capture security-related events"

  event_pattern = jsonencode({
    source      = ["aws.secretsmanager", "aws.kms", "aws.iam"]
    detail-type = ["AWS API Call via CloudTrail"]
  })

  tags = local.common_tags
}

resource "aws_cloudwatch_event_target" "security_events_sns" {
  rule      = aws_cloudwatch_event_rule.security_events.name
  target_id = "SendToSNS"
  arn       = aws_sns_topic.paintbox_alerts.arn
}

# CloudTrail for Security Auditing
resource "aws_cloudtrail" "paintbox_security" {
  count = var.environment == "production" ? 1 : 0

  name           = "paintbox-security-trail-${var.environment}"
  s3_bucket_name = aws_s3_bucket.cloudtrail[0].bucket
  s3_key_prefix  = "security-logs"

  include_global_service_events = true
  is_multi_region_trail         = true
  enable_logging                = true

  kms_key_id = aws_kms_key.paintbox.arn

  event_selector {
    read_write_type                 = "All"
    include_management_events       = true
    data_resource {
      type   = "AWS::S3::Object"
      values = ["${aws_s3_bucket.cloudtrail[0].arn}/*"]
    }
  }

  tags = local.common_tags

  depends_on = [aws_s3_bucket_policy.cloudtrail[0]]
}

# S3 Bucket for CloudTrail (Production only)
resource "aws_s3_bucket" "cloudtrail" {
  count = var.environment == "production" ? 1 : 0

  bucket        = "paintbox-cloudtrail-${var.environment}-${random_id.bucket_suffix[0].hex}"
  force_destroy = false

  tags = local.common_tags
}

resource "aws_s3_bucket_policy" "cloudtrail" {
  count = var.environment == "production" ? 1 : 0

  bucket = aws_s3_bucket.cloudtrail[0].id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AWSCloudTrailAclCheck"
        Effect = "Allow"
        Principal = {
          Service = "cloudtrail.amazonaws.com"
        }
        Action   = "s3:GetBucketAcl"
        Resource = aws_s3_bucket.cloudtrail[0].arn
      },
      {
        Sid    = "AWSCloudTrailWrite"
        Effect = "Allow"
        Principal = {
          Service = "cloudtrail.amazonaws.com"
        }
        Action   = "s3:PutObject"
        Resource = "${aws_s3_bucket.cloudtrail[0].arn}/*"
        Condition = {
          StringEquals = {
            "s3:x-amz-acl" = "bucket-owner-full-control"
          }
        }
      }
    ]
  })
}

resource "aws_s3_bucket_server_side_encryption_configuration" "cloudtrail" {
  count = var.environment == "production" ? 1 : 0

  bucket = aws_s3_bucket.cloudtrail[0].bucket

  rule {
    apply_server_side_encryption_by_default {
      kms_master_key_id = aws_kms_key.paintbox.arn
      sse_algorithm     = "aws:kms"
    }
  }
}

resource "aws_s3_bucket_versioning" "cloudtrail" {
  count = var.environment == "production" ? 1 : 0

  bucket = aws_s3_bucket.cloudtrail[0].id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "cloudtrail" {
  count = var.environment == "production" ? 1 : 0

  bucket = aws_s3_bucket.cloudtrail[0].bucket

  rule {
    id     = "security_logs_lifecycle"
    status = "Enabled"

    expiration {
      days = 90
    }

    noncurrent_version_expiration {
      noncurrent_days = 30
    }
  }
}

resource "random_id" "bucket_suffix" {
  count = var.environment == "production" ? 1 : 0

  byte_length = 8
}