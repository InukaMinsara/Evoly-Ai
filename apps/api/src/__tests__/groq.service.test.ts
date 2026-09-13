import { GroqService, StreamCallbacks } from '../services/groq.service';

describe('GroqService — Error Mapping', () => {
  let service: GroqService;

  beforeEach(() => {
    process.env['NODE_ENV'] = 'test';
    process.env['GROQ_API_KEY'] = 'test-key-12345';
    process.env['GROQ_MODEL'] = 'llama-3.3-70b-versatile';
    service = new GroqService();
  });

  it('exposes correct model', () => {
    expect(service.getModel()).toBe('llama-3.3-70b-versatile');
  });

  it('calls onError with INVALID_API_KEY for 401', async () => {
    // Mock Groq client on service
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (service as any).client = {
      chat: {
        completions: {
          create: jest.fn().mockRejectedValue({ status: 401, message: 'Unauthorized' }),
        },
      },
    };

    const callbacks: StreamCallbacks = {
      onToken: jest.fn(),
      onComplete: jest.fn(),
      onError: jest.fn(),
    };

    await expect(
      service.streamChat([{ role: 'user', content: 'Hello' }], callbacks),
    ).rejects.toMatchObject({ code: 'INVALID_API_KEY' });

    expect(callbacks.onError).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'INVALID_API_KEY', retryable: false }),
    );
  });

  it('calls onError with RATE_LIMITED for 429', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (service as any).client = {
      chat: {
        completions: {
          create: jest.fn().mockRejectedValue({ status: 429, message: 'Rate limited' }),
        },
      },
    };

    const callbacks: StreamCallbacks = {
      onToken: jest.fn(),
      onComplete: jest.fn(),
      onError: jest.fn(),
    };

    await expect(
      service.streamChat([{ role: 'user', content: 'Hello' }], callbacks),
    ).rejects.toMatchObject({ code: 'RATE_LIMITED', retryable: true });
  });

  it('calls onComplete on abort without error', async () => {
    const abortController = new AbortController();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (service as any).client = {
      chat: {
        completions: {
          create: jest.fn().mockImplementation(async () => {
            abortController.abort();
            const err = new Error('AbortError');
            err.name = 'AbortError';
            throw err;
          }),
        },
      },
    };

    const callbacks: StreamCallbacks = {
      onToken: jest.fn(),
      onComplete: jest.fn(),
      onError: jest.fn(),
    };

    await service.streamChat(
      [{ role: 'user', content: 'Hello' }],
      callbacks,
      abortController.signal,
    );

    expect(callbacks.onComplete).toHaveBeenCalled();
    expect(callbacks.onError).not.toHaveBeenCalled();
  });
});
