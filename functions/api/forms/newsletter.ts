interface Env {
  NOTIFICATION_EMAIL?: string;
  RESEND_API_KEY?: string;
}

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

    if (env.RESEND_API_KEY) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Insurance Greece <noreply@insurance-greece.com>',
          to: env.NOTIFICATION_EMAIL || 'info@insurance-greece.com',
          subject: 'New Newsletter Subscriber',
          html: `<p>New newsletter subscriber: ${body.email}</p>`,
        }),
      });
    }

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
