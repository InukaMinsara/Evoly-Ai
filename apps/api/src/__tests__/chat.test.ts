import { buildServer } from '../server';
import type { FastifyInstance } from 'fastify';

process.env['NODE_ENV'] = 'test';
process.env['GROQ_API_KEY'] = 'test-key-for-tests';
process.env['GROQ_MODEL'] = 'llama-3.3-70b-versatile';
process.env['PORT'] = '3003';
process.env['APP_URL'] = 'http://localhost:5173';

// Mock the GroqService so tests don't make real API calls
jest.mock('../services/groq.service', () => {
  const original = jest.requireActual('../services/groq.service');
  return {
    ...original,
    getGroqService: () => ({
      getModel: () => 'llama-3.3-70b-versatile',
      streamChat: jest.fn().mockImplementation(
        async (
          _messages: unknown,
          callbacks: { onToken: (t: string) => void; onComplete: (t: string) => void },
          _signal: unknown,
        ) => {
          callbacks.onToken('Hello');
          callbacks.onToken(' world');
          callbacks.onComplete('Hello world');
          return 'Hello world';
        },
      ),
    }),
  };
});

describe('Chat Route — Request Validation', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildServer();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('rejects request with no messages', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/ai/chat',
      payload: { messages: [] },
    });
    expect(response.statusCode).toBe(400);
  });

  it('rejects request with invalid role', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/ai/chat',
      payload: {
        messages: [{ role: 'hacker', content: 'Hello' }],
      },
    });
    expect(response.statusCode).toBe(400);
  });

  it('rejects empty message content', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/ai/chat',
      payload: {
        messages: [{ role: 'user', content: '' }],
      },
    });
    expect(response.statusCode).toBe(400);
  });

  it('rejects last message not from user', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/ai/chat',
      payload: {
        messages: [
          { role: 'user', content: 'Hello' },
          { role: 'assistant', content: 'World' },
        ],
      },
    });
    expect(response.statusCode).toBe(400);
  });

  it('accepts valid request and streams', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/ai/chat',
      payload: {
        messages: [{ role: 'user', content: 'What is Arduino?' }],
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toContain('text/event-stream');
    expect(response.body).toContain('data:');
  });

  it('rejects missing messages field', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/ai/chat',
      payload: {},
    });
    expect(response.statusCode).toBe(400);
  });
});
