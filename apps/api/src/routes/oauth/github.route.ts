import { FastifyInstance } from 'fastify';
import { getEnv } from '../../config/env';
import { tokenStore } from '../../services/oauth/token-store';

export async function githubOAuthRoutes(fastify: FastifyInstance): Promise<void> {
  // Step 1: Start OAuth flow
  fastify.get('/oauth/github/start', async (request, reply) => {
    const env = getEnv();
    if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
      return reply.status(503).send({ error: 'GitHub OAuth is not configured. Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in .env' });
    }
    const state = tokenStore.createState('gh');

    const params = new URLSearchParams({
      client_id: env.GITHUB_CLIENT_ID,
      scope: 'repo read:user read:org',
      state,
    });
    return reply.redirect(`https://github.com/login/oauth/authorize?${params}`);
  });

  // Step 2: OAuth callback
  fastify.get('/oauth/github/callback', async (request, reply) => {
    const env = getEnv();
    const { code, state } = request.query as { code?: string; state?: string };

    if (!state || !tokenStore.validateState(state)) {
      return reply.status(400).send({ error: 'Invalid OAuth state. Possible CSRF attack.' });
    }

    if (!code) {
      return reply.status(400).send({ error: 'No authorization code received from GitHub.' });
    }

    // Exchange code for token
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    if (!tokenRes.ok) {
      return reply.status(502).send({ error: 'Failed to exchange code for GitHub token.' });
    }

    const tokenData: any = await tokenRes.json();
    if (tokenData.error) {
      return reply.status(400).send({ error: tokenData.error_description || tokenData.error });
    }

    // Fetch user info
    const userRes = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${tokenData.access_token}`, 'User-Agent': 'EVOLY-AI' },
    });
    const user: any = userRes.ok ? await userRes.json() : {};

    tokenStore.set('github', {
      provider: 'github',
      accessToken: tokenData.access_token,
      scopes: (tokenData.scope || '').split(',').map((s: string) => s.trim()),
      accountId: String(user.id || ''),
      accountName: user.login || 'GitHub User',
    });

    // Redirect back to app
    return reply.redirect(`${env.APP_URL}/settings?connected=github`);
  });

  // Status
  fastify.get('/oauth/github/status', async (_req, reply) => {
    return reply.send(tokenStore.getStatus('github'));
  });

  // Disconnect
  fastify.post('/oauth/github/disconnect', async (_req, reply) => {
    tokenStore.delete('github');
    return reply.send({ disconnected: true });
  });
}
