import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { searchService } from '../services/search/search.service';

const searchSchema = z.object({
  query: z.string().min(1),
  provider: z.string().optional(),
  limit: z.number().int().min(1).max(20).optional().default(5),
});

const researchSchema = z.object({
  topic: z.string().min(1),
  depth: z.enum(['standard', 'deep']).optional().default('standard'),
});

export async function searchRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.post('/search', async (request, reply) => {
    const parse = searchSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send({ error: parse.error.issues[0]?.message });
    }

    try {
      const { provider, results } = await searchService.search(parse.data.query, parse.data.provider, parse.data.limit);
      return reply.send({ success: true, provider, results });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  });

  fastify.post('/research', async (request, reply) => {
    const parse = researchSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send({ error: parse.error.issues[0]?.message });
    }

    try {
      const report = await searchService.research(parse.data.topic, parse.data.depth);
      return reply.send({ success: true, ...report });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  });
}
