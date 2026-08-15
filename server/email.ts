import nodemailer from 'nodemailer';

export function generateVerificationCode(): string {
  // Generate random 6-digit numeric code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  return code;
}

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
    return transporter;
  }

  return null;
}

export async function sendVerificationEmail(email: string, code: string, candidateId?: string): Promise<{ sent: boolean; method: string; previewCode?: string }> {
  console.log(`\n======================================================`);
  console.log(`[HX VERIFICATION CODE]`);
  console.log(`Email: ${email}`);
  if (candidateId) console.log(`Candidate ID: ${candidateId}`);
  console.log(`Code: ${code}`);
  console.log(`Expires in: 10 minutes`);
  console.log(`======================================================\n`);

  const mailer = getTransporter();
  if (mailer) {
    try {
      const from = process.env.SMTP_FROM || 'HX Engineering <noreply@hx-engineering.com>';
      await mailer.sendMail({
        from,
        to: email,
        subject: `Your HX Verification Code: ${code}`,
        text: `Your HX verification code is: ${code}\n\nThis code will expire in 10 minutes.\n\nEngineering Without the Barriers.\nHX Engineering Team`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #000; color: #fff; padding: 40px 20px; text-align: center;">
            <div style="max-width: 480px; margin: 0 auto; background: #0c0c0e; border: 1px solid #27272a; border-radius: 16px; padding: 32px; text-align: left;">
              <h2 style="color: #ffffff; font-size: 20px; margin-top: 0; letter-spacing: 0.05em; text-transform: uppercase;">HX Verification</h2>
              <p style="color: #a1a1aa; font-size: 14px; line-height: 1.6;">
                Use the single-use verification code below to verify your email and access your HX early access candidate profile.
              </p>
              <div style="margin: 28px 0; padding: 20px; background: #18181b; border: 1px solid #3f3f46; border-radius: 12px; text-align: center;">
                <span style="font-family: monospace; font-size: 32px; font-weight: 700; letter-spacing: 0.3em; color: #ffffff;">${code}</span>
              </div>
              <p style="color: #71717a; font-size: 12px; margin-bottom: 0;">
                This code expires in 10 minutes. If you did not request this code, please disregard this email.
              </p>
            </div>
            <p style="color: #52525b; font-size: 11px; margin-top: 24px; text-transform: uppercase; letter-spacing: 0.15em;">
              Redefine Impossible &bull; HX Engineering
            </p>
          </div>
        `,
      });
      return { sent: true, method: 'smtp' };
    } catch (error) {
      console.error('SMTP sending error:', error);
    }
  }

  // If in preview sandbox / dev environment without SMTP configured, returns dev indicator
  const isDev = process.env.NODE_ENV !== 'production' || !process.env.SMTP_HOST;
  return {
    sent: true,
    method: mailer ? 'smtp' : 'dev_console',
    previewCode: isDev ? code : undefined,
  };
}
