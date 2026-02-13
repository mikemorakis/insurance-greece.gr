import { sendEmail, type GmailEnv } from '../../lib/gmail';

interface Env extends GmailEnv {}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const body = await request.json() as { email: string };

    if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      return new Response(JSON.stringify({ error: 'Please enter a valid email.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await sendEmail(env, {
      to: env.GMAIL_USER_EMAIL || 'info@insurance-greece.com',
      subject: 'New Newsletter Subscriber',
      html: `<p>New newsletter subscriber: <strong>${body.email}</strong></p>`,
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Something went wrong.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
