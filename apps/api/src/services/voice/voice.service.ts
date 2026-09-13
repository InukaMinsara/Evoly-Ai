import { getEnv } from '../../config/env';
import { TextToSpeechOptions, TextToSpeechResult, SpeechToTextOptions, SpeechToTextResult } from '../capabilities/types';

export class VoiceService {
  /**
   * Text to Speech using configured provider (ElevenLabs > Deepgram > Cartesia)
   */
  async textToSpeech(options: TextToSpeechOptions): Promise<TextToSpeechResult> {
    const env = getEnv();
    const provider = options.provider || this.getAvailableTTSProvider();

    if (!provider) {
      throw new Error('No TTS provider configured. Please set ELEVENLABS_API_KEY, DEEPGRAM_API_KEY, or CARTESIA_API_KEY in .env.');
    }

    switch (provider) {
      case 'elevenlabs': {
        const voiceId = options.voiceId || '21m00Tcm4TlvDq8ikWAM'; // Rachel default
        const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': env.ELEVENLABS_API_KEY!,
            Accept: 'audio/mpeg',
          },
          body: JSON.stringify({
            text: options.text,
            model_id: options.model || 'eleven_multilingual_v2',
          }),
        });

        if (!res.ok) {
          const errText = await res.text().catch(() => '');
          if (res.status === 402 && env.DEEPGRAM_API_KEY) {
            return await this.textToSpeech({ ...options, provider: 'deepgram' });
          }
          throw new Error(`ElevenLabs error (${res.status}): ${errText || res.statusText}`);
        }

        const buffer = await res.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        return {
          audioUrl: `data:audio/mpeg;base64,${base64}`,
          audioBase64: base64,
          format: 'audio/mpeg',
          provider: 'elevenlabs',
        };
      }

      case 'deepgram': {
        const model = options.model || 'aura-asteria-en';
        const res = await fetch(`https://api.deepgram.com/v1/speak?model=${encodeURIComponent(model)}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${env.DEEPGRAM_API_KEY}`,
          },
          body: JSON.stringify({ text: options.text }),
        });

        if (!res.ok) {
          const errText = await res.text().catch(() => '');
          throw new Error(`Deepgram TTS error (${res.status}): ${errText || res.statusText}`);
        }

        const buffer = await res.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        return {
          audioUrl: `data:audio/mp3;base64,${base64}`,
          audioBase64: base64,
          format: 'audio/mp3',
          provider: 'deepgram',
        };
      }

      case 'cartesia': {
        const res = await fetch('https://api.cartesia.ai/tts/bytes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': env.CARTESIA_API_KEY!,
            'Cartesia-Version': '2024-06-10',
          },
          body: JSON.stringify({
            model_id: options.model || 'sonic-english',
            transcript: options.text,
            voice: {
              mode: 'id',
              id: options.voiceId || 'a0e99841-438c-4a64-b679-ae501e7d6091',
            },
            output_format: {
              container: 'raw',
              encoding: 'pcm_f32le',
              sample_rate: 44100,
            },
          }),
        });

        if (!res.ok) {
          const errText = await res.text().catch(() => '');
          throw new Error(`Cartesia error (${res.status}): ${errText || res.statusText}`);
        }

        const buffer = await res.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        return {
          audioUrl: `data:audio/wav;base64,${base64}`,
          audioBase64: base64,
          format: 'audio/wav',
          provider: 'cartesia',
        };
      }

      default:
        throw new Error(`Unsupported TTS provider: ${provider}`);
    }
  }

  /**
   * Speech to Text using configured provider (Deepgram > AssemblyAI)
   */
  async speechToText(options: SpeechToTextOptions): Promise<SpeechToTextResult> {
    const env = getEnv();
    const provider = options.provider || this.getAvailableSTTProvider();

    if (!provider) {
      throw new Error('No STT provider configured. Please set DEEPGRAM_API_KEY or ASSEMBLYAI_API_KEY in .env.');
    }

    switch (provider) {
      case 'deepgram': {
        const res = await fetch('https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true', {
          method: 'POST',
          headers: {
            'Content-Type': options.mimeType || 'audio/wav',
            Authorization: `Token ${env.DEEPGRAM_API_KEY}`,
          },
          body: options.audioBuffer,
        });

        if (!res.ok) {
          const errText = await res.text().catch(() => '');
          throw new Error(`Deepgram STT error (${res.status}): ${errText || res.statusText}`);
        }

        const data: any = await res.json();
        const transcript = data.results?.channels?.[0]?.alternatives?.[0]?.transcript || '';
        const confidence = data.results?.channels?.[0]?.alternatives?.[0]?.confidence;

        return {
          transcript,
          confidence,
          provider: 'deepgram',
        };
      }

      case 'assemblyai': {
        // Step 1: Upload audio buffer
        const uploadRes = await fetch('https://api.assemblyai.com/v2/upload', {
          method: 'POST',
          headers: {
            Authorization: env.ASSEMBLYAI_API_KEY!,
            'Content-Type': 'application/octet-stream',
          },
          body: options.audioBuffer,
        });

        if (!uploadRes.ok) {
          throw new Error(`AssemblyAI upload failed: ${uploadRes.statusText}`);
        }

        const uploadData: any = await uploadRes.json();
        const uploadUrl = uploadData.upload_url;

        // Step 2: Start transcription
        const transcriptRes = await fetch('https://api.assemblyai.com/v2/transcript', {
          method: 'POST',
          headers: {
            Authorization: env.ASSEMBLYAI_API_KEY!,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ audio_url: uploadUrl }),
        });

        if (!transcriptRes.ok) {
          throw new Error(`AssemblyAI transcript request failed: ${transcriptRes.statusText}`);
        }

        const transcriptData: any = await transcriptRes.json();
        const transcriptId = transcriptData.id;

        // Step 3: Poll for completion (up to 30s)
        const startTime = Date.now();
        while (Date.now() - startTime < 30000) {
          await new Promise((r) => setTimeout(r, 1000));
          const pollRes = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
            headers: { Authorization: env.ASSEMBLYAI_API_KEY! },
          });
          if (pollRes.ok) {
            const pollData: any = await pollRes.json();
            if (pollData.status === 'completed') {
              return {
                transcript: pollData.text || '',
                confidence: pollData.confidence,
                provider: 'assemblyai',
              };
            }
            if (pollData.status === 'error') {
              throw new Error(`AssemblyAI error: ${pollData.error}`);
            }
          }
        }

        throw new Error('AssemblyAI transcription timed out.');
      }

      default:
        throw new Error(`Unsupported STT provider: ${provider}`);
    }
  }

  private getAvailableTTSProvider(): string | null {
    const env = getEnv();
    if (env.ELEVENLABS_API_KEY) return 'elevenlabs';
    if (env.DEEPGRAM_API_KEY) return 'deepgram';
    if (env.CARTESIA_API_KEY) return 'cartesia';
    return null;
  }

  private getAvailableSTTProvider(): string | null {
    const env = getEnv();
    if (env.DEEPGRAM_API_KEY) return 'deepgram';
    if (env.ASSEMBLYAI_API_KEY) return 'assemblyai';
    return null;
  }
}

export const voiceService = new VoiceService();
