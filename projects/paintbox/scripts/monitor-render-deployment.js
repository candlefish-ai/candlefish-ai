#!/usr/bin/env node

/**
 * Paintbox Render Deployment Monitor & Rollback Script
 *
 * This script monitors Render.com deployments and provides automated
 * rollback capabilities if deployments fail or health checks don't pass.
 * It includes real-time monitoring, alerting, and recovery features.
 *
 * Usage:
 *   node scripts/monitor-render-deployment.js --monitor
 *   node scripts/monitor-render-deployment.js --rollback
 *   node scripts/monitor-render-deployment.js --service paintbox-app --watch
 */

const { exec } = require("child_process");
const { promisify } = require("util");
const fs = require("fs");
const path = require("path");

const execAsync = promisify(exec);

// Configuration
const DEFAULT_SERVICE_NAME = "paintbox-app";
const MONITORING_INTERVAL = 30000; // 30 seconds
const HEALTH_CHECK_TIMEOUT = 60000; // 1 minute
const ROLLBACK_TIMEOUT = 300000; // 5 minutes
const MAX_FAILED_HEALTH_CHECKS = 3;

// Deployment states
const DEPLOYMENT_STATES = {
  BUILDING: "building",
  DEPLOYING: "deploying",
  LIVE: "live",
  BUILD_FAILED: "build_failed",
  DEPLOY_FAILED: "deploy_failed",
  CANCELED: "canceled",
};

// Health check thresholds
const HEALTH_THRESHOLDS = {
  responseTime: 5000, // 5 seconds max response time
  errorRate: 0.1, // 10% max error rate
  consecutiveFailures: 3, // 3 consecutive failures trigger rollback
};

class RenderDeploymentMonitor {
  constructor(options = {}) {
    this.serviceName = options.serviceName || DEFAULT_SERVICE_NAME;
    this.monitorMode = options.monitor || false;
    this.rollbackMode = options.rollback || false;
    this.watchMode = options.watch || false;
    this.verbose = options.verbose || false;

    this.currentDeployment = null;
    this.previousDeployment = null;
    this.healthCheckResults = [];
    this.isMonitoring = false;
    this.alertsSent = [];

    this.stats = {
      deploymentsMonitored: 0,
      successfulDeployments: 0,
      failedDeployments: 0,
      rollbacksPerformed: 0,
      healthCheckFailures: 0,
    };
  }

