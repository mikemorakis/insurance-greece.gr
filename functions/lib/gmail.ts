/**
 * Gmail API helper for Cloudflare Workers
 * Uses OAuth2 refresh token flow (no SMTP needed)
 */

export interface GmailEnv {
  GMAIL_CLIENT_ID?: string;
  GMAIL_CLIENT_SECRET?: string;
  GMAIL_REFRESH_TOKEN?: string;
  GMAIL_USER_EMAIL?: string;
}

function base64url(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

async function getAccessToken(env: GmailEnv): Promise<string> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: env.GMAIL_CLIENT_ID!,
      client_secret: env.GMAIL_CLIENT_SECRET!,
      refresh_token: env.GMAIL_REFRESH_TOKEN!,
      grant_type: 'refresh_token',
    }),
  });

  const data = (await res.json()) as { access_token?: string; error?: string };
  if (!data.access_token) {
    throw new Error(`Gmail OAuth error: ${data.error || 'no access token'}`);
  }
  return data.access_token;
}

export async function sendEmail(
  env: GmailEnv,
  opts: { to: string; subject: string; html: string; replyTo?: string },
): Promise<void> {
  if (!env.GMAIL_CLIENT_ID || !env.GMAIL_CLIENT_SECRET || !env.GMAIL_REFRESH_TOKEN || !env.GMAIL_USER_EMAIL) {
    throw new Error('Gmail environment variables not configured');
  }

  const accessToken = await getAccessToken(env);

  const messageParts = [
    `From: Insurance Greece <${env.GMAIL_USER_EMAIL}>`,
    `To: ${opts.to}`,
    `Subject: ${opts.subject}`,
    ...(opts.replyTo ? [`Reply-To: ${opts.replyTo}`] : []),
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset="UTF-8"',
    '',
    opts.html,
  ];

  const raw = base64url(messageParts.join('\r\n'));

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gmail API error (${res.status}): ${err}`);
  }
}
