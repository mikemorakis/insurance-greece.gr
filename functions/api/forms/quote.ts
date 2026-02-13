import { sendEmail, type GmailEnv } from '../../lib/gmail';

interface Env extends GmailEnv {}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const body = await request.json() as Record<string, unknown>;
    const { firstName, email, serviceSlug, serviceName, website, ...rest } = body;

    // Honeypot check
    if (website) {
      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!firstName || !email) {
      return new Response(JSON.stringify({ error: 'Please fill in your name and email.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const details = Object.entries(rest)
      .filter(([key, val]) => val && key !== 'privacyConsent')
      .map(([key, val]) => `<p><strong>${key}:</strong> ${Array.isArray(val) ? val.join(', ') : val}</p>`)
      .join('');

    await sendEmail(env, {
      to: env.GMAIL_USER_EMAIL || 'info@insurance-greece.com',
      replyTo: String(email),
      subject: `New Quote Request: ${serviceName || serviceSlug}`,
      html: `<h2>New Quote Request</h2>
             <p><strong>Service:</strong> ${serviceName}</p>
             <p><strong>Name:</strong> ${firstName}</p>
             <p><strong>Email:</strong> ${email}</p>
             ${details}`,
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Unable to process your request.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
