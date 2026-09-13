import { FastifyInstance } from 'fastify';
import { getEnv } from '../../config/env';
import { tokenStore } from '../../services/oauth/token-store';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';

const YOUTUBE_ANALYTICS_SCOPES = [
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/yt-analytics.readonly',
  'openid',
  'email',
  'profile',
];

export async function youtubeOAuthRoutes(fastify: FastifyInstance): Promise<void> {
  // Shared Google OAuth credentials used for YouTube
  fastify.get('/oauth/youtube/start', async (_request, reply) => {
    const env = getEnv();
    const clientId = env.GOOGLE_CLIENT_ID;
    const clientSecret = env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return reply.status(503).send({
        error: 'Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.',
      });
    }

    const state = tokenStore.createState('yt');

    const redirectUri = env.GOOGLE_REDIRECT_URI || `http://localhost:${env.PORT}/api/oauth/google/callback`;
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: YOUTUBE_ANALYTICS_SCOPES.join(' '),
      access_type: 'offline',
      prompt: 'consent',
      state,
    });
    return reply.redirect(`${GOOGLE_AUTH_URL}?${params}`);
  });

  fastify.get('/oauth/youtube/callback', async (request, reply) => {
    const env = getEnv();
    const { code, state, error } = request.query as { code?: string; state?: string; error?: string };

    if (error) return reply.redirect(`${env.APP_URL}/settings?oauth_error=${encodeURIComponent(error)}`);
    if (!state || !tokenStore.validateState(state)) return reply.status(400).send({ error: 'Invalid state.' });
    if (!code) return reply.status(400).send({ error: 'No code.' });

    const clientId = env.GOOGLE_CLIENT_ID!;
    const clientSecret = env.GOOGLE_CLIENT_SECRET!;
    const redirectUri = env.GOOGLE_REDIRECT_URI || `http://localhost:${env.PORT}/api/oauth/google/callback`;

    const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) return reply.status(502).send({ error: 'Failed to get YouTube token.' });
    const tokenData: any = await tokenRes.json();

    const expiresAt = tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000) : undefined;
    tokenStore.set('youtube', {
      provider: 'youtube',
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt,
      scopes: (tokenData.scope || '').split(' '),
    });

    return reply.redirect(`${env.APP_URL}/youtube?connected=youtube`);
  });

  fastify.get('/oauth/youtube/status', async (_req, reply) => reply.send(tokenStore.getStatus('youtube')));
  fastify.post('/oauth/youtube/disconnect', async (_req, reply) => {
    tokenStore.delete('youtube');
    return reply.send({ disconnected: true });
  });
}
