/**
 * Email helper — sends via Google Apps Script webhook
 * The Apps Script uses GmailApp.sendEmail() under the hood
 *
 * Note: Google Apps Script returns a 302 redirect on POST.
 * We must follow it manually since the redirect becomes a GET.
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
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify(opts),
    redirect: 'follow',
  });

  // Google Apps Script may return HTML or JSON after redirect
  // A successful call returns 200 (after redirect)
  // We consider any non-5xx response as success
  if (res.status >= 500) {
    const text = await res.text();
    throw new Error(`Apps Script error (${res.status}): ${text}`);
  }
}
