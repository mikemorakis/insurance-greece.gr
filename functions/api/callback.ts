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
<html><body>
<p id="status">Authenticating...</p>
<script>
(function() {
  var token = "${token}";
  var provider = "github";
  var origin = window.location.origin;

  if (!window.opener) {
    document.getElementById("status").innerText = "Popup blocked. Please allow popups and try again.";
    return;
  }

  // Step 1: Send handshake that Decap CMS expects
  window.opener.postMessage("authorizing:" + provider, origin);

  // Step 2: Wait for Decap CMS to set up its auth listener, then send token
  window.addEventListener("message", function(e) {
    if (e.data === "authorizing:" + provider) {
      // Decap CMS echoed back the handshake — now send the token
      window.opener.postMessage(
        "authorization:" + provider + ":success:" + token, origin
      );
      document.getElementById("status").innerText = "Logging in...";
      setTimeout(function() { window.close(); }, 1000);
    }
  });

  // Safety: if no handshake echo after 2s, send token anyway
  setTimeout(function() {
    window.opener.postMessage(
      "authorization:" + provider + ":success:" + token, origin
    );
    document.getElementById("status").innerText = "Logging in...";
    setTimeout(function() { window.close(); }, 1000);
  }, 2000);
})();
</script></body></html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html' },
  });
};
