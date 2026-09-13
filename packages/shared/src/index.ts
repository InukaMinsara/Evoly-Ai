/**
 * EVOLY AI — Shared Types
 * These types are shared between the frontend and backend.
 */

// ─────────────────────────────────────────────
// Message & Conversation
// ─────────────────────────────────────────────

export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  images?: string[]; // Array of base64 data URLs
  toolActivity?: Array<{
    id: string;
    tool: string;
    args: any;
    status: 'running' | 'success' | 'error';
    result?: any;
  }>;
  createdAt: string; // ISO 8601
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────
// API Request / Response
// ─────────────────────────────────────────────

export interface ChatMessageInput {
  role: MessageRole;
  content: string;
}

export interface ChatRequest {
  messages: ChatMessageInput[];
  model?: string;
  context?: AIContext;
}

export interface ChatResponse {
  id: string;
  content: string;
  model: string;
  createdAt: string;
}

// ─────────────────────────────────────────────
// Streaming Events
// ─────────────────────────────────────────────

export type StreamEventType = 'start' | 'token' | 'complete' | 'error' | 'cancelled';

export interface StreamEvent {
  type: StreamEventType;
  token?: string;
  error?: string;
  messageId?: string;
}

// ─────────────────────────────────────────────
// AI Context (extensible — Step 1: optional)
// ─────────────────────────────────────────────

export interface AIContext {
  projectId?: string;
  board?: string;           // e.g. "arduino_uno", "esp32"
  components?: string[];    // e.g. ["HC-SR04", "SG90 servo"]
  code?: string;            // current code in editor
  wiring?: unknown;         // wiring data (Step N)
}

// ─────────────────────────────────────────────
// Errors
// ─────────────────────────────────────────────

export type AIErrorCode =
  | 'NOT_CONFIGURED'
  | 'INVALID_API_KEY'
  | 'RATE_LIMITED'
  | 'NETWORK_ERROR'
  | 'PROVIDER_ERROR'
  | 'INVALID_REQUEST'
  | 'EMPTY_RESPONSE'
  | 'TIMEOUT'
  | 'ABORTED'
  | 'UNKNOWN';

export interface AIError {
  code: AIErrorCode;
  message: string;
  retryable: boolean;
}

// ─────────────────────────────────────────────
// Health / Status
// ─────────────────────────────────────────────

export type AIConfigStatus = 'configured' | 'not_configured' | 'error';

export interface HealthResponse {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  version: string;
}

export interface AIStatusResponse {
  status: AIConfigStatus;
  model?: string;
  message?: string;
}

export interface AITestResponse {
  connected: boolean;
  message: string;
  latencyMs?: number;
}