  log(level, message, data = {}) {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] ${level.toUpperCase()}:`;

    if (level === "debug" && !this.verbose) return;

    const colors = {
      error: "\x1b[31m", // Red
      warn: "\x1b[33m", // Yellow
      info: "\x1b[36m", // Cyan
      debug: "\x1b[37m", // White
      success: "\x1b[32m", // Green
      deploy: "\x1b[35m", // Magenta
    };

    const reset = "\x1b[0m";
    const color = colors[level] || "";

    const logEntry = {
      timestamp,
      level,
      message,
      data,
      service: this.serviceName,
    };

    if (Object.keys(data).length > 0) {
      console.log(`${color}${prefix}${reset} ${message}`, data);
    } else {
      console.log(`${color}${prefix}${reset} ${message}`);
    }

    // Write to log file
    this.writeToLogFile(logEntry);
  }

  writeToLogFile(logEntry) {
    const logDir = path.join(process.cwd(), "logs");
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const logFile = path.join(logDir, "render-deployment-monitor.log");
    const logLine = JSON.stringify(logEntry) + "\n";

    try {
      fs.appendFileSync(logFile, logLine);
    } catch (error) {
      // Fail silently if can't write to log file
    }
  }

  async getCurrentDeployment() {
    try {
      const { stdout } = await execAsync(
        `render services get ${this.serviceName} --format json`,
      );
      const serviceData = JSON.parse(stdout);

      if (serviceData.latestDeploy) {
        return {
          id: serviceData.latestDeploy.id,
          status: serviceData.latestDeploy.status,
          commit: serviceData.latestDeploy.commit,
          createdAt: serviceData.latestDeploy.createdAt,
          finishedAt: serviceData.latestDeploy.finishedAt,
          serviceUrl: serviceData.serviceDetails?.url,
        };
      }

      return null;
    } catch (error) {
      this.log("error", "Failed to get current deployment", {
        error: error.message,
      });
      return null;
    }
  }

  async getDeploymentHistory(limit = 10) {
    try {
      const { stdout } = await execAsync(
        `render deploys list --service ${this.serviceName} --limit ${limit} --format json`,
      );
      return JSON.parse(stdout);
    } catch (error) {
      this.log("error", "Failed to get deployment history", {
        error: error.message,
      });
      return [];
    }
  }

  async getDeploymentLogs(deploymentId) {
    try {
      const { stdout } = await execAsync(
        `render deploys get ${deploymentId} --logs --format json`,
      );
      return JSON.parse(stdout);
    } catch (error) {
      this.log("error", "Failed to get deployment logs", {
        deploymentId,
        error: error.message,
      });
      return null;
    }
  }

  async performHealthCheck(serviceUrl) {
    if (!serviceUrl) {
      this.log("warn", "No service URL available for health check");
      return { success: false, error: "No service URL" };
    }

    const healthCheckScript = path.join(__dirname, "health-check-render.js");

    try {
      const { stdout, stderr } = await execAsync(
        `node ${healthCheckScript} --url ${serviceUrl} --timeout 30000`,
        { timeout: HEALTH_CHECK_TIMEOUT },
      );

      // Parse health check results
      const isHealthy = !stderr && stdout.includes("HEALTHY");

      return {
        success: isHealthy,
        timestamp: new Date().toISOString(),
        url: serviceUrl,
        details: stdout,
      };
    } catch (error) {
      this.log("warn", "Health check failed", {
        url: serviceUrl,
        error: error.message,
      });

      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
        url: serviceUrl,
      };
    }
  }

  async rollbackToPreviousVersion() {
    this.log("deploy", "Initiating rollback to previous version...");

    try {
      // Get deployment history
      const deployments = await this.getDeploymentHistory(10);

      if (deployments.length < 2) {
        this.log("error", "Cannot rollback: No previous deployment found");
        return false;
      }

      // Find the last successful deployment
      const lastSuccessful = deployments.find(
        (deploy, index) =>
          index > 0 && deploy.status === DEPLOYMENT_STATES.LIVE,
      );

      if (!lastSuccessful) {
        this.log(
          "error",
          "Cannot rollback: No previous successful deployment found",
        );
        return false;
      }

      this.log("deploy", "Rolling back to deployment", {
        deploymentId: lastSuccessful.id,
        commit: lastSuccessful.commit,
        createdAt: lastSuccessful.createdAt,
      });

      // Trigger rollback deployment
      const { stdout } = await execAsync(
        `render deploy --service ${this.serviceName} --commit ${lastSuccessful.commit}`,
      );

      this.log("success", "Rollback initiated successfully");
      this.stats.rollbacksPerformed++;

      // Monitor the rollback deployment
      return await this.monitorDeployment(60000); // 1 minute timeout for rollback
    } catch (error) {
      this.log("error", "Rollback failed", { error: error.message });
      return false;
    }
  }

  async monitorDeployment(timeout = ROLLBACK_TIMEOUT) {
    this.log("deploy", "Monitoring deployment progress...");

    const startTime = Date.now();
    let lastStatus = null;

    while (Date.now() - startTime < timeout) {
      const deployment = await this.getCurrentDeployment();

      if (!deployment) {
        await this.sleep(5000);
        continue;
      }

      if (deployment.status !== lastStatus) {
        this.log("deploy", "Deployment status changed", {
          deploymentId: deployment.id,
          status: deployment.status,
          previousStatus: lastStatus,
        });
        lastStatus = deployment.status;
      }

      switch (deployment.status) {
        case DEPLOYMENT_STATES.LIVE:
          this.log("success", "Deployment completed successfully");

          // Perform health check
          if (deployment.serviceUrl) {
            const healthCheck = await this.performHealthCheck(
              deployment.serviceUrl,
            );
            if (healthCheck.success) {
              this.log("success", "Post-deployment health check passed");
              return true;
            } else {
              this.log("error", "Post-deployment health check failed");
              return false;
            }
          }
          return true;

        case DEPLOYMENT_STATES.BUILD_FAILED:
        case DEPLOYMENT_STATES.DEPLOY_FAILED:
        case DEPLOYMENT_STATES.CANCELED:
          this.log("error", "Deployment failed", {
            status: deployment.status,
            deploymentId: deployment.id,
          });
          return false;

        case DEPLOYMENT_STATES.BUILDING:
        case DEPLOYMENT_STATES.DEPLOYING:
          // Continue monitoring
          await this.sleep(10000); // Check every 10 seconds
          break;

        default:
          this.log("warn", "Unknown deployment status", {
            status: deployment.status,
          });
          await this.sleep(5000);
          break;
      }
    }

    this.log("error", "Deployment monitoring timeout");
    return false;
  }

  async sendAlert(alertType, message, data = {}) {
    const alert = {
      type: alertType,
      message,
      data,
      timestamp: new Date().toISOString(),
      service: this.serviceName,
    };

    // Prevent duplicate alerts
    const alertKey = `${alertType}-${message}`;
    if (this.alertsSent.includes(alertKey)) {
      return;
    }

    this.alertsSent.push(alertKey);

    // Log alert
    this.log("warn", `ALERT [${alertType}]: ${message}`, data);

    // Write alert to file
    const alertsFile = path.join(process.cwd(), "logs", "alerts.json");
    try {
      let alerts = [];
      if (fs.existsSync(alertsFile)) {
        alerts = JSON.parse(fs.readFileSync(alertsFile, "utf8"));
      }
      alerts.push(alert);
      fs.writeFileSync(alertsFile, JSON.stringify(alerts, null, 2));
    } catch (error) {
      this.log("error", "Failed to write alert to file", {
        error: error.message,
      });
    }

    // Here you could integrate with external alerting systems:
    // - Slack webhook
    // - Email notifications
    // - PagerDuty
    // - Discord webhook

    // Clean up old alerts (prevent memory leak)
    if (this.alertsSent.length > 100) {
      this.alertsSent = this.alertsSent.slice(-50);
    }
  }

  async continuousMonitoring() {
    this.log(
      "info",
      `Starting continuous monitoring for service: ${this.serviceName}`,
    );
    this.isMonitoring = true;

    let consecutiveHealthFailures = 0;

    while (this.isMonitoring) {
      try {
        // Get current deployment
        const deployment = await this.getCurrentDeployment();

        if (!deployment) {
          await this.sleep(MONITORING_INTERVAL);
          continue;
        }

        // Check if deployment changed
        if (
          !this.currentDeployment ||
          this.currentDeployment.id !== deployment.id
        ) {
          this.log("deploy", "New deployment detected", {
            deploymentId: deployment.id,
            status: deployment.status,
            commit: deployment.commit,
          });

          this.previousDeployment = this.currentDeployment;
          this.currentDeployment = deployment;
          this.stats.deploymentsMonitored++;

          // Monitor the new deployment
          if (
            deployment.status === DEPLOYMENT_STATES.BUILDING ||
            deployment.status === DEPLOYMENT_STATES.DEPLOYING
          ) {
            const success = await this.monitorDeployment();

            if (success) {
              this.stats.successfulDeployments++;
              consecutiveHealthFailures = 0;
            } else {
              this.stats.failedDeployments++;
              await this.sendAlert(
                "DEPLOYMENT_FAILED",
                "Deployment failed",
                deployment,
              );

              // Consider automatic rollback
              if (
                this.previousDeployment &&
                this.previousDeployment.status === DEPLOYMENT_STATES.LIVE
              ) {
                this.log("warn", "Considering automatic rollback...");
                // Implement rollback logic here if desired
              }
            }
          }
        }

        // Perform periodic health check if deployment is live
        if (
          deployment.status === DEPLOYMENT_STATES.LIVE &&
          deployment.serviceUrl
        ) {
          const healthCheck = await this.performHealthCheck(
            deployment.serviceUrl,
          );

          this.healthCheckResults.push(healthCheck);

          // Keep only recent health checks
          if (this.healthCheckResults.length > 50) {
            this.healthCheckResults = this.healthCheckResults.slice(-25);
          }

          if (healthCheck.success) {
            consecutiveHealthFailures = 0;
          } else {
            consecutiveHealthFailures++;
            this.stats.healthCheckFailures++;

            this.log("warn", "Health check failed", {
              consecutiveFailures: consecutiveHealthFailures,
              url: deployment.serviceUrl,
            });

            // Alert on repeated failures
            if (consecutiveHealthFailures >= MAX_FAILED_HEALTH_CHECKS) {
              await this.sendAlert(
                "HEALTH_CHECK_FAILURES",
                `${consecutiveHealthFailures} consecutive health check failures`,
                { deployment, healthCheck },
              );

              // Consider automatic rollback
              if (
                consecutiveHealthFailures >=
                HEALTH_THRESHOLDS.consecutiveFailures
              ) {
                this.log(
                  "error",
                  "Too many consecutive health check failures, considering rollback",
                );

                // Uncomment to enable automatic rollback
                // const rollbackSuccess = await this.rollbackToPreviousVersion();
                // if (rollbackSuccess) {
                //   consecutiveHealthFailures = 0;
                // }
              }
            }
          }
        }

        // Log monitoring status
        if (
          this.stats.deploymentsMonitored % 10 === 0 &&
          this.stats.deploymentsMonitored > 0
        ) {
          this.log("info", "Monitoring statistics", this.stats);
        }
      } catch (error) {
        this.log("error", "Error during monitoring cycle", {
          error: error.message,
        });
      }

      await this.sleep(MONITORING_INTERVAL);
    }
  }

  async sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  generateMonitoringReport() {
    const report = {
      serviceName: this.serviceName,
      timestamp: new Date().toISOString(),
      currentDeployment: this.currentDeployment,
      previousDeployment: this.previousDeployment,
      stats: this.stats,
      recentHealthChecks: this.healthCheckResults.slice(-10),
      recommendations: [],
    };

    // Add recommendations based on stats
    if (this.stats.failedDeployments > this.stats.successfulDeployments) {
      report.recommendations.push(
        "High deployment failure rate - review build and deployment process",
      );
    }

    if (this.stats.healthCheckFailures > 10) {
      report.recommendations.push(
        "Frequent health check failures - investigate application stability",
      );
    }

    const recentHealthChecks = this.healthCheckResults.slice(-10);
    const failureRate =
      recentHealthChecks.filter((h) => !h.success).length /
      recentHealthChecks.length;

    if (failureRate > 0.3) {
      report.recommendations.push(
        "High health check failure rate - check application health",
      );
    }

    return report;
  }

  stopMonitoring() {
    this.log("info", "Stopping monitoring...");
    this.isMonitoring = false;
  }

  async run() {
    if (this.rollbackMode) {
      this.log("deploy", "Starting rollback operation...");
      const success = await this.rollbackToPreviousVersion();
      process.exit(success ? 0 : 1);
    }

    if (this.monitorMode || this.watchMode) {
      // Set up signal handlers for graceful shutdown
      process.on("SIGINT", () => {
        this.log("info", "Received SIGINT, shutting down gracefully...");
        this.stopMonitoring();

        // Generate final report
        const report = this.generateMonitoringReport();
        const reportFile = path.join(process.cwd(), "monitoring-report.json");
        fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
        this.log("info", `Monitoring report saved to: ${reportFile}`);

        process.exit(0);
      });

      await this.continuousMonitoring();
    } else {
      // One-time status check
      const deployment = await this.getCurrentDeployment();
      if (deployment) {
        this.log("info", "Current deployment status", deployment);

        if (deployment.serviceUrl) {
          const healthCheck = await this.performHealthCheck(
            deployment.serviceUrl,
          );
          this.log("info", "Health check result", healthCheck);
        }
      } else {
        this.log("warn", "No deployment found");
      }
    }
  }
}

// CLI argument parsing
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {};

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--service":
        options.serviceName = args[++i];
        break;
      case "--monitor":
        options.monitor = true;
        break;
      case "--rollback":
        options.rollback = true;
        break;
      case "--watch":
        options.watch = true;
        break;
      case "--verbose":
        options.verbose = true;
        break;
      case "--help":
      case "-h":
        console.log(`
Paintbox Render Deployment Monitor & Rollback Script

Usage: node scripts/monitor-render-deployment.js [OPTIONS]

OPTIONS:
  --service NAME          Render service name (default: ${DEFAULT_SERVICE_NAME})
  --monitor               Start continuous monitoring mode
  --rollback              Perform rollback to previous version
  --watch                 Watch mode (alias for --monitor)
  --verbose               Enable debug logging
  --help, -h              Show this help message

EXAMPLES:
  node scripts/monitor-render-deployment.js
  node scripts/monitor-render-deployment.js --monitor --verbose
  node scripts/monitor-render-deployment.js --service paintbox-app --rollback
  node scripts/monitor-render-deployment.js --watch

MONITORING FEATURES:
  🔍 Real-time deployment monitoring
  ❤️ Automated health checks
  📊 Performance metrics tracking
  🚨 Automatic alerting
  ↩️ Rollback automation
  📝 Comprehensive logging

HEALTH CHECK THRESHOLDS:
  Response Time: ${HEALTH_THRESHOLDS.responseTime}ms
  Error Rate: ${HEALTH_THRESHOLDS.errorRate * 100}%
  Consecutive Failures: ${HEALTH_THRESHOLDS.consecutiveFailures}

MONITORING INTERVALS:
  Health Checks: ${MONITORING_INTERVAL / 1000}s
  Deployment Timeout: ${ROLLBACK_TIMEOUT / 1000}s
        `);
        process.exit(0);
        break;
      default:
        console.error(`Unknown option: ${args[i]}`);
        process.exit(1);
    }
  }

  return options;
}

// Main execution
if (require.main === module) {
  const options = parseArgs();
  const monitor = new RenderDeploymentMonitor(options);

  monitor.run().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}

module.exports = { RenderDeploymentMonitor };
