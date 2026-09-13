import { z } from 'zod';
import { AITool } from './tool.interface';
import { voiceService } from '../../voice/voice.service';

export const textToSpeechTool: AITool<{
  text: string;
  voiceId?: string;
  provider?: string;
}> = {
  name: 'textToSpeech',
  description:
    'Convert engineering explanations, alerts, or narration into high-quality spoken audio using ElevenLabs, Deepgram, or Cartesia.',
  parameters: z.object({
    text: z.string().min(1).describe('The text to convert to speech.'),
    voiceId: z.string().optional().describe('Optional voice identifier.'),
    provider: z.string().optional().describe('Optional provider: elevenlabs, deepgram, cartesia.'),
  }),
  execute: async ({ text, voiceId, provider }) => {
    try {
      const result = await voiceService.textToSpeech({
        text,
        voiceId,
        provider,
      });

      return {
        success: true,
        data: result,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Text-to-speech generation failed.',
        code: 'TTS_ERROR',
      };
    }
  },
};
