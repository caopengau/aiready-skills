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

    // Next.js site with custom domain
    const site = new sst.aws.Nextjs("Dashboard", {
      path: ".",
      environment: {
        S3_BUCKET: bucket.name,
        NEXTAUTH_URL: $app.stage === "production" 
          ? "https://platform.getaiready.dev" 
          : "http://localhost:8888",
        NEXT_PUBLIC_APP_URL: $app.stage === "production"
          ? "https://platform.getaiready.dev"
          : "http://localhost:8888",
        GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID || "",
        GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET || "",
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || "",
      },
      domain: {
        name: "platform.getaiready.dev",
        dns: sst.cloudflare.dns({
          zone: "50eb7dcadc84c58ab34583742db0b671",
        }),
      },
    });

    return {
      site: site.url,
      bucketName: bucket.name,
    };
  },
});