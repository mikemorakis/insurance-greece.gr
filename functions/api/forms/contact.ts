import { sendEmail } from '../../lib/gmail';
import { addSubscriber } from '../../lib/mailchimp';

interface Env {
  TURNSTILE_SECRET_KEY?: string;
  MAILCHIMP_API_KEY: string;
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

    // Send email and add to Mailchimp in parallel
    await Promise.all([
      sendEmail({
        to: 'info@insurance-greece.com',
        replyTo: String(email),
        subject: `New Contact Form: ${subject || 'General Inquiry'}`,
        html: `<h2>New Contact Form Submission</h2>
               <p><strong>Name:</strong> ${name}</p>
               <p><strong>Email:</strong> ${email}</p>
               ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
               ${subject ? `<p><strong>Subject:</strong> ${subject}</p>` : ''}
               <p><strong>Message:</strong></p>
               <p>${String(message).replace(/\n/g, '<br>')}</p>`,
      }),
      addSubscriber(env.MAILCHIMP_API_KEY, {
        email: String(email),
        firstName: String(name),
        tag: 'Website - Contact Form',
      }),
    ]);

    return new Response(JSON.stringify({ success: true, message: 'Thank you. We will get back to you within 48 hours.' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: 'Unable to process your request.', debug: msg }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
