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
  var status = document.getElementById("status");

  function log(msg) {
    status.innerText += "\\n" + msg;
    console.log("[CMS Auth]", msg);
  }

  if (!window.opener) {
    log("ERROR: No window.opener. Popup may have been blocked.");
    log("Trying redirect fallback...");
    try {
      localStorage.setItem("netlify-cms-user", JSON.stringify({
        token: token, name: "", backendName: "github"
      }));
    } catch(e) {}
    setTimeout(function() { window.location.href = "/admin/"; }, 500);
    return;
  }

  log("window.opener found. Sending auth messages...");

  // Try multiple message formats for compatibility
  // Format 1: raw token (Netlify CMS / older Decap)
  window.opener.postMessage(
    "authorization:github:success:" + token, "*"
  );
  log("Sent format 1 (raw token)");

  // Format 2: JSON payload (newer Decap CMS)
  window.opener.postMessage(
    "authorization:github:success:" + JSON.stringify({ token: token, provider: "github" }), "*"
  );
  log("Sent format 2 (JSON payload)");

  log("Waiting for CMS to pick up...");
  setTimeout(function() { window.close(); }, 3000);
})();
</script></body></html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html' },
  });
};
