import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { e2bCodeService } from '../services/code/e2b.service';

const executeSchema = z.object({
  code: z.string().min(1),
  language: z.enum(['python', 'javascript', 'bash']).optional().default('python'),
  timeoutMs: z.number().int().optional().default(30000),
});

export async function codeRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.post('/code/execute', async (request, reply) => {
    const parse = executeSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send({ error: parse.error.issues[0]?.message });
    }

    try {
      const result = await e2bCodeService.execute(parse.data);
      return reply.send({ success: true, ...result });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  });
}
