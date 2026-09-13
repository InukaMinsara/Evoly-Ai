import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { GroqMessage } from '../services/groq.service';
import { AgentOrchestrator } from '../services/agent/orchestrator';
import { SYSTEM_PROMPT } from '../config/system-prompt';
import { getEnv } from '../config/env';

// ─────────────────────────────────────────────
// Validation schemas
// ─────────────────────────────────────────────

const MESSAGE_ROLES = ['user', 'assistant', 'system'] as const;
const MAX_MESSAGES = 100;
const MAX_CONTENT_LENGTH = 32_000; // ~32k chars per message
const MAX_MESSAGES_TOTAL_CHARS = 200_000;

const chatMessageSchema = z.object({
  role: z.enum(MESSAGE_ROLES),
  content: z
    .string()
    .min(1, 'Message content cannot be empty')
    .max(MAX_CONTENT_LENGTH, `Message content exceeds ${MAX_CONTENT_LENGTH} characters`),
  images: z.array(z.string()).optional(),
});

const chatRequestSchema = z.object({
  messages: z
    .array(chatMessageSchema)
    .min(1, 'At least one message is required')
    .max(MAX_MESSAGES, `Cannot send more than ${MAX_MESSAGES} messages`),
  model: z.string().optional(),
});

type ChatRequestBody = z.infer<typeof chatRequestSchema>;

// ─────────────────────────────────────────────
// SSE helpers
// ─────────────────────────────────────────────

function sseEvent(type: string, data: Record<string, unknown>): string {
  return `data: ${JSON.stringify({ type, ...data })}\n\n`;
}

// ─────────────────────────────────────────────
// Route
// ─────────────────────────────────────────────

export async function chatRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.post(
    '/ai/chat',
    async (
      request: FastifyRequest<{ Body: ChatRequestBody }>,
      reply: FastifyReply,
    ): Promise<void> => {
      // 1. Parse and validate body
      const parseResult = chatRequestSchema.safeParse(request.body);
      if (!parseResult.success) {
        const errors = parseResult.error.errors.map((e) => e.message).join(', ');
        await reply.status(400).send({ error: errors });
        return;
      }

      const { messages, model: modelOverride } = parseResult.data;

      // 2. Validate total content size
      const totalChars = messages.reduce((sum, m) => sum + m.content.length, 0);
      if (totalChars > MAX_MESSAGES_TOTAL_CHARS) {
        await reply
          .status(400)
          .send({ error: 'Total message content exceeds size limit.' });
        return;
      }

      // 3. Validate last message is from user
      const lastMessage = messages[messages.length - 1];
      if (!lastMessage || lastMessage.role !== 'user') {
        await reply.status(400).send({ error: 'Last message must be from user.' });
        return;
      }

      // 4. Get model
      const env = getEnv();
      const selectedModel = modelOverride ?? env.GROQ_MODEL;

      // 5. Build full message list with system prompt
      const groqMessages: GroqMessage[] = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages.map((m) => {
          if (m.images && m.images.length > 0 && m.role === 'user') {
            return {
              role: 'user' as const,
              content: [
                { type: 'text' as const, text: m.content },
                ...m.images.map((img) => ({ type: 'image_url' as const, image_url: { url: img } })),
              ],
            };
          }
          return { role: m.role as 'user' | 'assistant' | 'system', content: m.content };
        }),
      ];

      // 6. Set up SSE headers
      void reply.raw.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'X-Accel-Buffering': 'no',
        Connection: 'keep-alive',
        'Access-Control-Allow-Origin': env.APP_URL,
      });

      // 7. Create AbortController linked to client disconnect
      const abortController = new AbortController();

      request.raw.on('aborted', () => {
        abortController.abort();
      });

      // 8. Send start event
      reply.raw.write(sseEvent('start', { model: selectedModel }));

      // 9. Stream with Agent Orchestrator
      try {
        const orchestrator = new AgentOrchestrator();

        await orchestrator.run(
          groqMessages,
          {
            onToken: (token) => {
              if (!reply.raw.destroyed) {
                reply.raw.write(sseEvent('token', { token }));
              }
            },
            onToolStart: (toolName, args) => {
              if (!reply.raw.destroyed) {
                reply.raw.write(sseEvent('tool_start', { tool: toolName, args }));
              }
            },
            onToolEnd: (toolName, result) => {
              if (!reply.raw.destroyed) {
                reply.raw.write(sseEvent('tool_end', { tool: toolName, result }));
              }
            },
            onComplete: (fullText) => {
              if (!reply.raw.destroyed) {
                if (abortController.signal.aborted) {
                  reply.raw.write(sseEvent('cancelled', { text: fullText }));
                } else {
                  reply.raw.write(sseEvent('complete', { text: fullText }));
                }
                reply.raw.end();
              }
            },
            onError: (aiError) => {
              if (!reply.raw.destroyed) {
                reply.raw.write(
                  sseEvent('error', {
                    code: aiError.code,
                    message: aiError.message,
                    retryable: aiError.retryable,
                  }),
                );
                reply.raw.end();
              }
            },
          },
          abortController.signal,
          selectedModel,
        );
      } catch (err: any) {
        // onError already handled in callbacks
        if (!reply.raw.destroyed) {
          reply.raw.write(
            sseEvent('error', {
              code: 'UNKNOWN',
              message: 'An unexpected error occurred. Please retry.',
              retryable: false,
            }),
          );
          reply.raw.end();
        }
      }
    },
  );
}
