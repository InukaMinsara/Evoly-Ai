import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

export interface ToolExecutionResult {
  success: boolean;
  data?: any;
  error?: string;
  code?: string;
  provider?: string;
  retryable?: boolean;
  metadata?: any;
}

export interface AITool<TParams = any> {
  name: string;
  description: string;
  parameters: z.ZodType<TParams>;
  execute: (args: TParams, context?: any) => Promise<ToolExecutionResult>;
}

export function buildGroqToolDefinition(tool: AITool): any {
  return {
    type: 'function',
    function: {
      name: tool.name,
      description: tool.description,
      parameters: zodToJsonSchema(tool.parameters as any),
    }
  };
}
