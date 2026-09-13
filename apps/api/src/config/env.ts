import path from 'path';
import dotenv from 'dotenv';
import { z } from 'zod';

// Prefer API-specific settings, then fall back to workspace-level settings.
dotenv.config({ path: path.resolve(__dirname, '../../.env'), override: true });
dotenv.config({ path: path.resolve(process.cwd(), '.env'), override: true });
dotenv.config({ path: path.resolve(__dirname, '../../../../.env'), override: true });

const envSchema = z
  .object({
    // ─── Core Application ───────────────────────────────────────────────
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().int().positive().default(3000),
    APP_URL: z.string().url().default('http://localhost:5173'),

    // ─── Supabase ───────────────────────────────────────────────────────
    SUPABASE_URL: z.string().optional().transform((v) => v?.trim() || undefined),
    SUPABASE_ANON_KEY: z.string().optional().transform((v) => v?.trim() || undefined),
    SUPABASE_SERVICE_ROLE_KEY: z.string().optional().transform((v) => v?.trim() || undefined),

    // ─── Primary AI: Groq ───────────────────────────────────────────────
    GROQ_API_KEY: z.string().default(''),
    GROQ_MODEL: z.string().default('llama-3.3-70b-versatile'),

    // ─── Secondary AI: Gemini ───────────────────────────────────────────
    GEMINI_API_KEY: z.string().optional().transform((v) => v?.trim() || undefined),
    GEMINI_MODEL: z.string().default('gemini-3.8-flash'),

    // ─── Image Generation: NVIDIA NIM ────────────────────────────────────
    NVIDIA_API_KEY: z.string().optional().transform((v) => v?.trim() || undefined),
    NVIDIA_BASE_URL: z.string().optional().transform((v) => v?.trim() || undefined),
    NVIDIA_IMAGE_MODEL: z.string().default('qwen-image'),
    NVIDIA_IMAGE_EDIT_MODEL: z.string().default('qwen-image-edit-nvpcb-ovsl2sl'),

    // ─── Google OAuth (Shared for Search Console, YouTube, Analytics) ───
    GOOGLE_CLIENT_ID: z.string().optional().transform((v) => v?.trim() || undefined),
    GOOGLE_CLIENT_SECRET: z.string().optional().transform((v) => v?.trim() || undefined),
    GOOGLE_REDIRECT_URI: z
      .string()
      .default('http://localhost:3000/api/oauth/google/callback'),

    // ─── Google Search ──────────────────────────────────────────────────
    GOOGLE_SEARCH_API_KEY: z.string().optional().transform((v) => v?.trim() || undefined),
    GOOGLE_SEARCH_ENGINE_ID: z.string().optional().transform((v) => v?.trim() || undefined),

    // ─── Google Places ──────────────────────────────────────────────────
    GOOGLE_MAPS_API_KEY: z.string().optional().transform((v) => v?.trim() || undefined),

    // ─── YouTube Data API ───────────────────────────────────────────────
    YOUTUBE_API_KEY: z.string().optional().transform((v) => v?.trim() || undefined),

    // ─── GitHub OAuth ───────────────────────────────────────────────────
    GITHUB_CLIENT_ID: z.string().optional().transform((v) => v?.trim() || undefined),
    GITHUB_CLIENT_SECRET: z.string().optional().transform((v) => v?.trim() || undefined),
    GITHUB_APP_ID: z.string().optional().transform((v) => v?.trim() || undefined),
    GITHUB_PRIVATE_KEY: z.string().optional().transform((v) => v?.trim() || undefined),

    // ─── Wokwi ──────────────────────────────────────────────────────────
    WOKWI_CLI_TOKEN: z.string().optional().transform((v) => v?.trim() || undefined),

    // ─── Local Hardware Bridge ──────────────────────────────────────────
    HARDWARE_BRIDGE_URL: z.string().default('http://localhost:4242'),
    HARDWARE_BRIDGE_SECRET: z.string().optional().transform((v) => v?.trim() || undefined),

    // ─── Video Generation ──────────────────────────────────────────────
    NVIDIA_VIDEO_MODEL: z.string().optional().transform((v) => v?.trim() || undefined),
    KAGGLE_USERNAME: z.string().optional().transform((v) => v?.trim() || undefined),
    KAGGLE_KEY: z.string().optional().transform((v) => v?.trim() || undefined),
    KAGGLE_VIDEO_NOTEBOOK: z.string().optional().transform((v) => v?.trim() || undefined),
    KAGGLE_VIDEO_MODEL: z.string().optional().transform((v) => v?.trim() || undefined),
    KAGGLE_VIDEO_OUTPUT_DIR: z.string().optional().transform((v) => v?.trim() || undefined),

    // ─── Optional AI / LLM Providers ────────────────────────────────────
    OPENAI_API_KEY: z.string().optional().transform((v) => v?.trim() || undefined),
    OPENAI_MODEL: z.string().default('gpt-4o'),
    ANTHROPIC_API_KEY: z.string().optional().transform((v) => v?.trim() || undefined),
    ANTHROPIC_MODEL: z.string().default('claude-3-5-sonnet-20241022'),
    OPENROUTER_API_KEY: z.string().optional().transform((v) => v?.trim() || undefined),
    MISTRAL_API_KEY: z.string().optional().transform((v) => v?.trim() || undefined),
    COHERE_API_KEY: z.string().optional().transform((v) => v?.trim() || undefined),
    TOGETHER_API_KEY: z.string().optional().transform((v) => v?.trim() || undefined),
    SAMBANOVA_API_KEY: z.string().optional().transform((v) => v?.trim() || undefined),
    CEREBRAS_API_KEY: z.string().optional().transform((v) => v?.trim() || undefined),
    EXPERIENTIAL_API_KEY: z.string().optional().transform((v) => v?.trim() || undefined),
    AIHUBMIX_API_KEY: z.string().optional().transform((v) => v?.trim() || undefined),
    UNOROUTER_API_KEY: z.string().optional().transform((v) => v?.trim() || undefined),
    SPICYAI_API_KEY: z.string().optional().transform((v) => v?.trim() || undefined),

    // ─── Search / Research Providers ────────────────────────────────────
    TAVILY_API_KEY: z.string().optional().transform((v) => v?.trim() || undefined),
    EXA_API_KEY: z.string().optional().transform((v) => v?.trim() || undefined),
    SERPER_API_KEY: z.string().optional().transform((v) => v?.trim() || undefined),
    JINA_API_KEY: z.string().optional().transform((v) => v?.trim() || undefined),
    FIRECRAWL_API_KEY: z.string().optional().transform((v) => v?.trim() || undefined),
    BING_API_KEY: z.string().optional().transform((v) => v?.trim() || undefined),
    YOU_COM_API_KEY: z.string().optional().transform((v) => v?.trim() || undefined),

    // ─── Voice / Speech Providers ───────────────────────────────────────
    ELEVENLABS_API_KEY: z.string().optional().transform((v) => v?.trim() || undefined),
    DEEPGRAM_API_KEY: z.string().optional().transform((v) => v?.trim() || undefined),
    CARTESIA_API_KEY: z.string().optional().transform((v) => v?.trim() || undefined),
    ASSEMBLYAI_API_KEY: z.string().optional().transform((v) => v?.trim() || undefined),

    // ─── Other Media / Code Execution ───────────────────────────────────
    REPLICATE_API_TOKEN: z.string().optional().transform((v) => v?.trim() || undefined),
    POLLINATIONS_AI_API_KEY: z.string().optional().transform((v) => v?.trim() || undefined),
    E2B_API_KEY: z.string().optional().transform((v) => v?.trim() || undefined),

    // ─── Optional Observability ─────────────────────────────────────────
    LANGFUSE_PUBLIC_KEY: z.string().optional().transform((v) => v?.trim() || undefined),
    LANGFUSE_SECRET_KEY: z.string().optional().transform((v) => v?.trim() || undefined),
  })
  .refine(
    (data) => {
      // If Supabase persistence is enabled via SUPABASE_URL, SUPABASE_ANON_KEY is required
      if (data.SUPABASE_URL && !data.SUPABASE_ANON_KEY) {
        return false;
      }
      return true;
    },
    {
      message: 'SUPABASE_ANON_KEY is required when SUPABASE_URL is provided',
      path: ['SUPABASE_ANON_KEY'],
    },
  );

