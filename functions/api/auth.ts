interface Env {
  GITHUB_CLIENT_ID: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env, request } = context;
  const clientId = env.GITHUB_CLIENT_ID || 'Ov23lizrV9SK77HHQgYF';
  const url = new URL(request.url);
  const redirectUri = `${url.origin}/api/callback`;

  const authUrl = new URL('https://github.com/login/oauth/authorize');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('scope', 'repo,user');

  return Response.redirect(authUrl.toString(), 302);
};
