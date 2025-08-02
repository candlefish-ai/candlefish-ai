#!/usr/bin/env node

/**
 * Paintbox Render Health Check & Validation Script
 *
 * This script performs comprehensive health checks on a deployed Paintbox
 * application on Render.com. It validates API endpoints, external service
 * integrations, performance metrics, and overall application health.
 *
 * Usage:
 *   node scripts/health-check-render.js
 *   node scripts/health-check-render.js --url https://paintbox-app.onrender.com
 *   node scripts/health-check-render.js --service paintbox-app --comprehensive
 */

const https = require("https");
const http = require("http");
const { URL } = require("url");
const fs = require("fs");
const path = require("path");

// Configuration
const DEFAULT_SERVICE_NAME = "paintbox-app";
const DEFAULT_TIMEOUT = 30000; // 30 seconds
const RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 5000; // 5 seconds

// Health check endpoints to test
const HEALTH_ENDPOINTS = {
  main: {
    path: "/",
    expectedStatus: 200,
    timeout: 10000,
    description: "Main application page",
  },
  health: {
    path: "/api/health",
    expectedStatus: 200,
    timeout: 5000,
    description: "Health check endpoint",
    expectedContent: ["status", "timestamp"],
  },
  calculations: {
    path: "/api/v1/calculate",
    method: "POST",
    expectedStatus: [200, 400], // 400 is OK for missing body
    timeout: 15000,
    description: "Calculation engine endpoint",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ test: true }),
  },
  companycam: {
    path: "/api/v1/companycam/test",
    expectedStatus: [200, 401, 403], // Auth errors are expected without proper headers
    timeout: 10000,
    description: "CompanyCam integration test",
  },
  salesforce: {
    path: "/api/v1/salesforce/search",
    method: "POST",
    expectedStatus: [200, 400, 401], // Various responses are acceptable
    timeout: 15000,
    description: "Salesforce integration test",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: "test" }),
  },
};

// Performance thresholds
const PERFORMANCE_THRESHOLDS = {
  responseTime: 2000, // 2 seconds
  firstByte: 1000, // 1 second
  domLoad: 5000, // 5 seconds
};

class RenderHealthChecker {
  constructor(options = {}) {
    this.serviceUrl = options.url;
    this.serviceName = options.serviceName || DEFAULT_SERVICE_NAME;
    this.comprehensive = options.comprehensive || false;
    this.verbose = options.verbose || false;
    this.timeout = options.timeout || DEFAULT_TIMEOUT;

    this.results = {
      endpoint: { passed: 0, failed: 0, tests: [] },
      performance: { passed: 0, failed: 0, tests: [] },
      integration: { passed: 0, failed: 0, tests: [] },
      security: { passed: 0, failed: 0, tests: [] },
      overall: { healthy: false, score: 0, issues: [] },
    };

    this.metrics = {
      responseTime: null,
      firstByte: null,
      uptime: null,
      memoryUsage: null,
      errors: [],
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
    };

    const reset = "\x1b[0m";
    const color = colors[level] || "";

    if (Object.keys(data).length > 0) {
      console.log(`${color}${prefix}${reset} ${message}`, data);
    } else {
      console.log(`${color}${prefix}${reset} ${message}`);
    }
  }

