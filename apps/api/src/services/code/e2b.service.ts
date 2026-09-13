import { getEnv } from '../../config/env';
import { CodeExecutionOptions, CodeExecutionResult } from '../capabilities/types';

export class E2BCodeService {
  isConfigured(): boolean {
    const env = getEnv();
    return Boolean(env.E2B_API_KEY);
  }

  /**
   * Executes code safely in an isolated E2B sandbox.
   */
  async execute(options: CodeExecutionOptions): Promise<CodeExecutionResult> {
    const env = getEnv();
    if (!this.isConfigured()) {
      throw new Error('E2B Code Execution is not configured. Set E2B_API_KEY in .env.');
    }

    const startTime = Date.now();

    // E2B Sandboxes API: POST /sandboxes
    try {
      // Step 1: Create or use an existing sandbox
      const sandboxRes = await fetch('https://api.e2b.dev/sandboxes', {
        method: 'POST',
        headers: {
          'X-API-Key': env.E2B_API_KEY!,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          template: options.language === 'python' ? 'base' : 'base',
          timeout: options.timeoutMs ? Math.round(options.timeoutMs / 1000) : 60,
        }),
      });

      if (!sandboxRes.ok) {
        const text = await sandboxRes.text().catch(() => '');
        throw new Error(`E2B Sandbox creation error (${sandboxRes.status}): ${text || sandboxRes.statusText}`);
      }

      const sandboxData: any = await sandboxRes.json();
      const sandboxId = sandboxData.sandboxID || sandboxData.id;

      // Step 2: Execute command inside sandbox
      const cmd = options.language === 'python'
        ? `python3 -c ${JSON.stringify(options.code)}`
        : options.language === 'javascript'
          ? `node -e ${JSON.stringify(options.code)}`
          : options.code;

      const execRes = await fetch(`https://api.e2b.dev/sandboxes/${sandboxId}/commands`, {
        method: 'POST',
        headers: {
          'X-API-Key': env.E2B_API_KEY!,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cmd }),
      });

      if (!execRes.ok) {
        throw new Error(`E2B Execution failed: ${execRes.statusText}`);
      }

      const execData: any = await execRes.json();

      // Clean up sandbox asynchronously
      void fetch(`https://api.e2b.dev/sandboxes/${sandboxId}`, {
        method: 'DELETE',
        headers: { 'X-API-Key': env.E2B_API_KEY! },
      }).catch(() => {});

      return {
        stdout: execData.stdout || '',
        stderr: execData.stderr || '',
        exitCode: execData.exitCode ?? 0,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err: any) {
      throw new Error(`Code execution failed: ${err.message}`);
    }
  }
}

export const e2bCodeService = new E2BCodeService();
