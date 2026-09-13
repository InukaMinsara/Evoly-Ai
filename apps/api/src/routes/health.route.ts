import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { HealthResponse, AIStatusResponse, AITestResponse } from '@evoly/shared';
import { getEnv } from '../config/env';
import { getGroqService } from '../services/groq.service';

const VERSION = '1.0.0';

export async function healthRoutes(fastify: FastifyInstance): Promise<void> {
  // ─────────────────────────────────────────────
  // GET /api/health
  // ─────────────────────────────────────────────
  fastify.get(
    '/health',
    async (_request: FastifyRequest, reply: FastifyReply): Promise<void> => {
      const body: HealthResponse = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: VERSION,
      };
      await reply.status(200).send(body);
    },
  );

  // ─────────────────────────────────────────────
  // GET /api/ai/status
  // ─────────────────────────────────────────────
  fastify.get(
    '/ai/status',
    async (_request: FastifyRequest, reply: FastifyReply): Promise<void> => {
      try {
        const env = getEnv();
        if (!env.GROQ_API_KEY) {
          throw new Error('Not configured');
        }
        const body: AIStatusResponse = {
          status: 'configured',
          model: env.GROQ_MODEL,
        };
        await reply.status(200).send(body);
      } catch {
        const body: AIStatusResponse = {
          status: 'not_configured',
          message: 'GROQ_API_KEY is not configured.',
        };
        await reply.status(200).send(body);
      }
    },
  );

  // ─────────────────────────────────────────────
  // POST /api/ai/test
  // ─────────────────────────────────────────────
  fastify.post(
    '/ai/test',
    async (_request: FastifyRequest, reply: FastifyReply): Promise<void> => {
      try {
        const service = getGroqService();
        const result = await service.testConnection();
        const body: AITestResponse = {
          connected: true,
          message: 'Connected to Groq successfully.',
          latencyMs: result.latencyMs,
        };
        await reply.status(200).send(body);
      } catch (err: unknown) {
        const error = err as { message?: string; code?: string };
        const body: AITestResponse = {
          connected: false,
          message: error.message ?? 'Connection to Groq failed.',
        };
        await reply.status(200).send(body);
      }
    },
  );
}
