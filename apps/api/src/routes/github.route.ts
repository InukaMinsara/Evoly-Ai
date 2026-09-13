import { FastifyInstance } from 'fastify';
import { gitHubService } from '../services/github/github.service';

export async function githubRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get('/github/repos', async (request, reply) => {
    const { perPage } = request.query as { perPage?: string };
    try {
      const repos = await gitHubService.listRepositories(perPage ? parseInt(perPage, 10) : 30);
      return reply.send({ success: true, repos });
    } catch (err: any) {
      return reply.status(err.message.includes('not connected') ? 401 : 500).send({
        success: false,
        error: err.message,
      });
    }
  });

  fastify.get('/github/contents', async (request, reply) => {
    const { owner, repo, path } = request.query as { owner?: string; repo?: string; path?: string };
    if (!owner || !repo) {
      return reply.status(400).send({ error: 'owner and repo query params are required.' });
    }

    try {
      const contents = await gitHubService.getContents(owner, repo, path || '');
      return reply.send({ success: true, contents });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  });

  fastify.get('/github/issues', async (request, reply) => {
    const { owner, repo, state } = request.query as { owner?: string; repo?: string; state?: any };
    if (!owner || !repo) {
      return reply.status(400).send({ error: 'owner and repo query params are required.' });
    }

    try {
      const issues = await gitHubService.listIssues(owner, repo, state || 'open');
      return reply.send({ success: true, issues });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  });

  fastify.get('/github/pulls', async (request, reply) => {
    const { owner, repo, state } = request.query as { owner?: string; repo?: string; state?: any };
    if (!owner || !repo) {
      return reply.status(400).send({ error: 'owner and repo query params are required.' });
    }

    try {
      const pulls = await gitHubService.listPullRequests(owner, repo, state || 'open');
      return reply.send({ success: true, pulls });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  });
}