export type Env = z.infer<typeof envSchema>;

let _env: Env | null = null;

export function getEnv(): Env {
  if (_env) return _env;

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.errors
      .map((e) => `  • ${e.path.join('.')}: ${e.message}`)
      .join('\n');
    console.error('❌ Environment configuration error:\n' + errors);
    console.error('\nPlease check your .env file. See .env.example for reference.');
    process.exit(1);
  }

  _env = result.data;

  const maskedKey =
    _env.GROQ_API_KEY.length > 8
      ? `${_env.GROQ_API_KEY.slice(0, 7)}...${_env.GROQ_API_KEY.slice(-4)}`
      : _env.GROQ_API_KEY
        ? '***'
        : '(not set)';

  if (_env.NODE_ENV !== 'test') {
    console.log(`✅ Environment loaded (NODE_ENV=${_env.NODE_ENV})`);
    console.log(`   GROQ_API_KEY: ${maskedKey}`);
    console.log(`   GROQ_MODEL:   ${_env.GROQ_MODEL}`);
    console.log(`   Gemini: ${_env.GEMINI_API_KEY ? 'configured' : 'not configured'}`);
    console.log(`   NVIDIA NIM:   ${_env.NVIDIA_API_KEY ? 'configured' : 'not configured'}`);
  }

  return _env;
}

