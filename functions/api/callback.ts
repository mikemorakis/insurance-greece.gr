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

  // Try postMessage for popup flow, fall back to localStorage + redirect
  const html = `<!doctype html>
<html><body><script>
(function() {
  var token = "${token}";
  var sent = false;

  // Try popup postMessage flow
  if (window.opener) {
    try {
      window.opener.postMessage("authorization:github:success:" + token, "*");
      sent = true;
      document.body.innerText = "Logging in...";
      setTimeout(function() { window.close(); }, 500);
    } catch(e) {}
  }

  // Fallback: store token and redirect to admin
  if (!sent) {
    try {
      localStorage.setItem("netlify-cms-user", JSON.stringify({
        token: token,
        name: "",
        backendName: "github"
      }));
    } catch(e) {}
    window.location.href = "/admin/#/";
  }

  // Safety net: if popup didn't close after 2 seconds, redirect
  setTimeout(function() {
    try {
      localStorage.setItem("netlify-cms-user", JSON.stringify({
        token: token,
        name: "",
        backendName: "github"
      }));
    } catch(e) {}
    window.location.href = "/admin/#/";
  }, 2000);
})();
</script></body></html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html' },
  });
};
