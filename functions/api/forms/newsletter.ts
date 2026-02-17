import { addSubscriber } from '../../lib/mailchimp';

interface Env {
  MAILCHIMP_API_KEY: string;
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

    await addSubscriber(env.MAILCHIMP_API_KEY, {
      email: body.email,
      tag: 'Website - Newsletter',
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: 'Something went wrong.', debug: msg }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
