#!/usr/bin/env node

/**
 * Paintbox Render Configuration Validator
 *
 * This script validates the Render.com service configuration and deployment
 * readiness. It checks environment variables, service settings, dependencies,
 * and external service connectivity.
 *
 * Usage:
 *   node scripts/validate-render-config.js
 *   node scripts/validate-render-config.js --check-connectivity
 *   node scripts/validate-render-config.js --service paintbox-app
 */

const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const { promisify } = require("util");

const execAsync = promisify(exec);

// Configuration
const DEFAULT_SERVICE_NAME = "paintbox-app";
const PROJECT_ROOT = path.dirname(__dirname);

// Required files for deployment
const REQUIRED_FILES = [
  "package.json",
  "next.config.ts",
  "app/layout.tsx",
  "app/page.tsx",
  "render.yaml",
];

// Required npm scripts
const REQUIRED_SCRIPTS = ["build", "start"];

// Port and networking requirements
const REQUIRED_PORTS = {
  HTTP: 3000,
  WEBSOCKET: 3001,
};

// External services to validate
const EXTERNAL_SERVICES = {
  SALESFORCE: {
    name: "Salesforce",
    testUrl: "https://test.salesforce.com",
    requiredEnvVars: [
      "SALESFORCE_CLIENT_ID",
      "SALESFORCE_CLIENT_SECRET",
      "SALESFORCE_USERNAME",
    ],
  },
  COMPANYCAM: {
    name: "CompanyCam",
    testUrl: "https://api.companycam.com/v2/user",
    requiredEnvVars: ["COMPANYCAM_API_KEY"],
  },
  ANTHROPIC: {
    name: "Anthropic",
    testUrl: "https://api.anthropic.com",
    requiredEnvVars: ["ANTHROPIC_API_KEY"],
  },
};

class RenderConfigValidator {
  constructor(options = {}) {
    this.serviceName = options.serviceName || DEFAULT_SERVICE_NAME;
    this.checkConnectivity = options.checkConnectivity || false;
    this.verbose = options.verbose || false;

    this.results = {
      files: { passed: 0, failed: 0, issues: [] },
      dependencies: { passed: 0, failed: 0, issues: [] },
      environment: { passed: 0, failed: 0, issues: [] },
      configuration: { passed: 0, failed: 0, issues: [] },
      connectivity: { passed: 0, failed: 0, issues: [] },
      overall: { score: 0, status: "unknown" },
    };
  }

