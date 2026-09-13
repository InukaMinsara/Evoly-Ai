import { _resetEnvForTest, getSystemStatus } from '../config/env';

describe('Environment Validation & Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    _resetEnvForTest();
    // Start with a clean slate for integration tests
    for (const key of Object.keys(process.env)) {
      if (
        key.startsWith('GROQ_') ||
        key.startsWith('GEMINI_') ||
        key.startsWith('NVIDIA_') ||
        key.startsWith('GOOGLE_') ||
        key.startsWith('YOUTUBE_') ||
        key.startsWith('GITHUB_') ||
        key.startsWith('SUPABASE_') ||
        key.startsWith('WOKWI_') ||
        key.startsWith('HARDWARE_') ||
        key === 'PORT' ||
        key === 'APP_URL'
      ) {
        delete process.env[key];
      }
    }
  });

  afterAll(() => {
    process.env = originalEnv;
    _resetEnvForTest();
  });

  it('should load valid environment successfully', () => {
    process.env['NODE_ENV'] = 'test';
    process.env['GROQ_API_KEY'] = 'test-key';
    process.env['GROQ_MODEL'] = 'llama-3.3-70b-versatile';
    process.env['PORT'] = '3000';
    process.env['APP_URL'] = 'http://localhost:5173';

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { getEnv } = require('../config/env');
    const env = getEnv();

    expect(env.NODE_ENV).toBe('test');
    expect(env.GROQ_MODEL).toBe('llama-3.3-70b-versatile');
    expect(env.PORT).toBe(3000);
  });

  it('should use default values for optional vars', () => {
    process.env['NODE_ENV'] = 'test';
    process.env['GROQ_API_KEY'] = 'test-key';
    delete process.env['PORT'];
    delete process.env['APP_URL'];
    delete process.env['GROQ_MODEL'];

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { getEnv } = require('../config/env');
    const env = getEnv();

    expect(env.PORT).toBe(3000);
    expect(env.APP_URL).toBe('http://localhost:5173');
    expect(env.GROQ_MODEL).toBe('llama-3.3-70b-versatile');
  });

  it('should reject invalid PORT', () => {
    process.env['NODE_ENV'] = 'test';
    process.env['GROQ_API_KEY'] = 'test-key';
    process.env['PORT'] = 'not-a-number';

    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { getEnv } = require('../config/env');
    expect(() => getEnv()).toThrow();

    exitSpy.mockRestore();
    consoleSpy.mockRestore();
  });

  it('should reject when SUPABASE_URL is provided without SUPABASE_ANON_KEY', () => {
    process.env['NODE_ENV'] = 'test';
    process.env['GROQ_API_KEY'] = 'test-key';
    process.env['SUPABASE_URL'] = 'https://example.supabase.co';
    delete process.env['SUPABASE_ANON_KEY'];

    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { getEnv } = require('../config/env');
    expect(() => getEnv()).toThrow();

    exitSpy.mockRestore();
    consoleSpy.mockRestore();
  });

  it('should return safe status without leaking credentials via getSystemStatus', () => {
    process.env['NODE_ENV'] = 'test';
    process.env['GROQ_API_KEY'] = 'super-secret-groq-key';
    process.env['GROQ_MODEL'] = 'llama-3.3-70b-versatile';
    process.env['GOOGLE_CLIENT_SECRET'] = 'secret-client-secret';

    const status = getSystemStatus();

    expect(status.groq.configured).toBe(true);
    expect(status.gemini.configured).toBe(false);

    // Crucial: ensure no secret values exist anywhere in the returned status object
    const serialized = JSON.stringify(status);
    expect(serialized).not.toContain('super-secret-groq-key');
    expect(serialized).not.toContain('secret-client-secret');
  });

  it('should not crash when optional integrations are missing', () => {
    process.env['NODE_ENV'] = 'test';
    process.env['GROQ_API_KEY'] = 'basic-key';
    // Clear all optional integrations
    delete process.env['GEMINI_API_KEY'];
    delete process.env['NVIDIA_API_KEY'];
    delete process.env['GOOGLE_CLIENT_ID'];
    delete process.env['GOOGLE_CLIENT_SECRET'];
    delete process.env['GOOGLE_SEARCH_API_KEY'];
    delete process.env['GOOGLE_MAPS_API_KEY'];
    delete process.env['YOUTUBE_API_KEY'];
    delete process.env['GITHUB_CLIENT_ID'];
    delete process.env['WOKWI_CLI_TOKEN'];
    delete process.env['HARDWARE_BRIDGE_SECRET'];

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { getEnv } = require('../config/env');
    expect(() => getEnv()).not.toThrow();

    const status = getSystemStatus();
    expect(status.groq.configured).toBe(true);
    expect(status.gemini.configured).toBe(false);
    expect(status.nvidiaNim.configured).toBe(false);
    expect(status.googleSearch.configured).toBe(false);
    expect(status.hardwareBridge.configured).toBe(false);
  });
});
