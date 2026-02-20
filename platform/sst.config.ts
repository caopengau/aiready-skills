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

    // Determine if this is production
    const isProd = $app.stage === "production";

    // Next.js site configuration
    const siteConfig: sst.aws.NextjsArgs = {
      path: ".",
      environment: {
        S3_BUCKET: bucket.name,
        DYNAMO_TABLE: table.name,
        NEXTAUTH_URL: isProd 
          ? "https://platform.getaiready.dev" 
          : $app.stage === "dev"
            ? "https://dev.platform.getaiready.dev"
            : `https://${$app.stage}.platform.getaiready.dev`,
        NEXT_PUBLIC_APP_URL: isProd
          ? "https://platform.getaiready.dev"
          : $app.stage === "dev"
            ? "https://dev.platform.getaiready.dev"
            : `https://${$app.stage}.platform.getaiready.dev`,
        GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID || "",
        GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET || "",
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || "",
        STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || "",
        STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || "",
        STRIPE_PRICE_ID_PRO: process.env.STRIPE_PRICE_ID_PRO || "",
        STRIPE_PRICE_ID_ENTERPRISE: process.env.STRIPE_PRICE_ID_ENTERPRISE || "",
      },
    };

    // Add custom domain configuration
    if (isProd) {
      siteConfig.domain = {
        name: "platform.getaiready.dev",
        dns: sst.cloudflare.dns({
          zone: "50eb7dcadc84c58ab34583742db0b671",
        }),
      };
    } else {
      // Dev stage uses subdomain
      siteConfig.domain = {
        name: $app.stage === "dev" 
          ? "dev.platform.getaiready.dev" 
          : `${$app.stage}.platform.getaiready.dev`,
        dns: sst.cloudflare.dns({
          zone: "50eb7dcadc84c58ab34583742db0b671",
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