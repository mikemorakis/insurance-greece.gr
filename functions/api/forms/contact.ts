interface Env {
  TURNSTILE_SECRET_KEY?: string;
  NOTIFICATION_EMAIL?: string;
  RESEND_API_KEY?: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const body = await request.json() as Record<string, unknown>;
    const { name, email, phone, subject, message, website } = body;

    // Honeypot check
    if (website) {
      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validate
    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: 'Please fill in all required fields.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Send email via Resend
    if (env.RESEND_API_KEY) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Insurance Greece <info@insurance-greece.com>',
          to: env.NOTIFICATION_EMAIL || 'info@insurance-greece.com',
          reply_to: String(email),
          subject: `New Contact Form: ${subject || 'General Inquiry'}`,
          html: `<h2>New Contact Form Submission</h2>
                 <p><strong>Name:</strong> ${name}</p>
                 <p><strong>Email:</strong> ${email}</p>
                 ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
                 ${subject ? `<p><strong>Subject:</strong> ${subject}</p>` : ''}
                 <p><strong>Message:</strong></p>
                 <p>${String(message).replace(/\n/g, '<br>')}</p>`,
        }),
      });
    }

    return new Response(JSON.stringify({ success: true, message: 'Thank you. We will get back to you within 48 hours.' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Unable to process your request.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
