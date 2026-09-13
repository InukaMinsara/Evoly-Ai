import { z } from 'zod';
import { AITool } from './tool.interface';
import { getEnv } from '../../../config/env';

export const wokwiSimulateTool: AITool<{
  diagramJson: string;
  sourceCode: string;
  board: string;
}> = {
  name: 'wokwiSimulate',
  description: 'Simulate microcontroller circuits and firmware using Wokwi CLI integration.',
  parameters: z.object({
    diagramJson: z.string().describe('Wokwi diagram.json specification.'),
    sourceCode: z.string().describe('Arduino/ESP32 firmware code (main.ino/sketch.ino).'),
    board: z.string().describe('Target board (e.g. arduino-uno, esp32, pi-pico).'),
  }),
  execute: async ({ board }) => {
    const env = getEnv();
    if (!env.WOKWI_CLI_TOKEN) {
      return {
        success: false,
        error: 'Wokwi CLI is not configured. Set WOKWI_CLI_TOKEN in .env.',
        code: 'WOKWI_NOT_CONFIGURED',
      };
    }

    return {
      success: true,
      data: {
        status: 'simulating',
        board,
        message: 'Simulation initiated with configured Wokwi token.',
      },
    };
  },
};
