#!/usr/bin/env node

const {
  SecretsManagerClient,
  GetSecretValueCommand,
} = require("@aws-sdk/client-secrets-manager");

// Configure AWS client
const client = new SecretsManagerClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Secrets to fetch from AWS Secrets Manager
const secrets = [
  { awsKey: "paintbox/anthropic-api-key", envKey: "ANTHROPIC_API_KEY" },
  { awsKey: "paintbox/companycam-api-key", envKey: "COMPANYCAM_API_KEY" },
  { awsKey: "paintbox/companycam-company-id", envKey: "COMPANYCAM_COMPANY_ID" },
  { awsKey: "paintbox/salesforce-client-id", envKey: "SALESFORCE_CLIENT_ID" },
  {
    awsKey: "paintbox/salesforce-client-secret",
    envKey: "SALESFORCE_CLIENT_SECRET",
  },
  { awsKey: "paintbox/salesforce-username", envKey: "SALESFORCE_USERNAME" },
  { awsKey: "paintbox/salesforce-password", envKey: "SALESFORCE_PASSWORD" },
  {
    awsKey: "paintbox/salesforce-security-token",
    envKey: "SALESFORCE_SECURITY_TOKEN",
  },
];

async function getSecret(secretName) {
  try {
    const command = new GetSecretValueCommand({ SecretId: secretName });
    const response = await client.send(command);

    if (response.SecretString) {
      // Parse JSON secrets
      try {
        const parsed = JSON.parse(response.SecretString);
        return parsed;
      } catch {
        // Return as-is if not JSON
        return response.SecretString;
      }
    }
    return null;
  } catch (error) {
    console.error(`Failed to fetch secret ${secretName}:`, error.message);
    return null;
  }
}

async function fetchAllSecrets() {
  console.log("Fetching secrets from AWS Secrets Manager...");

  const envVars = [];

  for (const { awsKey, envKey } of secrets) {
    const value = await getSecret(awsKey);
    if (value) {
      // If it's an object, extract the value
      const secretValue =
        typeof value === "object"
          ? value.value || value[envKey] || JSON.stringify(value)
          : value;
      envVars.push(`${envKey}=${secretValue}`);
      console.log(`✓ Fetched ${envKey}`);
    } else {
      console.warn(`✗ Failed to fetch ${envKey}`);
    }
  }

  // Write to .env.production for build process
  const fs = require("fs");
  const envContent = envVars.join("\n");
  fs.writeFileSync(".env.production", envContent);
  console.log("\n✓ Created .env.production with secrets");
}

// Run if called directly
if (require.main === module) {
  fetchAllSecrets().catch(console.error);
}

module.exports = { fetchAllSecrets };
