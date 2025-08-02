#!/usr/bin/env node

const {
  SecretsManagerClient,
  CreateSecretCommand,
} = require("@aws-sdk/client-secrets-manager");
const { config } = require("dotenv");
const { existsSync, readFileSync } = require("fs");

// Load environment variables
config();

const logger = {
  info: (msg, meta = {}) =>
    console.log(
      `[${new Date().toISOString()}] INFO: ${msg}`,
      JSON.stringify(meta),
    ),
  error: (msg, meta = {}) =>
    console.error(
      `[${new Date().toISOString()}] ERROR: ${msg}`,
      JSON.stringify(meta),
    ),
  success: (msg) => console.log(`\x1b[32m✅ ${msg}\x1b[0m`),
};

function loadExistingEnv() {
  const envFiles = [".env.local", ".env", ".env.local.full"];
  const secrets = {};

  for (const file of envFiles) {
    if (existsSync(file)) {
      const content = readFileSync(file, "utf-8");
      const lines = content.split("\n");

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#")) {
          const [key, ...valueParts] = trimmed.split("=");
          if (key && valueParts.length > 0) {
            const value = valueParts.join("=").replace(/^["']|["']$/g, "");
            secrets[key] = value;
          }
        }
      }
    }
  }

  return secrets;
}

async function createPaintboxSecret() {
  try {
    logger.info("Starting AWS secret creation process");

    // Load environment from .env files first
    config({ path: ".env.local" });
    config({ path: ".env.local.full" });

    // Load existing environment variables
    const envSecrets = loadExistingEnv();

    // Create the secret structure
    const secretData = {
      companyCam: {
        apiToken:
          envSecrets.COMPANYCAM_API_TOKEN ||
          process.env.COMPANYCAM_API_TOKEN ||
          "",
        webhookSecret:
          envSecrets.COMPANYCAM_WEBHOOK_SECRET ||
          process.env.COMPANYCAM_WEBHOOK_SECRET ||
          "",
      },
      salesforce: {
        clientId:
          envSecrets.SALESFORCE_CLIENT_ID ||
          process.env.SALESFORCE_CLIENT_ID ||
          "",
        clientSecret:
          envSecrets.SALESFORCE_CLIENT_SECRET ||
          process.env.SALESFORCE_CLIENT_SECRET ||
          "",
        username:
          envSecrets.SALESFORCE_USERNAME ||
          process.env.SALESFORCE_USERNAME ||
          "",
        password:
          envSecrets.SALESFORCE_PASSWORD ||
          process.env.SALESFORCE_PASSWORD ||
          "",
        securityToken:
          envSecrets.SALESFORCE_SECURITY_TOKEN ||
          process.env.SALESFORCE_SECURITY_TOKEN ||
          "",
        instanceUrl:
          envSecrets.SALESFORCE_INSTANCE_URL ||
          process.env.SALESFORCE_INSTANCE_URL ||
          "https://test.salesforce.com",
        apiVersion: "v62.0",
      },
      database: {
        url:
          envSecrets.DATABASE_URL ||
          process.env.DATABASE_URL ||
          "postgresql://paintbox:password@localhost:5432/paintbox",
      },
      redis: {
        url:
          envSecrets.REDIS_URL ||
          process.env.REDIS_URL ||
          "redis://localhost:6379",
      },
      sentry: {
        dsn: envSecrets.SENTRY_DSN || process.env.SENTRY_DSN || "",
      },
      encryption: {
        key:
          envSecrets.ENCRYPTION_KEY ||
          process.env.ENCRYPTION_KEY ||
          "paintboxencryptionkey1234567890ab",
        iv:
          envSecrets.ENCRYPTION_IV ||
          process.env.ENCRYPTION_IV ||
          "1234567890abcdef",
      },
    };

    // Validate critical secrets
    const missingSecrets = [];
    if (!secretData.companyCam.apiToken)
      missingSecrets.push("COMPANYCAM_API_TOKEN");
    if (!secretData.salesforce.clientId)
      missingSecrets.push("SALESFORCE_CLIENT_ID");
    if (!secretData.salesforce.clientSecret)
      missingSecrets.push("SALESFORCE_CLIENT_SECRET");
    if (!secretData.salesforce.username)
      missingSecrets.push("SALESFORCE_USERNAME");
    if (!secretData.salesforce.password)
      missingSecrets.push("SALESFORCE_PASSWORD");
    if (!secretData.salesforce.securityToken)
      missingSecrets.push("SALESFORCE_SECURITY_TOKEN");

    if (missingSecrets.length > 0) {
      logger.error(`Missing critical secrets: ${missingSecrets.join(", ")}`);
      logger.info(
        "Please ensure these are set in your .env.local file or environment",
      );
      process.exit(1);
    }

    // Create AWS Secrets Manager client
    const client = new SecretsManagerClient({
      region: process.env.AWS_REGION || "us-east-1",
    });

    // Create the secret
    const command = new CreateSecretCommand({
      Name: "paintbox/secrets",
      Description: "Paintbox application secrets for all environments",
      SecretString: JSON.stringify(secretData),
    });

    logger.info("Creating secret in AWS Secrets Manager...");
    await client.send(command);

    logger.success("Secret created successfully!");
    logger.info("Secret name: paintbox/secrets");
    logger.info("You can now run: npm run deploy:secrets to fetch this secret");
  } catch (error) {
    if (error.name === "ResourceExistsException") {
      logger.error(
        "Secret already exists. Use update-aws-secret.js to update it.",
      );
    } else {
      logger.error("Failed to create secret", { error: error.message });
    }
    process.exit(1);
  }
}

// Run the script
createPaintboxSecret();
