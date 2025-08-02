#!/usr/bin/env node

const {
  SecretsManagerClient,
  UpdateSecretCommand,
  GetSecretValueCommand,
} = require("@aws-sdk/client-secrets-manager");
const { config } = require("dotenv");

// Load environment variables
config({ path: ".env.local" });
config({ path: ".env.local.full" });

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

async function updatePaintboxSecret() {
  try {
    logger.info("Starting AWS secret update process");

    // Create AWS Secrets Manager client
    const client = new SecretsManagerClient({
      region: process.env.AWS_REGION || "us-east-1",
    });

    // First, get the current secret
    const getCommand = new GetSecretValueCommand({
      SecretId: "paintbox/secrets",
    });
    const currentSecret = await client.send(getCommand);
    const secretData = JSON.parse(currentSecret.SecretString);

    // Add missing Company Cam company ID
    secretData.companyCam.companyId =
      process.env.COMPANYCAM_COMPANY_ID || "179901"; // Default ID from API tests

    // Add Anthropic API key if available
    if (process.env.ANTHROPIC_API_KEY) {
      secretData.anthropic = { apiKey: process.env.ANTHROPIC_API_KEY };
    }

    // Update the secret
    const updateCommand = new UpdateSecretCommand({
      SecretId: "paintbox/secrets",
      SecretString: JSON.stringify(secretData),
    });

    logger.info("Updating secret in AWS Secrets Manager...");
    await client.send(updateCommand);

    logger.success("Secret updated successfully!");
    logger.info(
      "Updated fields: companyCam.companyId" +
        (secretData.anthropic ? ", anthropic.apiKey" : ""),
    );
  } catch (error) {
    logger.error("Failed to update secret", { error: error.message });
    process.exit(1);
  }
}

// Run the script
updatePaintboxSecret();
