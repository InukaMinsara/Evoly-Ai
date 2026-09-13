import { FastifyInstance } from 'fastify';
import { getSystemStatus } from '../config/env';

export async function statusRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get('/system/status', async (_request, reply) => {
    const status = getSystemStatus();
    // Returns only the integration configuration states; never credentials or secrets
    return reply.send(status);
  });
}
