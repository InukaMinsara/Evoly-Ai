import { buildServer } from '../server';
import type { FastifyInstance } from 'fastify';

// Set test env before importing anything else
process.env['NODE_ENV'] = 'test';
process.env['GROQ_API_KEY'] = 'test-key-for-tests';
process.env['GROQ_MODEL'] = 'llama-3.3-70b-versatile';
process.env['PORT'] = '3002';
process.env['APP_URL'] = 'http://localhost:5173';

describe('Health Routes', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildServer();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/health', () => {
    it('returns 200 with status ok', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/health',
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.status).toBe('ok');
      expect(body.timestamp).toBeDefined();
      expect(body.version).toBeDefined();
    });
  });

  describe('GET /api/ai/status', () => {
    it('returns configured status when API key is set', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/ai/status',
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.status).toBe('configured');
      expect(body.model).toBe('llama-3.3-70b-versatile');
    });

    it('does not expose the API key', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/ai/status',
      });

      const rawBody = response.body;
      expect(rawBody).not.toContain('test-key');
      expect(rawBody).not.toContain('gsk_');
    });
  });

  describe('404 fallback', () => {
    it('returns 404 for unknown routes', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/nonexistent',
      });
      expect(response.statusCode).toBe(404);
    });
  });
});
