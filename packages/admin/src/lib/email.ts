/**
 * Thin email sender. Supports two transports selected by env vars:
 *
 *   EMAIL_TRANSPORT=resend  → sends via Resend API (RESEND_API_KEY required)
 *   EMAIL_TRANSPORT=smtp    → sends via SMTP relay using the fetch-compatible
 *                             Nodemailer-on-edge is NOT used; for SMTP support
 *                             wire a Nodemailer adapter at the server layer.
 *
 * When neither is configured, emails are printed to the console (dev fallback).
 */

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

const FROM = process.env.EMAIL_FROM ?? 'Volqan <noreply@volqan.link>';
const TRANSPORT = process.env.EMAIL_TRANSPORT ?? 'console';

async function sendViaResend(payload: EmailPayload): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('RESEND_API_KEY is not set');

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM,
      to: [payload.to],
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Resend API error ${res.status}: ${body}`);
  }
}

function sendViaConsole(payload: EmailPayload): void {
  console.log('[email:dev]', {
    from: FROM,
    to: payload.to,
    subject: payload.subject,
    text: payload.text ?? '(html only)',
  });
}

export async function sendEmail(payload: EmailPayload): Promise<void> {
  if (TRANSPORT === 'resend') {
    await sendViaResend(payload);
    return;
  }
  sendViaConsole(payload);
}

export function inviteEmail(opts: { to: string; name?: string; tempPassword: string; appUrl: string }): EmailPayload {
  const loginUrl = `${opts.appUrl}/login`;
  const greeting = opts.name ? `Hi ${opts.name},` : 'Hi,';
  const text = [
    greeting,
    '',
    "You've been invited to join Volqan.",
    '',
    `Email: ${opts.to}`,
    `Temporary password: ${opts.tempPassword}`,
    '',
    `Sign in at: ${loginUrl}`,
    '',
    'Please change your password after signing in.',
  ].join('\n');

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>You're invited to Volqan</title></head>
<body style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#111">
  <h2 style="margin-bottom:8px">You're invited to Volqan</h2>
  <p>${greeting.replace('<', '&lt;')}</p>
  <p>You've been invited to join Volqan. Use the credentials below to sign in.</p>
  <table style="border-collapse:collapse;margin:16px 0">
    <tr><td style="padding:4px 12px 4px 0;color:#555">Email</td><td style="padding:4px 0"><strong>${opts.to}</strong></td></tr>
    <tr><td style="padding:4px 12px 4px 0;color:#555">Temporary password</td><td style="padding:4px 0"><strong>${opts.tempPassword}</strong></td></tr>
  </table>
  <a href="${loginUrl}" style="display:inline-block;background:#111;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:500">Sign in</a>
  <p style="margin-top:24px;font-size:13px;color:#666">Please change your password after signing in.</p>
</body>
</html>`.trim();

  return { to: opts.to, subject: "You're invited to Volqan", html, text };
}