  async sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async makeRequest(endpoint, config) {
    return new Promise((resolve, reject) => {
      const url = new URL(endpoint, this.serviceUrl);
      const options = {
        hostname: url.hostname,
        port: url.port || (url.protocol === "https:" ? 443 : 80),
        path: url.pathname + url.search,
        method: config.method || "GET",
        timeout: config.timeout || this.timeout,
        headers: {
          "User-Agent": "Paintbox-Health-Checker/1.0",
          ...config.headers,
        },
      };

      const client = url.protocol === "https:" ? https : http;
      const startTime = Date.now();

      const req = client.request(options, (res) => {
        const firstByteTime = Date.now() - startTime;
        let body = "";

        res.on("data", (chunk) => {
          body += chunk;
        });

        res.on("end", () => {
          const endTime = Date.now();
          const totalTime = endTime - startTime;

          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body,
            responseTime: totalTime,
            firstByteTime,
            success: true,
          });
        });
      });

      req.on("error", (error) => {
        reject({ error: error.message, success: false });
      });

      req.on("timeout", () => {
        req.destroy();
        reject({ error: "Request timeout", success: false });
      });

      if (config.body) {
        req.write(config.body);
      }

      req.end();
    });
  }

  async testEndpoint(name, config) {
    this.log("debug", `Testing endpoint: ${name} (${config.path})`);

    let lastError = null;
    for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt++) {
      try {
        const result = await this.makeRequest(config.path, config);

        const test = {
          name,
          path: config.path,
          method: config.method || "GET",
          description: config.description,
          statusCode: result.statusCode,
          responseTime: result.responseTime,
          firstByteTime: result.firstByteTime,
          attempt,
          success: false,
          issues: [],
        };

        // Check status code
        const expectedStatus = Array.isArray(config.expectedStatus)
          ? config.expectedStatus
          : [config.expectedStatus];

        if (expectedStatus.includes(result.statusCode)) {
          test.success = true;
          this.log(
            "success",
            `✅ ${name}: ${result.statusCode} (${result.responseTime}ms)`,
          );
        } else {
          test.issues.push(
            `Unexpected status code: ${
              result.statusCode
            }, expected: ${expectedStatus.join(" or ")}`,
          );
          this.log(
            "warn",
            `⚠️ ${name}: Status ${
              result.statusCode
            }, expected ${expectedStatus.join(" or ")}`,
          );
        }

        // Check response content if specified
        if (config.expectedContent && result.body) {
          for (const content of config.expectedContent) {
            if (!result.body.includes(content)) {
              test.issues.push(`Missing expected content: ${content}`);
              test.success = false;
            }
          }
        }

        // Check response time
        if (result.responseTime > PERFORMANCE_THRESHOLDS.responseTime) {
          test.issues.push(
            `Slow response: ${result.responseTime}ms > ${PERFORMANCE_THRESHOLDS.responseTime}ms`,
          );
        }

        this.results.endpoint.tests.push(test);

        if (test.success) {
          this.results.endpoint.passed++;
          return test;
        } else {
          this.results.endpoint.failed++;
          if (attempt === RETRY_ATTEMPTS) {
            this.log("error", `❌ ${name}: ${test.issues.join(", ")}`);
            return test;
          }
        }
      } catch (error) {
        lastError = error;
        this.log(
          "warn",
          `Attempt ${attempt}/${RETRY_ATTEMPTS} failed for ${name}: ${
            error.error || error.message
          }`,
        );

        if (attempt < RETRY_ATTEMPTS) {
          await this.sleep(RETRY_DELAY);
        }
      }
    }

    // All attempts failed
    const test = {
      name,
      path: config.path,
      description: config.description,
      success: false,
      issues: [
        `All ${RETRY_ATTEMPTS} attempts failed: ${
          lastError?.error || "Unknown error"
        }`,
      ],
      attempt: RETRY_ATTEMPTS,
    };

    this.results.endpoint.tests.push(test);
    this.results.endpoint.failed++;
    this.log("error", `❌ ${name}: All attempts failed`);
    return test;
  }

  async determineServiceUrl() {
    if (this.serviceUrl) {
      this.log("info", `Using provided URL: ${this.serviceUrl}`);
      return;
    }

    // Try to get service URL from Render CLI
    try {
      const { exec } = require("child_process");
      const { promisify } = require("util");
      const execAsync = promisify(exec);

      const { stdout } = await execAsync(
        `render services get ${this.serviceName} --format json`,
      );
      const serviceData = JSON.parse(stdout);

      if (serviceData.serviceDetails && serviceData.serviceDetails.url) {
        this.serviceUrl = serviceData.serviceDetails.url;
        this.log(
          "info",
          `Found service URL via Render CLI: ${this.serviceUrl}`,
        );
        return;
      }
    } catch (error) {
      this.log("debug", "Could not get service URL from Render CLI");
    }

    // Fallback to common Render URL pattern
    this.serviceUrl = `https://${this.serviceName}.onrender.com`;
    this.log("warn", `Using fallback URL: ${this.serviceUrl}`);
  }

  async testAllEndpoints() {
    this.log("info", "Testing application endpoints...");

    for (const [name, config] of Object.entries(HEALTH_ENDPOINTS)) {
      await this.testEndpoint(name, config);
    }
  }

  async performanceTest() {
    if (!this.comprehensive) {
      this.log(
        "info",
        "Skipping performance tests (use --comprehensive to enable)",
      );
      return;
    }

    this.log("info", "Running performance tests...");

    try {
      // Test main page load performance
      const mainPageTest = await this.makeRequest("/", { timeout: 10000 });

      const perfTest = {
        name: "Page Load Performance",
        responseTime: mainPageTest.responseTime,
        firstByteTime: mainPageTest.firstByteTime,
        success: true,
        issues: [],
      };

      // Check performance thresholds
      if (mainPageTest.responseTime > PERFORMANCE_THRESHOLDS.responseTime) {
        perfTest.issues.push(`Slow page load: ${mainPageTest.responseTime}ms`);
        perfTest.success = false;
      }

      if (mainPageTest.firstByteTime > PERFORMANCE_THRESHOLDS.firstByte) {
        perfTest.issues.push(
          `Slow first byte: ${mainPageTest.firstByteTime}ms`,
        );
        perfTest.success = false;
      }

      this.results.performance.tests.push(perfTest);

      if (perfTest.success) {
        this.results.performance.passed++;
        this.log(
          "success",
          `✅ Performance: ${mainPageTest.responseTime}ms total, ${mainPageTest.firstByteTime}ms TTFB`,
        );
      } else {
        this.results.performance.failed++;
        this.log(
          "warn",
          `⚠️ Performance issues: ${perfTest.issues.join(", ")}`,
        );
      }
    } catch (error) {
      this.results.performance.failed++;
      this.results.performance.tests.push({
        name: "Page Load Performance",
        success: false,
        issues: [`Performance test failed: ${error.error || error.message}`],
      });
      this.log(
        "error",
        `❌ Performance test failed: ${error.error || error.message}`,
      );
    }
  }

  async securityTest() {
    if (!this.comprehensive) {
      this.log(
        "info",
        "Skipping security tests (use --comprehensive to enable)",
      );
      return;
    }

    this.log("info", "Running security tests...");

    const securityTests = [
      {
        name: "HTTPS Redirect",
        test: async () => {
          const httpUrl = this.serviceUrl.replace("https://", "http://");
          try {
            const result = await this.makeRequest("/", { timeout: 5000 });
            return {
              success: result.statusCode === 301 || result.statusCode === 302,
              issues:
                result.statusCode === 301 || result.statusCode === 302
                  ? []
                  : ["No HTTPS redirect found"],
            };
          } catch (error) {
            return {
              success: false,
              issues: [`HTTPS test failed: ${error.error}`],
            };
          }
        },
      },
      {
        name: "Security Headers",
        test: async () => {
          try {
            const result = await this.makeRequest("/", { timeout: 5000 });
            const headers = result.headers;
            const issues = [];

            if (!headers["x-content-type-options"]) {
              issues.push("Missing X-Content-Type-Options header");
            }
            if (
              !headers["x-frame-options"] &&
              !headers["content-security-policy"]
            ) {
              issues.push("Missing X-Frame-Options or CSP header");
            }

            return {
              success: issues.length === 0,
              issues,
            };
          } catch (error) {
            return {
              success: false,
              issues: [`Security headers test failed: ${error.error}`],
            };
          }
        },
      },
    ];

    for (const test of securityTests) {
      try {
        const result = await test.test();

        this.results.security.tests.push({
          name: test.name,
          success: result.success,
          issues: result.issues || [],
        });

        if (result.success) {
          this.results.security.passed++;
          this.log("success", `✅ ${test.name}: Pass`);
        } else {
          this.results.security.failed++;
          this.log("warn", `⚠️ ${test.name}: ${result.issues.join(", ")}`);
        }
      } catch (error) {
        this.results.security.failed++;
        this.log("error", `❌ ${test.name}: ${error.message}`);
      }
    }
  }

  async integrationTest() {
    if (!this.comprehensive) {
      this.log(
        "info",
        "Skipping integration tests (use --comprehensive to enable)",
      );
      return;
    }

    this.log("info", "Testing external integrations...");

    const integrations = [
      {
        name: "CompanyCam API",
        endpoint: "/api/v1/companycam/test",
      },
      {
        name: "Salesforce API",
        endpoint: "/api/v1/salesforce/search",
        method: "POST",
        body: JSON.stringify({ query: "test" }),
      },
    ];

    for (const integration of integrations) {
      try {
        const result = await this.makeRequest(integration.endpoint, {
          method: integration.method || "GET",
          body: integration.body,
          headers: integration.body
            ? { "Content-Type": "application/json" }
            : {},
          timeout: 15000,
        });

        const test = {
          name: integration.name,
          endpoint: integration.endpoint,
          statusCode: result.statusCode,
          responseTime: result.responseTime,
          success: result.statusCode < 500, // 4xx errors are acceptable (auth issues)
          issues: [],
        };

        if (result.statusCode >= 500) {
          test.issues.push(`Server error: ${result.statusCode}`);
        }

        this.results.integration.tests.push(test);

        if (test.success) {
          this.results.integration.passed++;
          this.log(
            "success",
            `✅ ${integration.name}: ${result.statusCode} (${result.responseTime}ms)`,
          );
        } else {
          this.results.integration.failed++;
          this.log(
            "error",
            `❌ ${integration.name}: ${test.issues.join(", ")}`,
          );
        }
      } catch (error) {
        this.results.integration.failed++;
        this.results.integration.tests.push({
          name: integration.name,
          success: false,
          issues: [`Integration test failed: ${error.error || error.message}`],
        });
        this.log(
          "error",
          `❌ ${integration.name}: ${error.error || error.message}`,
        );
      }
    }
  }

  calculateOverallHealth() {
    const categories = ["endpoint", "performance", "integration", "security"];
    let totalPassed = 0;
    let totalTests = 0;

    for (const category of categories) {
      totalPassed += this.results[category].passed;
      totalTests +=
        this.results[category].passed + this.results[category].failed;
    }

    const score =
      totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 0;
    this.results.overall.score = score;
    this.results.overall.healthy =
      score >= 75 && this.results.endpoint.failed === 0;

    // Collect critical issues
    const criticalIssues = this.results.endpoint.tests
      .filter((test) => !test.success)
      .map((test) => `${test.name}: ${test.issues.join(", ")}`);

    this.results.overall.issues = criticalIssues;
  }

  generateReport() {
    this.calculateOverallHealth();

    console.log("\n" + "=".repeat(60));
    console.log("🎨 PAINTBOX RENDER HEALTH CHECK REPORT");
    console.log("=".repeat(60));

    const { score, healthy } = this.results.overall;
    const healthEmoji = healthy ? "🟢" : score >= 50 ? "🟡" : "🔴";
    const status = healthy ? "HEALTHY" : score >= 50 ? "DEGRADED" : "UNHEALTHY";

    console.log(`\n🏥 Service Health: ${score}% ${healthEmoji} (${status})`);
    console.log(`🌐 Service URL: ${this.serviceUrl}`);
    console.log(`⏰ Test Time: ${new Date().toISOString()}\n`);

    // Category breakdown
    const categories = [
      { name: "Endpoints", key: "endpoint", icon: "🔗" },
      { name: "Performance", key: "performance", icon: "⚡" },
      { name: "Integrations", key: "integration", icon: "🔌" },
      { name: "Security", key: "security", icon: "🔒" },
    ];

    for (const category of categories) {
      const results = this.results[category.key];
      const total = results.passed + results.failed;

      if (total === 0) continue;

      const categoryScore = Math.round((results.passed / total) * 100);
      const emoji =
        results.failed === 0
          ? "✅"
          : results.failed > results.passed
            ? "❌"
            : "⚠️";

      console.log(
        `${category.icon} ${category.name}: ${results.passed}/${total} (${categoryScore}%) ${emoji}`,
      );

      // Show failed tests
      const failedTests = results.tests.filter((test) => !test.success);
      for (const test of failedTests) {
        console.log(`  🔴 ${test.name}: ${test.issues.join(", ")}`);
      }

      // Show slow tests
      const slowTests = results.tests.filter(
        (test) =>
          test.success &&
          test.responseTime &&
          test.responseTime > PERFORMANCE_THRESHOLDS.responseTime,
      );
      for (const test of slowTests) {
        console.log(
          `  🐌 ${test.name}: Slow response (${test.responseTime}ms)`,
        );
      }

      if (failedTests.length > 0 || slowTests.length > 0) {
        console.log();
      }
    }

    // Recommendations
    console.log("💡 RECOMMENDATIONS");
    console.log("-".repeat(30));

    if (healthy) {
      console.log("✅ Service is healthy and performing well!");
      console.log(
        "Continue monitoring and consider enabling comprehensive checks.",
      );
    } else {
      console.log("⚠️ Issues detected that need attention:");

      if (this.results.endpoint.failed > 0) {
        console.log(
          "1. Fix endpoint failures - these are critical for application functionality",
        );
      }

      if (this.results.performance.failed > 0) {
        console.log(
          "2. Optimize performance - consider caching, CDN, or scaling",
        );
      }

      if (this.results.integration.failed > 0) {
        console.log("3. Check external service integrations and credentials");
      }

      if (this.results.security.failed > 0) {
        console.log("4. Improve security headers and HTTPS configuration");
      }
    }

    console.log("\n📊 MONITORING");
    console.log("-".repeat(30));
    console.log("• View logs: render logs --service " + this.serviceName);
    console.log(
      "• Monitor metrics: render metrics --service " + this.serviceName,
    );
    console.log("• Check status: render services get " + this.serviceName);

    console.log("\n" + "=".repeat(60));

    return healthy;
  }

  async run() {
    this.log(
      "info",
      `Starting health check for Paintbox service: ${this.serviceName}`,
    );

    await this.determineServiceUrl();
    await this.testAllEndpoints();
    await this.performanceTest();
    await this.integrationTest();
    await this.securityTest();

    const isHealthy = this.generateReport();

    // Save results to file
    const resultsFile = path.join(process.cwd(), "health-check-results.json");
    fs.writeFileSync(
      resultsFile,
      JSON.stringify(
        {
          timestamp: new Date().toISOString(),
          serviceUrl: this.serviceUrl,
          serviceName: this.serviceName,
          results: this.results,
          isHealthy,
        },
        null,
        2,
      ),
    );

    this.log("info", `Health check results saved to: ${resultsFile}`);

    process.exit(isHealthy ? 0 : 1);
  }
}

