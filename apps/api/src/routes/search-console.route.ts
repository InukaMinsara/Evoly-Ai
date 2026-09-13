import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { searchConsoleService } from '../services/google/search-console.service';

const querySchema = z.object({
  siteUrl: z.string().min(1),
  startDate: z.string(),
  endDate: z.string(),
  dimensions: z.array(z.enum(['query', 'page', 'country', 'device', 'date'])).optional(),
  rowLimit: z.number().int().min(1).max(50).optional(),
});

export async function searchConsoleRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get('/search-console/sites', async (_request, reply) => {
    try {
      const sites = await searchConsoleService.listSites();
      return reply.send({ success: true, sites });
    } catch (err: any) {
      return reply.status(err.message.includes('not connected') ? 401 : 500).send({
        success: false,
        error: err.message,
      });
    }
  });

  fastify.post('/search-console/query', async (request, reply) => {
    const parse = querySchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send({ error: parse.error.issues[0]?.message });
    }

    try {
      const results = await searchConsoleService.queryPerformance(parse.data);
      return reply.send({ success: true, ...results });
    } catch (err: any) {
      return reply.status(err.message.includes('not connected') ? 401 : 500).send({
        success: false,
        error: err.message,
      });
    }
  });
}
