import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { videoService } from '../services/video/video.service';
import { voiceService } from '../services/voice/voice.service';

const videoSchema = z.object({
  prompt: z.string().min(1),
  provider: z.enum(['kaggle', 'nvidia']).optional(),
  imageUrl: z.string().optional(),
  durationSeconds: z.number().int().min(1).max(10).optional(),
  model: z.string().optional(),
});

const ttsSchema = z.object({
  text: z.string().min(1),
  voiceId: z.string().optional(),
  provider: z.string().optional(),
  model: z.string().optional(),
});

const sttSchema = z.object({
  audioBase64: z.string().min(1),
  mimeType: z.string().optional(),
  language: z.string().optional(),
  provider: z.string().optional(),
});

export async function mediaRoutes(fastify: FastifyInstance): Promise<void> {
  // Video generation
  fastify.post('/media/video/generate', async (request, reply) => {
    const parse = videoSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send({ error: parse.error.issues[0]?.message });
    }

    try {
      const result = await videoService.generate(parse.data);
      return reply.send({ success: true, ...result });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  });

  // Text-to-speech
  fastify.post('/media/voice/tts', async (request, reply) => {
    const parse = ttsSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send({ error: parse.error.issues[0]?.message });
    }

    try {
      const result = await voiceService.textToSpeech(parse.data);
      return reply.send({ success: true, ...result });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  });

  // Speech-to-text
  fastify.post('/media/voice/stt', async (request, reply) => {
    const parse = sttSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send({ error: parse.error.issues[0]?.message });
    }

    try {
      const buffer = Buffer.from(parse.data.audioBase64, 'base64');
      const result = await voiceService.speechToText({
        audioBuffer: buffer,
        mimeType: parse.data.mimeType || 'audio/wav',
        language: parse.data.language,
        provider: parse.data.provider,
      });
      return reply.send({ success: true, ...result });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  });
}
