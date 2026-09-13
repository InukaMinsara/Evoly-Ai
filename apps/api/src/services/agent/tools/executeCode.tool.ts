import { z } from 'zod';
import { AITool } from './tool.interface';
import { e2bCodeService } from '../../code/e2b.service';

export const executeCodeTool: AITool<{
  code: string;
  language?: 'python' | 'javascript' | 'bash';
  timeoutMs?: number;
}> = {
  name: 'executeCode',
  description:
    'Execute Python, Node.js/JavaScript, or Bash code safely in an isolated E2B cloud sandbox. Returns stdout, stderr, and exit code.',
  parameters: z.object({
    code: z.string().describe('The code snippet to execute.'),
    language: z.enum(['python', 'javascript', 'bash']).optional().default('python').describe('Execution environment language.'),
    timeoutMs: z.number().int().optional().default(30000).describe('Timeout in milliseconds (max 60000).'),
  }),
  execute: async ({ code, language, timeoutMs }) => {
    try {
      const result = await e2bCodeService.execute({
        code,
        language: language || 'python',
        timeoutMs,
      });

      return {
        success: true,
        data: result,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Code execution failed.',
        code: 'EXECUTION_ERROR',
      };
    }
  },
};
