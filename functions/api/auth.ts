interface Env {
  GITHUB_CLIENT_ID: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env, request } = context;
  const clientId = env.GITHUB_CLIENT_ID || 'Ov23lizrV9SK77HHQgYF';
  const url = new URL(request.url);
  const redirectUri = `${url.origin}/api/callback`;
  const provider = url.searchParams.get('provider') || 'github';

  const authUrl = new URL('https://github.com/login/oauth/authorize');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('scope', 'repo,user');

  // Decap CMS requires a handshake before redirect:
  // 1. This page sends "authorizing:github" to parent
  // 2. Parent echoes it back and sets up its auth listener
  // 3. Then we redirect to GitHub OAuth
  const html = `<!doctype html>
<html><body>
<script>
(function() {
  var provider = "${provider}";
  var authUrl = "${authUrl.toString()}";

  if (window.opener) {
    window.opener.postMessage("authorizing:" + provider, "*");
  }

  // Redirect to GitHub after a short delay for the handshake
  setTimeout(function() {
    window.location.href = authUrl;
  }, 300);
})();
</script>
</body></html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html' },
  });
};