  log(level, message, data = {}) {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] ${level.toUpperCase()}:`;

    if (level === "debug" && !this.verbose) return;

    if (Object.keys(data).length > 0) {
      console.log(`${prefix} ${message}`, data);
    } else {
      console.log(`${prefix} ${message}`);
    }
  }

  addIssue(category, severity, message, suggestion = null) {
    const issue = { severity, message, suggestion };
    this.results[category].issues.push(issue);

    if (severity === "error") {
      this.results[category].failed++;
    } else {
      this.results[category].passed++;
    }

    this.log(
      severity === "error" ? "error" : "warn",
      `[${category.toUpperCase()}] ${message}`,
    );
    if (suggestion) {
      this.log("info", `  💡 Suggestion: ${suggestion}`);
    }
  }

  async validateFiles() {
    this.log("info", "Validating required files...");

    for (const file of REQUIRED_FILES) {
      const filePath = path.join(PROJECT_ROOT, file);

      if (fs.existsSync(filePath)) {
        this.log("debug", `✅ Found: ${file}`);
        this.results.files.passed++;
      } else {
        this.addIssue(
          "files",
          "error",
          `Missing required file: ${file}`,
          `Create ${file} or check if it's in the correct location`,
        );
      }
    }

    // Check package.json content
    const packageJsonPath = path.join(PROJECT_ROOT, "package.json");
    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(
          fs.readFileSync(packageJsonPath, "utf8"),
        );

        // Validate scripts
        for (const script of REQUIRED_SCRIPTS) {
          if (packageJson.scripts && packageJson.scripts[script]) {
            this.log("debug", `✅ Found script: ${script}`);
            this.results.dependencies.passed++;
          } else {
            this.addIssue(
              "dependencies",
              "error",
              `Missing required npm script: ${script}`,
              `Add "${script}" script to package.json`,
            );
          }
        }

        // Check critical dependencies
        const criticalDeps = ["next", "react", "typescript"];
        for (const dep of criticalDeps) {
          if (packageJson.dependencies && packageJson.dependencies[dep]) {
            this.log("debug", `✅ Found dependency: ${dep}`);
            this.results.dependencies.passed++;
          } else {
            this.addIssue(
              "dependencies",
              "error",
              `Missing critical dependency: ${dep}`,
              `Install ${dep} with: npm install ${dep}`,
            );
          }
        }
      } catch (error) {
        this.addIssue(
          "files",
          "error",
          "package.json is not valid JSON",
          "Fix JSON syntax errors in package.json",
        );
      }
    }
  }

  async validateEnvironmentVariables() {
    this.log("info", "Validating environment variables...");

    // Check for .env.render file
    const envRenderPath = path.join(PROJECT_ROOT, ".env.render");
    const envVars = new Map();

    if (fs.existsSync(envRenderPath)) {
      try {
        const envContent = fs.readFileSync(envRenderPath, "utf8");
        const lines = envContent
          .split("\n")
          .filter((line) => line.trim() && !line.trim().startsWith("#"));

        for (const line of lines) {
          const [key, ...valueParts] = line.split("=");
          if (key && valueParts.length > 0) {
            envVars.set(key.trim(), valueParts.join("=").trim());
          }
        }

        this.log(
          "info",
          `Found ${envVars.size} environment variables in .env.render`,
        );
        this.results.environment.passed++;
      } catch (error) {
        this.addIssue(
          "environment",
          "error",
          "Failed to read .env.render file",
          "Check file permissions and format",
        );
      }
    } else {
      this.addIssue(
        "environment",
        "error",
        ".env.render file not found",
        "Run: node scripts/fetch-render-secrets.js",
      );
      return;
    }

    // Validate critical environment variables
    const criticalEnvVars = [
      "NODE_ENV",
      "ANTHROPIC_API_KEY",
      "COMPANYCAM_API_KEY",
      "SALESFORCE_CLIENT_ID",
      "SALESFORCE_CLIENT_SECRET",
      "SALESFORCE_USERNAME",
      "SALESFORCE_PASSWORD",
    ];

    for (const envVar of criticalEnvVars) {
      if (envVars.has(envVar) && envVars.get(envVar)) {
        this.log("debug", `✅ Found: ${envVar}`);
        this.results.environment.passed++;
      } else {
        this.addIssue(
          "environment",
          "error",
          `Missing or empty environment variable: ${envVar}`,
          "Check AWS Secrets Manager configuration",
        );
      }
    }

    // Validate environment variable formats
    if (envVars.has("ANTHROPIC_API_KEY")) {
      const key = envVars.get("ANTHROPIC_API_KEY");
      if (!key.startsWith("sk-ant-")) {
        this.addIssue(
          "environment",
          "warn",
          "ANTHROPIC_API_KEY format may be invalid",
          'Verify the API key starts with "sk-ant-"',
        );
      }
    }

    if (envVars.has("SALESFORCE_USERNAME")) {
      const username = envVars.get("SALESFORCE_USERNAME");
      if (!username.includes("@")) {
        this.addIssue(
          "environment",
          "warn",
          "SALESFORCE_USERNAME should be an email address",
          "Verify the username format",
        );
      }
    }
  }

  async validateRenderConfiguration() {
    this.log("info", "Validating render.yaml configuration...");

    const renderConfigPath = path.join(PROJECT_ROOT, "render.yaml");

    if (!fs.existsSync(renderConfigPath)) {
      this.addIssue(
        "configuration",
        "error",
        "render.yaml not found",
        "Create render.yaml based on the template",
      );
      return;
    }

    try {
      const yaml = require("js-yaml");
      const renderConfig = yaml.load(fs.readFileSync(renderConfigPath, "utf8"));

      // Validate service configuration
      if (!renderConfig.services || !Array.isArray(renderConfig.services)) {
        this.addIssue(
          "configuration",
          "error",
          "No services defined in render.yaml",
          "Add at least one web service",
        );
        return;
      }

      const webService = renderConfig.services.find((s) => s.type === "web");
      if (!webService) {
        this.addIssue(
          "configuration",
          "error",
          "No web service found in render.yaml",
          "Add a web service definition",
        );
        return;
      }

      // Validate web service properties
      const requiredProps = ["name", "runtime", "buildCommand", "startCommand"];
      for (const prop of requiredProps) {
        if (webService[prop]) {
          this.log("debug", `✅ Found service property: ${prop}`);
          this.results.configuration.passed++;
        } else {
          this.addIssue(
            "configuration",
            "error",
            `Missing service property: ${prop}`,
            `Add ${prop} to the web service configuration`,
          );
        }
      }

      // Validate build and start commands
      if (
        webService.buildCommand &&
        !webService.buildCommand.includes("npm run build")
      ) {
        this.addIssue(
          "configuration",
          "warn",
          "Build command may not be correct",
          'Ensure build command includes "npm run build"',
        );
      }

      if (webService.startCommand && !webService.startCommand.includes("npm")) {
        this.addIssue(
          "configuration",
          "warn",
          "Start command may not be correct",
          "Ensure start command uses npm to start the app",
        );
      }

      // Check for Redis service if caching is used
      const redisService = renderConfig.services.find(
        (s) => s.type === "redis",
      );
      if (!redisService) {
        this.addIssue(
          "configuration",
          "warn",
          "No Redis service found",
          "Add Redis service for caching (recommended)",
        );
      }
    } catch (error) {
      if (error.code === "MODULE_NOT_FOUND") {
        this.addIssue(
          "configuration",
          "warn",
          "js-yaml module not found, skipping YAML validation",
          "Install js-yaml for full validation: npm install js-yaml",
        );
      } else {
        this.addIssue(
          "configuration",
          "error",
          `Invalid render.yaml: ${error.message}`,
          "Fix YAML syntax errors",
        );
      }
    }
  }

  async testConnectivity() {
    if (!this.checkConnectivity) {
      this.log(
        "info",
        "Skipping connectivity tests (use --check-connectivity to enable)",
      );
      return;
    }

    this.log("info", "Testing external service connectivity...");

    for (const [serviceKey, service] of Object.entries(EXTERNAL_SERVICES)) {
      try {
        this.log("debug", `Testing ${service.name}...`);

        // Check if required environment variables are present
        const envPath = path.join(PROJECT_ROOT, ".env.render");
        let hasRequiredVars = true;

        if (fs.existsSync(envPath)) {
          const envContent = fs.readFileSync(envPath, "utf8");

          for (const envVar of service.requiredEnvVars) {
            if (!envContent.includes(`${envVar}=`)) {
              hasRequiredVars = false;
              break;
            }
          }
        }

        if (!hasRequiredVars) {
          this.addIssue(
            "connectivity",
            "error",
            `${service.name}: Missing required environment variables`,
            `Ensure ${service.requiredEnvVars.join(", ")} are configured`,
          );
          continue;
        }

        // Test basic connectivity (DNS resolution)
        const url = new URL(service.testUrl);
        await this.testDNS(url.hostname);

        this.log("debug", `✅ ${service.name} connectivity OK`);
        this.results.connectivity.passed++;
      } catch (error) {
        this.addIssue(
          "connectivity",
          "error",
          `${service.name}: Connectivity test failed - ${error.message}`,
          "Check network connectivity and service status",
        );
      }
    }
  }

  async testDNS(hostname) {
    return new Promise((resolve, reject) => {
      const dns = require("dns");
      dns.lookup(hostname, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async validateBuildProcess() {
    this.log("info", "Validating build process...");

    try {
      // Check if node_modules exists
      const nodeModulesPath = path.join(PROJECT_ROOT, "node_modules");
      if (!fs.existsSync(nodeModulesPath)) {
        this.addIssue(
          "dependencies",
          "error",
          "node_modules not found",
          "Run: npm install",
        );
        return;
      }

      // Try a dry run build (if --validate-build flag is set)
      if (process.argv.includes("--validate-build")) {
        this.log("info", "Running build validation...");

        const { stdout, stderr } = await execAsync("npm run build --dry-run", {
          cwd: PROJECT_ROOT,
          timeout: 30000,
        });

        if (stderr && stderr.includes("error")) {
          this.addIssue(
            "configuration",
            "error",
            "Build validation failed",
            "Fix build errors before deploying",
          );
        } else {
          this.log("info", "✅ Build validation passed");
          this.results.configuration.passed++;
        }
      }
    } catch (error) {
      this.addIssue(
        "configuration",
        "error",
        `Build validation failed: ${error.message}`,
        "Fix build configuration and dependencies",
      );
    }
  }

  calculateOverallScore() {
    const categories = [
      "files",
      "dependencies",
      "environment",
      "configuration",
    ];
    if (this.checkConnectivity) {
      categories.push("connectivity");
    }

    let totalPassed = 0;
    let totalFailed = 0;

    for (const category of categories) {
      totalPassed += this.results[category].passed;
      totalFailed += this.results[category].failed;
    }

    const total = totalPassed + totalFailed;
    const score = total > 0 ? Math.round((totalPassed / total) * 100) : 0;

    this.results.overall.score = score;

    if (score >= 90) {
      this.results.overall.status = "excellent";
    } else if (score >= 75) {
      this.results.overall.status = "good";
    } else if (score >= 50) {
      this.results.overall.status = "fair";
    } else {
      this.results.overall.status = "poor";
    }
  }

  generateReport() {
    this.calculateOverallScore();

    console.log("\n" + "=".repeat(60));
    console.log("🎨 PAINTBOX RENDER DEPLOYMENT VALIDATION REPORT");
    console.log("=".repeat(60));

    const { score, status } = this.results.overall;
    const statusEmoji = {
      excellent: "🟢",
      good: "🟡",
      fair: "🟠",
      poor: "🔴",
    };

    console.log(
      `\n📊 Overall Score: ${score}% ${
        statusEmoji[status]
      } (${status.toUpperCase()})\n`,
    );

    // Category breakdown
    for (const [category, results] of Object.entries(this.results)) {
      if (category === "overall") continue;

      const total = results.passed + results.failed;
      const categoryScore =
        total > 0 ? Math.round((results.passed / total) * 100) : 0;
      const emoji =
        results.failed === 0
          ? "✅"
          : results.failed > results.passed
            ? "❌"
            : "⚠️";

      console.log(
        `${emoji} ${category.toUpperCase()}: ${
          results.passed
        }/${total} (${categoryScore}%)`,
      );

      if (results.issues.length > 0) {
        for (const issue of results.issues) {
          const icon = issue.severity === "error" ? "  🔴" : "  🟡";
          console.log(`${icon} ${issue.message}`);
          if (issue.suggestion) {
            console.log(`     💡 ${issue.suggestion}`);
          }
        }
        console.log();
      }
    }

    // Deployment readiness
    console.log("🚀 DEPLOYMENT READINESS");
    console.log("-".repeat(30));

    const criticalIssues = Object.values(this.results)
      .flatMap((r) => r.issues || [])
      .filter((i) => i.severity === "error").length;

    if (criticalIssues === 0) {
      console.log("✅ Ready for deployment!");
      console.log("\nNext steps:");
      console.log("1. Run: ./scripts/deploy-render-comprehensive.sh");
      console.log("2. Monitor deployment in Render dashboard");
      console.log("3. Test application after deployment");
    } else {
      console.log(
        `❌ ${criticalIssues} critical issue(s) must be fixed before deployment`,
      );
      console.log("\nFix all errors marked with 🔴 before proceeding.");
    }

    console.log("\n" + "=".repeat(60));

    return criticalIssues === 0;
  }

  async run() {
    this.log(
      "info",
      `Starting Render configuration validation for service: ${this.serviceName}`,
    );

    await this.validateFiles();
    await this.validateEnvironmentVariables();
    await this.validateRenderConfiguration();
    await this.validateBuildProcess();
    await this.testConnectivity();

    const isReady = this.generateReport();
    process.exit(isReady ? 0 : 1);
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
      case "--check-connectivity":
        options.checkConnectivity = true;
        break;
      case "--verbose":
        options.verbose = true;
        break;
      case "--help":
      case "-h":
        console.log(`
Paintbox Render Configuration Validator

Usage: node scripts/validate-render-config.js [OPTIONS]

OPTIONS:
  --service NAME          Render service name (default: ${DEFAULT_SERVICE_NAME})
  --check-connectivity    Test external service connectivity
  --validate-build        Run build validation (slower)
  --verbose               Enable debug logging
  --help, -h              Show this help message

EXAMPLES:
  node scripts/validate-render-config.js
  node scripts/validate-render-config.js --check-connectivity
  node scripts/validate-render-config.js --service my-paintbox --verbose
        `);
        process.exit(0);
        break;
      default:
        if (!args[i].startsWith("--")) {
          console.error(`Unknown option: ${args[i]}`);
          process.exit(1);
        }
    }
  }

  return options;
}

// Main execution
if (require.main === module) {
  const options = parseArgs();
  const validator = new RenderConfigValidator(options);

  validator.run().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}

module.exports = { RenderConfigValidator };
