import { FastifyInstance } from 'fastify';
import { youtubeService } from '../services/google/youtube.service';

export async function youtubeRoutes(fastify: FastifyInstance): Promise<void> {
  // Channel overview
  fastify.get('/youtube/channel', async (_request, reply) => {
    try {
      const channel = await youtubeService.getChannelOverview();
      return reply.send({ success: true, channel });
    } catch (err: any) {
      return reply.status(err.message.includes('not connected') ? 401 : 500).send({
        success: false,
        error: err.message,
      });
    }
  });

  // Video search
  fastify.get('/youtube/search', async (request, reply) => {
    const { q, max } = request.query as { q?: string; max?: string };
    if (!q) {
      return reply.status(400).send({ error: 'Query parameter "q" is required.' });
    }

    try {
      const videos = await youtubeService.searchVideos(q, max ? parseInt(max, 10) : 10);
      return reply.send({ success: true, videos });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  });

  // Video details
  fastify.post('/youtube/details', async (request, reply) => {
    const { videoIds } = request.body as { videoIds?: string[] };
    if (!Array.isArray(videoIds) || videoIds.length === 0) {
      return reply.status(400).send({ error: 'videoIds array is required.' });
    }

    try {
      const details = await youtubeService.getVideoDetails(videoIds);
      return reply.send({ success: true, details });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  });

  // YouTube Analytics
  fastify.get('/youtube/analytics', async (request, reply) => {
    const { startDate, endDate, metrics, dimensions, filters, sort } = request.query as any;

    const now = new Date();
    const end = endDate || now.toISOString().split('T')[0];
    const start =
      startDate || new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    try {
      const report = await youtubeService.getAnalyticsReport({
        startDate: start,
        endDate: end,
        metrics,
        dimensions,
        filters,
        sort,
      });
      return reply.send({ success: true, report });
    } catch (err: any) {
      return reply.status(err.message.includes('requires an authorized') ? 401 : 500).send({
        success: false,
        error: err.message,
      });
    }
  });
}
