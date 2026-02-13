/**
 * Email helper — sends via Google Apps Script webhook
 * The Apps Script uses GmailApp.sendEmail() under the hood
 */

const SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbz7XvrdmhmSv_d678O7ywd1AT8_Z7OTWz841E6Z725K1amiMvmTqAGBMPI0hgxhcT6L8g/exec';

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<void> {
  const res = await fetch(SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(opts),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Apps Script error (${res.status}): ${text}`);
  }
}
