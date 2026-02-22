/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "aiready-platform",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
    };
  },
  async run() {
    // S3 Bucket for analysis data
    const bucket = new sst.aws.Bucket("AnalysisBucket");

    // SES Domain Configuration
    // Note: SES domain verification must be done manually in AWS Console
    // or via a separate Pulumi Cloudflare provider setup
    // Local/Dev: noreply@dev.getaiready.dev (subdomain)
    // Production: noreply@getaiready.dev
    const isProd = $app.stage === "prod" || $app.stage === "production";
    const isLocal = $app.stage === "local";
    const sesDomain = isProd ? "getaiready.dev" : "dev.getaiready.dev";

    // DynamoDB Table for all entities (Single Table Design)
    const table = new sst.aws.Dynamo("MainTable", {
      fields: {
        PK: "string",
        SK: "string",
        GSI1PK: "string",
        GSI1SK: "string",
        GSI2PK: "string",
        GSI2SK: "string",
      },
      primaryIndex: { hashKey: "PK", rangeKey: "SK" },
      globalIndexes: {
        GSI1: { hashKey: "GSI1PK", rangeKey: "GSI1SK" },
        GSI2: { hashKey: "GSI2PK", rangeKey: "GSI2SK" },
      },
    });

    // Next.js site configuration
    // Note: SST v3 with OpenNext creates multiple Lambda functions
    // For production, we want to set reserved concurrency to prevent cascade failures
    const siteConfig: sst.aws.NextjsArgs = {
      path: ".",
      dev: {
        command: "pnpm run dev:next",
        autostart: true,
      },
      // Set reserved concurrency for the server function
      // This prevents cascade failures when Enterprise clients upload many repos
      // See: .github/platform/architecture.md - Lambda Concurrency Planning
      server: {
        reservedConcurrency: isProd ? 100 : 50, // Higher for prod, lower for dev
      },
      environment: {
        S3_BUCKET: bucket.name,
        DYNAMO_TABLE: table.name,
        // NextAuth v5 uses AUTH_URL and AUTH_SECRET
        // For SST dev mode, use localhost; for deployed stages use the actual URL
        AUTH_URL: process.env.AUTH_URL || (isLocal 
          ? "http://localhost:8888"
          : isProd 
            ? "https://platform.getaiready.dev" 
            : $app.stage === "dev"
              ? "https://dev.platform.getaiready.dev"
              : `https://${$app.stage}.platform.getaiready.dev`),
        NEXT_PUBLIC_APP_URL: isLocal
          ? "http://localhost:8888"
          : isProd
            ? "https://platform.getaiready.dev"
            : $app.stage === "dev"
              ? "https://dev.platform.getaiready.dev"
              : `https://${$app.stage}.platform.getaiready.dev`,
        GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID || "",
        GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET || "",
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
        AUTH_SECRET: process.env.AUTH_SECRET || "",
        STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || "",
        STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || "",
        STRIPE_PRICE_ID_PRO: process.env.STRIPE_PRICE_ID_PRO || "",
        STRIPE_PRICE_ID_TEAM: process.env.STRIPE_PRICE_ID_TEAM || "",
        STRIPE_PRICE_ID_ENTERPRISE: process.env.STRIPE_PRICE_ID_ENTERPRISE || "",
        SES_DOMAIN: sesDomain,
        SES_FROM_EMAIL: `noreply@${sesDomain}`,
      },
    };

    // Add custom domain configuration for all stages
    // Requires CLOUDFLARE_API_TOKEN in environment
    if (isProd) {
      siteConfig.domain = {
        name: "platform.getaiready.dev",
        dns: sst.cloudflare.dns({
          zone: process.env.CLOUDFLARE_ZONE_ID || "50eb7dcadc84c58ab34583742db0b671",
        }),
      };
    } else if ($app.stage === "dev") {
      siteConfig.domain = {
        name: "dev.platform.getaiready.dev",
        dns: sst.cloudflare.dns({
          zone: process.env.CLOUDFLARE_ZONE_ID || "50eb7dcadc84c58ab34583742db0b671",
        }),
      };
    }

    const site = new sst.aws.Nextjs("Dashboard", siteConfig);

    return {
      site: site.url,
      bucketName: bucket.name,
      tableName: table.name,
    };
  },
});