interface Env {
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env, request } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return new Response('Missing code parameter', { status: 400 });
  }

  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID || 'Ov23lizrV9SK77HHQgYF',
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });

  const data = (await tokenRes.json()) as { access_token?: string; error?: string };

  if (!data.access_token) {
    return new Response(`OAuth error: ${data.error || 'no token'}`, { status: 500 });
  }

  // Post the token back to the CMS via postMessage
  const html = `<!doctype html>
<html><body><script>
(function() {
  function sendMsg(provider, token) {
    var msg = "authorization:" + provider + ":success:" + JSON.stringify({token: token, provider: provider});
    window.opener ? window.opener.postMessage(msg, "*") : document.body.innerText = "Auth complete. Close this window.";
  }
  sendMsg("github", "${data.access_token}");
})();
</script></body></html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html' },
  });
};
