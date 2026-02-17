const DC = 'us16';
const AUDIENCE_ID = '3f1e24b83b';

async function md5(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hash = await crypto.subtle.digest('MD5', data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function addSubscriber(apiKey: string, opts: {
  email: string;
  tag?: string;
  tags?: string[];
  firstName?: string;
}): Promise<void> {
  const emailHash = await md5(opts.email.toLowerCase().trim());
  const url = `https://${DC}.api.mailchimp.com/3.0/lists/${AUDIENCE_ID}/members/${emailHash}`;

  const auth = `Basic ${btoa(`anystring:${apiKey}`)}`;

  // Use PUT to add or update (won't fail if already subscribed)
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: auth,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email_address: opts.email.toLowerCase().trim(),
      status_if_new: 'subscribed',
      merge_fields: opts.firstName ? { FNAME: opts.firstName } : {},
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Mailchimp error (${res.status}): ${text}`);
  }

  // Add tags
  const allTags = opts.tags || (opts.tag ? [opts.tag] : []);
  if (allTags.length > 0) {
    const tagUrl = `https://${DC}.api.mailchimp.com/3.0/lists/${AUDIENCE_ID}/members/${emailHash}/tags`;
    await fetch(tagUrl, {
      method: 'POST',
      headers: {
        Authorization: auth,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tags: allTags.map((name) => ({ name, status: 'active' })),
      }),
    });
  }
}
