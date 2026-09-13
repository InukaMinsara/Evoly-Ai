import { z } from 'zod';
import { AITool } from './tool.interface';
import { voiceService } from '../../voice/voice.service';

export const speechToTextTool: AITool<{
  audioBase64: string;
  mimeType?: string;
  language?: string;
  provider?: string;
}> = {
  name: 'speechToText',
  description:
    'Transcribe spoken voice audio or recorded lab instructions into text using Deepgram Nova-2 or AssemblyAI.',
  parameters: z.object({
    audioBase64: z.string().describe('Base64 encoded audio string.'),
    mimeType: z.string().optional().default('audio/wav').describe('MIME type of the audio.'),
    language: z.string().optional().describe('Optional expected language code (e.g. en).'),
    provider: z.string().optional().describe('Optional provider: deepgram or assemblyai.'),
  }),
  execute: async ({ audioBase64, mimeType, language, provider }) => {
    try {
      const buffer = Buffer.from(audioBase64, 'base64');
      const result = await voiceService.speechToText({
        audioBuffer: buffer,
        mimeType: mimeType || 'audio/wav',
        language,
        provider,
      });

      return {
        success: true,
        data: result,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Speech-to-text transcription failed.',
        code: 'STT_ERROR',
      };
    }
  },
};