/** Reset cached env — only for test isolation */
export function _resetEnvForTest(): void {
  _env = null;
}

export type IntegrationStatusState = 'CONFIGURED' | 'NOT_CONFIGURED' | 'INVALID' | 'ERROR';

/**
 * Backend-only safe status report.
 * NEVER returns actual credential values, client secrets, or private keys.
 */
export function getSystemStatus() {
  const env = getEnv();

  return {
    groq: {
      configured: Boolean(env.GROQ_API_KEY && env.GROQ_MODEL),
    },
    gemini: {
      configured: Boolean(env.GEMINI_API_KEY),
    },
    openai: {
      configured: Boolean(env.OPENAI_API_KEY),
    },
    anthropic: {
      configured: Boolean(env.ANTHROPIC_API_KEY),
    },
    openrouter: {
      configured: Boolean(env.OPENROUTER_API_KEY),
    },
    mistral: {
      configured: Boolean(env.MISTRAL_API_KEY),
    },
    cohere: {
      configured: Boolean(env.COHERE_API_KEY),
    },
    together: {
      configured: Boolean(env.TOGETHER_API_KEY),
    },
    sambanova: {
      configured: Boolean(env.SAMBANOVA_API_KEY),
    },
    cerebras: {
      configured: Boolean(env.CEREBRAS_API_KEY),
    },
    spicyai: {
      configured: Boolean(env.SPICYAI_API_KEY),
    },
    nvidiaNim: {
      configured: Boolean(env.NVIDIA_API_KEY),
      imageConfigured: Boolean(env.NVIDIA_API_KEY && env.NVIDIA_IMAGE_MODEL),
      imageEditConfigured: Boolean(env.NVIDIA_API_KEY && env.NVIDIA_IMAGE_EDIT_MODEL),
      videoConfigured: Boolean(env.NVIDIA_API_KEY && env.NVIDIA_VIDEO_MODEL),
    },
    kaggle: {
      configured: Boolean(env.KAGGLE_USERNAME && env.KAGGLE_KEY),
      notebook: env.KAGGLE_VIDEO_NOTEBOOK || null,
      model: env.KAGGLE_VIDEO_MODEL || null,
    },
    googleSearch: {
      configured: Boolean(env.GOOGLE_SEARCH_API_KEY && env.GOOGLE_SEARCH_ENGINE_ID),
    },
    tavily: {
      configured: Boolean(env.TAVILY_API_KEY),
    },
    exa: {
      configured: Boolean(env.EXA_API_KEY),
    },
    serper: {
      configured: Boolean(env.SERPER_API_KEY),
    },
    jina: {
      configured: Boolean(env.JINA_API_KEY),
    },
    firecrawl: {
      configured: Boolean(env.FIRECRAWL_API_KEY),
    },
    bing: {
      configured: Boolean(env.BING_API_KEY),
    },
    youCom: {
      configured: Boolean(env.YOU_COM_API_KEY),
    },
    places: {
      configured: Boolean(env.GOOGLE_MAPS_API_KEY),
    },
    googleOAuth: {
      configured: Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET),
    },
    youtubeApi: {
      configured: Boolean(env.YOUTUBE_API_KEY),
    },
    githubOAuth: {
      configured: Boolean(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET),
    },
    elevenlabs: {
      configured: Boolean(env.ELEVENLABS_API_KEY),
    },
    deepgram: {
      configured: Boolean(env.DEEPGRAM_API_KEY),
    },
    cartesia: {
      configured: Boolean(env.CARTESIA_API_KEY),
    },
    assemblyai: {
      configured: Boolean(env.ASSEMBLYAI_API_KEY),
    },
    e2b: {
      configured: Boolean(env.E2B_API_KEY),
    },
    replicate: {
      configured: Boolean(env.REPLICATE_API_TOKEN),
    },
    pollinations: {
      configured: Boolean(env.POLLINATIONS_AI_API_KEY),
    },
    wokwi: {
      configured: Boolean(env.WOKWI_CLI_TOKEN),
    },
    hardwareBridge: {
      configured: Boolean(env.HARDWARE_BRIDGE_SECRET),
    },
    supabase: {
      configured: Boolean(env.SUPABASE_URL && env.SUPABASE_ANON_KEY),
    },
  };
}
