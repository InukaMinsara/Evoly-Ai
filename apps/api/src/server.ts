import Fastify from 'fastify';
import cors from '@fastify/cors';
import { getEnv } from './config/env';
import { healthRoutes } from './routes/health.route';
import { chatRoutes } from './routes/chat.route';
import { statusRoutes } from './routes/status.route';
import { githubOAuthRoutes } from './routes/oauth/github.route';
import { googleOAuthRoutes } from './routes/oauth/google.route';
import { youtubeOAuthRoutes } from './routes/oauth/youtube.route';
import { imageRoutes } from './routes/image.route';
import { mediaRoutes } from './routes/media.route';
import { searchRoutes } from './routes/search.route';
import { youtubeRoutes } from './routes/youtube.route';
import { searchConsoleRoutes } from './routes/search-console.route';
import { githubRoutes } from './routes/github.route';
import { codeRoutes } from './routes/code.route';

export async function buildServer() {
  const fastify = Fastify({
    logger: {
      level: process.env['NODE_ENV'] === 'production' ? 'warn' : 'info',
      transport:
        process.env['NODE_ENV'] === 'development'
          ? { target: 'pino-pretty', options: { colorize: true } }
          : undefined,
    },
    bodyLimit: 5_242_880, // 5 MB (for image uploads)
  });

  const env = getEnv();

  // ─────────────────────────────────────────────
  // CORS
  // ─────────────────────────────────────────────
  await fastify.register(cors, {
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (
        /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) ||
        origin === env.APP_URL
      ) {
        return cb(null, true);
      }
      cb(null, false);
    },
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // ─────────────────────────────────────────────
  // Routes — prefixed with /api
  // ─────────────────────────────────────────────
  await fastify.register(healthRoutes, { prefix: '/api' });
  await fastify.register(chatRoutes, { prefix: '/api' });
  await fastify.register(statusRoutes, { prefix: '/api' });
  await fastify.register(githubOAuthRoutes, { prefix: '/api' });
  await fastify.register(googleOAuthRoutes, { prefix: '/api' });
  await fastify.register(youtubeOAuthRoutes, { prefix: '/api' });
  await fastify.register(imageRoutes, { prefix: '/api' });
  await fastify.register(mediaRoutes, { prefix: '/api' });
  await fastify.register(searchRoutes, { prefix: '/api' });
  await fastify.register(youtubeRoutes, { prefix: '/api' });
  await fastify.register(searchConsoleRoutes, { prefix: '/api' });
  await fastify.register(githubRoutes, { prefix: '/api' });
  await fastify.register(codeRoutes, { prefix: '/api' });

  // ─────────────────────────────────────────────
  // 404 fallback
  // ─────────────────────────────────────────────
  fastify.setNotFoundHandler((_request, reply) => {
    void reply.status(404).send({ error: 'Not found' });
  });

  // ─────────────────────────────────────────────
  // Error handler — never expose stack traces
  // ─────────────────────────────────────────────
  fastify.setErrorHandler((error, _request, reply) => {
    fastify.log.error(error);
    void reply.status(error.statusCode ?? 500).send({
      error: 'An internal error occurred. Please retry.',
    });
  });

  return fastify;
}

// ─────────────────────────────────────────────
// Start server (only when run directly)
// ─────────────────────────────────────────────
async function main() {
  const env = getEnv();
  const fastify = await buildServer();

  try {
    await fastify.listen({ port: env.PORT, host: '0.0.0.0' });
    console.log(`\n🚀 EVOLY AI API running on http://localhost:${env.PORT}`);
    console.log(`   Health: http://localhost:${env.PORT}/api/health`);
    console.log(`   Status: http://localhost:${env.PORT}/api/system/status`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}
