import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const sesClient = new SESClient({ region: process.env.AWS_REGION || 'ap-southeast-2' });

const FROM_EMAIL = process.env.SES_FROM_EMAIL || 'noreply@getaiready.dev';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:8888';

export interface MagicLinkEmailData {
  email: string;
  token: string;
  expiresInMinutes: number;
}

export async function sendMagicLinkEmail(data: MagicLinkEmailData): Promise<void> {
  const { email, token, expiresInMinutes } = data;
  
  const magicLink = `${APP_URL}/auth/verify?token=${token}`;
  
  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Sign in to AIReady</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0f; margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(to bottom, #1a1a2e, #0a0a0f); border-radius: 16px; padding: 40px; border: 1px solid rgba(99, 102, 241, 0.2);">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #fff; font-size: 24px; margin: 0;">AIReady</h1>
        </div>
        
        <div style="color: #e2e8f0; font-size: 16px; line-height: 1.6;">
          <p style="margin-bottom: 24px;">Click the button below to sign in to your AIReady account:</p>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${magicLink}" style="display: inline-block; background: linear-gradient(to right, #6366f1, #06b6d4); color: #fff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 16px;">Sign in to AIReady</a>
          </div>
          
          <p style="color: #94a3b8; font-size: 14px; margin-top: 24px;">This link will expire in ${expiresInMinutes} minutes.</p>
          
          <p style="color: #64748b; font-size: 14px; margin-top: 16px;">If you didn't request this email, you can safely ignore it.</p>
          
          <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid rgba(99, 102, 241, 0.2);">
            <p style="color: #64748b; font-size: 12px; word-break: break-all;">Or copy and paste this URL into your browser:<br>${magicLink}</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const textBody = `
Sign in to AIReady

Click the link below to sign in to your AIReady account:

${magicLink}

This link will expire in ${expiresInMinutes} minutes.

If you didn't request this email, you can safely ignore it.
  `.trim();

  const command = new SendEmailCommand({
    Source: FROM_EMAIL,
    Destination: {
      ToAddresses: [email],
    },
    Message: {
      Subject: {
        Data: 'Sign in to AIReady',
        Charset: 'UTF-8',
      },
      Body: {
        Html: {
          Data: htmlBody,
          Charset: 'UTF-8',
        },
        Text: {
          Data: textBody,
          Charset: 'UTF-8',
        },
      },
    },
  });

  try {
    await sesClient.send(command);
    console.log(`Magic link email sent to ${email}`);
  } catch (error) {
    console.error('Failed to send magic link email:', error);
    throw error;
  }
}

export interface WelcomeEmailData {
  email: string;
  name: string;
}

export async function sendWelcomeEmail(data: WelcomeEmailData): Promise<void> {
  const { email, name } = data;
  
  const dashboardUrl = `${APP_URL}/dashboard`;
  
  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to AIReady</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0f; margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(to bottom, #1a1a2e, #0a0a0f); border-radius: 16px; padding: 40px; border: 1px solid rgba(99, 102, 241, 0.2);">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #fff; font-size: 24px; margin: 0;">AIReady</h1>
        </div>
        
        <div style="color: #e2e8f0; font-size: 16px; line-height: 1.6;">
          <p style="margin-bottom: 16px;">Welcome to AIReady, ${name}!</p>
          
          <p style="margin-bottom: 24px;">Your account is ready. Start analyzing your codebases for AI readiness:</p>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${dashboardUrl}" style="display: inline-block; background: linear-gradient(to right, #6366f1, #06b6d4); color: #fff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 16px;">Go to Dashboard</a>
          </div>
          
          <p style="color: #94a3b8; font-size: 14px; margin-top: 24px;">What you can do with AIReady:</p>
          <ul style="color: #94a3b8; font-size: 14px;">
            <li>Scan repositories for AI readiness issues</li>
            <li>Detect semantic duplicates and context fragmentation</li>
            <li>Track improvements over time</li>
            <li>Get actionable remediation suggestions</li>
          </ul>
        </div>
      </div>
    </body>
    </html>
  `;

  const command = new SendEmailCommand({
    Source: FROM_EMAIL,
    Destination: {
      ToAddresses: [email],
    },
    Message: {
      Subject: {
        Data: 'Welcome to AIReady!',
        Charset: 'UTF-8',
      },
      Body: {
        Html: {
          Data: htmlBody,
          Charset: 'UTF-8',
        },
      },
    },
  });

  try {
    await sesClient.send(command);
    console.log(`Welcome email sent to ${email}`);
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    // Don't throw for welcome email failures
  }
}