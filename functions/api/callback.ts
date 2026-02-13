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

  if (!env.GITHUB_CLIENT_SECRET) {
    return new Response('GITHUB_CLIENT_SECRET env var not set', { status: 500 });
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

  const data = (await tokenRes.json()) as { access_token?: string; error?: string; error_description?: string };

  if (!data.access_token) {
    return new Response(`OAuth error: ${data.error || 'no token'} - ${data.error_description || ''}`, { status: 500 });
  }

  const token = data.access_token;

  const html = `<!doctype html>
<html><body><script>
(function() {
  var token = "${token}";
  var opener = window.opener;
  document.body.innerText = "Logging in...";
  if (opener) {
    opener.postMessage("authorization:github:success:" + token, "*");
    setTimeout(function() { window.close(); }, 500);
  } else {
    // Fallback: store token and redirect
    localStorage.setItem("netlify-cms-user", JSON.stringify({token: token, name: "", backendName: "github"}));
    document.body.innerText = "Authorized! Redirecting...";
    window.location.href = "/admin/";
  }
})();
</script></body></html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html' },
  });
};
