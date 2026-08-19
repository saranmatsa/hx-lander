import nodemailer from 'nodemailer';
import path from 'path';

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.warn('[Email] SMTP not configured, emails will be logged only');
    return null;
  }

  try {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
    return transporter;
  } catch (err) {
    console.error('[Email] Failed to create transporter:', err);
    return null;
  }
}

export async function sendVerificationEmail(email: string, code: string): Promise<boolean> {
  const transporter = getTransporter();
  const from = process.env.SMTP_FROM || 'HX Engineering <noreply@hx-engineering.com>';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <tr>
          <td style="text-align: center; padding-bottom: 32px;">
            <img src="cid:hxlogo" alt="HX" style="height: 48px; width: auto;">
          </td>
        </tr>
        <tr>
          <td style="background: #18181b; border: 1px solid #27272a; border-radius: 16px; padding: 40px;">
            <h1 style="margin: 0 0 16px; font-size: 28px; font-weight: 700; color: #ffffff; letter-spacing: -0.02em;">Verify Your Email</h1>
            <p style="margin: 0 0 32px; font-size: 16px; color: #a1a1aa; line-height: 1.6;">Enter this 6-digit code to access your HX Engineering waitlist position.</p>
            <div style="background: #09090b; border: 1px solid #27272a; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 32px;">
              <span style="font-size: 36px; font-weight: 700; color: #ffffff; letter-spacing: 0.4em; font-family: 'SF Mono', Monaco, 'Courier New', monospace;">${code}</span>
            </div>
            <p style="margin: 0; font-size: 14px; color: #71717a;">This code expires in 10 minutes. If you didn't request this, please ignore this email.</p>
          </td>
        </tr>
        <tr>
          <td style="text-align: center; padding-top: 24px;">
            <p style="margin: 0; font-size: 12px; color: #52525b;">&copy; ${new Date().getFullYear()} HX Engineering. Redefine Impossible.</p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const text = `HX Engineering - Verification Code: ${code}\n\nThis code expires in 10 minutes.`;

  if (!transporter) {
    console.log(`[Email Dev Mode] To: ${email}, Code: ${code}`);
    return true;
  }

  try {
    await transporter.sendMail({
      from,
      to: email,
      subject: 'Your HX Engineering Verification Code',
      text,
      html,
      attachments: [
        {
          filename: 'hxlogo.svg',
          path: path.join(process.cwd(), 'public', 'hxlogo.svg'),
          cid: 'hxlogo',
        },
      ],
    });
    console.log(`[Email] Verification code sent to ${email}`);
    return true;
  } catch (err) {
    console.error('[Email] Failed to send verification email:', err);
    return false;
  }
}