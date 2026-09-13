import { z } from 'zod';
import { AITool } from './tool.interface';
import { getEnv } from '../../../config/env';

export const hardwareCompileTool: AITool<{
  sketch: string;
  fqbn: string;
}> = {
  name: 'hardwareCompile',
  description: 'Compile an embedded Arduino/C++ sketch for a target microcontroller board using the local hardware bridge.',
  parameters: z.object({
    sketch: z.string().describe('Arduino sketch source code.'),
    fqbn: z.string().describe('Fully Qualified Board Name (e.g. arduino:avr:uno, esp32:esp32:esp32).'),
  }),
  execute: async ({ sketch, fqbn }) => {
    const env = getEnv();
    if (!env.HARDWARE_BRIDGE_SECRET) {
      return {
        success: false,
        error: 'Local hardware bridge is not configured. Set HARDWARE_BRIDGE_SECRET in .env and launch the bridge.',
        code: 'BRIDGE_NOT_CONFIGURED',
      };
    }

    try {
      const res = await fetch(`${env.HARDWARE_BRIDGE_URL}/compile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Bridge-Secret': env.HARDWARE_BRIDGE_SECRET,
        },
        body: JSON.stringify({ sketch, fqbn }),
      });

      if (!res.ok) {
        throw new Error(`Hardware bridge compilation error: ${res.statusText}`);
      }

      const data = await res.json();
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message, code: 'COMPILE_ERROR' };
    }
  },
};

export const hardwareUploadTool: AITool<{
  port: string;
  fqbn: string;
}> = {
  name: 'hardwareUpload',
  description: 'Upload compiled firmware to a connected microcontroller board via serial port.',
  parameters: z.object({
    port: z.string().describe('Target serial port (e.g. COM3 or /dev/ttyUSB0).'),
    fqbn: z.string().describe('Target board FQBN.'),
  }),
  execute: async ({ port, fqbn }) => {
    const env = getEnv();
    if (!env.HARDWARE_BRIDGE_SECRET) {
      return {
        success: false,
        error: 'Hardware bridge not configured. Set HARDWARE_BRIDGE_SECRET in .env.',
        code: 'BRIDGE_NOT_CONFIGURED',
      };
    }

    try {
      const res = await fetch(`${env.HARDWARE_BRIDGE_URL}/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Bridge-Secret': env.HARDWARE_BRIDGE_SECRET,
        },
        body: JSON.stringify({ port, fqbn }),
      });

      if (!res.ok) {
        throw new Error(`Hardware bridge upload error: ${res.statusText}`);
      }

      const data = await res.json();
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message, code: 'UPLOAD_ERROR' };
    }
  },
};

export const serialMonitorTool: AITool<{
  port: string;
  baudRate?: number;
  durationSeconds?: number;
}> = {
  name: 'serialMonitor',
  description: 'Read serial log stream from a connected microcontroller board via hardware bridge.',
  parameters: z.object({
    port: z.string().describe('Serial COM port name.'),
    baudRate: z.number().int().optional().default(115200).describe('Serial baud rate (default 115200).'),
    durationSeconds: z.number().int().optional().default(5).describe('Seconds to capture serial output.'),
  }),
  execute: async ({ port, baudRate }) => {
    const env = getEnv();
    if (!env.HARDWARE_BRIDGE_SECRET) {
      return {
        success: false,
        error: 'Hardware bridge not configured.',
        code: 'BRIDGE_NOT_CONFIGURED',
      };
    }

    try {
      const res = await fetch(`${env.HARDWARE_BRIDGE_URL}/serial/read?port=${encodeURIComponent(port)}&baud=${baudRate || 115200}`, {
        headers: { 'X-Bridge-Secret': env.HARDWARE_BRIDGE_SECRET },
      });

      if (!res.ok) {
        throw new Error(`Serial monitor error: ${res.statusText}`);
      }

      const data = await res.json();
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message, code: 'SERIAL_ERROR' };
    }
  },
};
