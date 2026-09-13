import { FastifyInstance } from 'fastify';
import { getEnv } from '../../config/env';
import { tokenStore } from '../../services/oauth/token-store';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';

const SEARCH_CONSOLE_SCOPES = [
  'https://www.googleapis.com/auth/webmasters.readonly',
  'openid',
  'email',
  'profile',
];

export async function googleOAuthRoutes(fastify: FastifyInstance): Promise<void> {
  // ─── Search Console OAuth ──────────────────────────────────────────────
  fastify.get('/oauth/google/search-console/start', async (_request, reply) => {
    const env = getEnv();
    if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
      return reply.status(503).send({ error: 'Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.' });
    }
    const state = tokenStore.createState('sc');

    const redirectUri = env.GOOGLE_REDIRECT_URI || `http://localhost:${env.PORT}/api/oauth/google/callback`;
    const params = new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: SEARCH_CONSOLE_SCOPES.join(' '),
      access_type: 'offline',
      prompt: 'consent',
      state,
    });
    return reply.redirect(`${GOOGLE_AUTH_URL}?${params}`);
  });

  // ─── Shared callback ───────────────────────────────────────────────────
  fastify.get('/oauth/google/callback', async (request, reply) => {
    const env = getEnv();
    const { code, state, error } = request.query as { code?: string; state?: string; error?: string };

    if (error) {
      return reply.redirect(`${env.APP_URL}/settings?oauth_error=${encodeURIComponent(error)}`);
    }
    if (!state || !tokenStore.validateState(state)) {
      return reply.status(400).send({ error: 'Invalid OAuth state.' });
    }
    if (!code) {
      return reply.status(400).send({ error: 'No code received.' });
    }

    const redirectUri = env.GOOGLE_REDIRECT_URI || `http://localhost:${env.PORT}/api/oauth/google/callback`;

    const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: env.GOOGLE_CLIENT_ID!,
        client_secret: env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      return reply.status(502).send({ error: 'Failed to exchange code for Google token.' });
    }

    const tokenData: any = await tokenRes.json();

    // Determine which service this was for based on state prefix
    const isYouTube = state.startsWith('yt_');
    const isSearchConsole = state.startsWith('sc_');
    const provider = isYouTube ? 'youtube' : isSearchConsole ? 'google_search_console' : 'google';
    const expiresAt = tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000) : undefined;

    tokenStore.set(provider, {
      provider,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt,
      scopes: (tokenData.scope || '').split(' '),
    });

    // Also store under shared google token for fallback
    if (provider !== 'google') {
      tokenStore.set('google', {
        provider: 'google',
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt,
        scopes: (tokenData.scope || '').split(' '),
      });
    }

    if (isYouTube) {
      return reply.redirect(`${env.APP_URL}/youtube?connected=youtube`);
    } else if (isSearchConsole) {
      return reply.redirect(`${env.APP_URL}/search-console?connected=search-console`);
    }
    return reply.redirect(`${env.APP_URL}/settings?connected=google`);
  });

  fastify.get('/oauth/google/search-console/status', async (_req, reply) => {
    return reply.send(tokenStore.getStatus('google_search_console'));
  });

  fastify.post('/oauth/google/search-console/disconnect', async (_req, reply) => {
    tokenStore.delete('google_search_console');
    return reply.send({ disconnected: true });
  });
}
