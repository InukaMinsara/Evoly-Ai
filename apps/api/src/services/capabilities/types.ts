import { NormalizedImageResult } from '../ai/nvidia/nvidiaImage.service';

export type CapabilityType =
  | 'LLM'
  | 'IMAGE_GENERATION'
  | 'IMAGE_EDITING'
  | 'VIDEO_GENERATION'
  | 'TEXT_TO_SPEECH'
  | 'SPEECH_TO_TEXT'
  | 'WEB_SEARCH'
  | 'WEB_RESEARCH'
  | 'CODE_EXECUTION'
  | 'PLACES'
  | 'YOUTUBE_DATA'
  | 'YOUTUBE_ANALYTICS'
  | 'SEARCH_CONSOLE'
  | 'GITHUB'
  | 'ROBOTICS'
  | 'HARDWARE';

export interface ProviderAdapter<TOptions = unknown, TResult = unknown> {
  readonly id: string;
  readonly name: string;
  readonly capabilities: CapabilityType[];
  isConfigured(): boolean;
  execute(capability: CapabilityType, options: TOptions): Promise<TResult>;
}

// ─── Normalized Result and Error Shapes ──────────────────────────────

export interface NormalizedProviderError {
  code: string;
  message: string;
  retryable: boolean;
}

export interface NormalizedProviderResult<T = any> {
  success: boolean;
  provider: string;
  capability: CapabilityType;
  data?: T;
  error?: NormalizedProviderError;
}

// ─── Image Generation & Editing Contracts ───────────────────────────

export interface ImageGenerationOptions {
  prompt: string;
  model?: string;
  n?: number;
  seed?: number;
  width?: number;
  height?: number;
}

export interface ImageEditOptions {
  prompt: string;
  image: string;
  model?: string;
  seed?: number;
}

export type ImageResult = NormalizedImageResult;

// ─── Search & Research Contracts ────────────────────────────────────

export interface NormalizedSearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
  content?: string;
  publishedAt?: string;
  score?: number;
}

export interface WebSearchOptions {
  query: string;
  provider?: string;
  limit?: number;
}

export interface WebResearchOptions {
  topic: string;
  depth?: 'standard' | 'deep';
  extractContent?: boolean;
}

// ─── Video Generation Contracts ─────────────────────────────────────

export interface VideoGenerationOptions {
  prompt: string;
  provider?: 'kaggle' | 'nvidia';
  imageUrl?: string;
  model?: string;
  durationSeconds?: number;
  resolution?: string;
  seed?: number;
  outputFormat?: string;
}

export interface VideoResult {
  id: string;
  provider: string;
  model: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  createdAt: string;
  metadata?: Record<string, unknown>;
  error?: string;
}

// ─── Voice / Speech Contracts ───────────────────────────────────────

export interface TextToSpeechOptions {
  text: string;
  voiceId?: string;
  model?: string;
  provider?: string;
  outputFormat?: string;
}

export interface TextToSpeechResult {
  audioUrl?: string;
  audioBase64?: string;
  format: string;
  provider: string;
  durationSeconds?: number;
}

export interface SpeechToTextOptions {
  audioBuffer: Buffer;
  mimeType: string;
  language?: string;
  provider?: string;
}

export interface SpeechToTextResult {
  transcript: string;
  confidence?: number;
  language?: string;
  provider: string;
  words?: Array<{ word: string; start: number; end: number; confidence?: number }>;
}

// ─── Code Execution Contracts ───────────────────────────────────────

export interface CodeExecutionOptions {
  code: string;
  language: 'python' | 'javascript' | 'bash';
  timeoutMs?: number;
}

export interface CodeExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  executionTimeMs?: number;
  files?: Array<{ name: string; url?: string; content?: string }>;
}
