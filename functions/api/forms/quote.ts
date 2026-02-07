interface Env {
  NOTIFICATION_EMAIL?: string;
  RESEND_API_KEY?: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const body = await request.json() as Record<string, unknown>;
    const { firstName, email, serviceSlug, serviceName, ...rest } = body;

    if (!firstName || !email) {
      return new Response(JSON.stringify({ error: 'Please fill in your name and email.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (env.RESEND_API_KEY) {
      const details = Object.entries(rest)
        .filter(([key, val]) => val && key !== 'privacyConsent')
        .map(([key, val]) => `<p><strong>${key}:</strong> ${Array.isArray(val) ? val.join(', ') : val}</p>`)
        .join('');

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Insurance Greece <noreply@insurance-greece.com>',
          to: env.NOTIFICATION_EMAIL || 'info@insurance-greece.com',
          subject: `New Quote Request: ${serviceName || serviceSlug}`,
          html: `<h2>New Quote Request</h2>
                 <p><strong>Service:</strong> ${serviceName}</p>
                 <p><strong>Name:</strong> ${firstName}</p>
                 <p><strong>Email:</strong> ${email}</p>
                 ${details}`,
        }),
      });
    }

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