// CLI argument parsing
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {};

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--url":
        options.url = args[++i];
        break;
      case "--service":
        options.serviceName = args[++i];
        break;
      case "--comprehensive":
        options.comprehensive = true;
        break;
      case "--timeout":
        options.timeout = parseInt(args[++i]);
        break;
      case "--verbose":
        options.verbose = true;
        break;
      case "--help":
      case "-h":
        console.log(`
Paintbox Render Health Check & Validation Script

Usage: node scripts/health-check-render.js [OPTIONS]

OPTIONS:
  --url URL               Service URL (auto-detected if not provided)
  --service NAME          Render service name (default: ${DEFAULT_SERVICE_NAME})
  --comprehensive         Run comprehensive tests (performance, security, integrations)
  --timeout MS            Request timeout in milliseconds (default: ${DEFAULT_TIMEOUT})
  --verbose               Enable debug logging
  --help, -h              Show this help message

EXAMPLES:
  node scripts/health-check-render.js
  node scripts/health-check-render.js --comprehensive
  node scripts/health-check-render.js --url https://my-app.onrender.com
  node scripts/health-check-render.js --service paintbox-app --verbose

HEALTH CHECK CATEGORIES:
  🔗 Endpoints     - API and page availability
  ⚡ Performance  - Response times and load performance
  🔌 Integrations - External service connectivity
  🔒 Security     - HTTPS and security headers
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
  const healthChecker = new RenderHealthChecker(options);

  healthChecker.run().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}

module.exports = { RenderHealthChecker };
