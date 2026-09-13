import { voiceService } from '../services/voice/voice.service';

describe('VoiceService', () => {
  it('generates speech audio using ElevenLabs mock API', async () => {
    const originalFetch = global.fetch;
    const fakeAudioBuffer = Buffer.from('RIFF....WAVEfmt ');

    global.fetch = jest.fn().mockImplementation(async (url: string) => {
      if (url.includes('elevenlabs.io')) {
        return {
          ok: true,
          arrayBuffer: async () => fakeAudioBuffer,
        } as any;
      }
      return { ok: false, statusText: 'Error' } as any;
    });

    try {
      const res = await voiceService.textToSpeech({
        text: 'System alert: Robotic actuator calibrated successfully.',
        provider: 'elevenlabs',
      });

      expect(res.provider).toBe('elevenlabs');
      expect(res.format).toBe('audio/mpeg');
      expect(res.audioUrl).toContain('data:audio/mpeg;base64,');
    } finally {
      global.fetch = originalFetch;
    }
  });

  it('transcribes spoken audio using Deepgram mock API', async () => {
    const originalFetch = global.fetch;

    global.fetch = jest.fn().mockImplementation(async (url: string) => {
      if (url.includes('deepgram.com')) {
        return {
          ok: true,
          json: async () => ({
            results: {
              channels: [
                {
                  alternatives: [
                    {
                      transcript: 'Calibrate servo motor on pin 9',
                      confidence: 0.99,
                    },
                  ],
                },
              ],
            },
          }),
        } as any;
      }
      return { ok: false, statusText: 'Error' } as any;
    });

    try {
      const res = await voiceService.speechToText({
        audioBuffer: Buffer.from('fake-audio-bytes'),
        mimeType: 'audio/wav',
        provider: 'deepgram',
      });

      expect(res.provider).toBe('deepgram');
      expect(res.transcript).toBe('Calibrate servo motor on pin 9');
      expect(res.confidence).toBe(0.99);
    } finally {
      global.fetch = originalFetch;
    }
  });
});
