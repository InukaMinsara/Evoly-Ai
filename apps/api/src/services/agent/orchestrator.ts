import { GroqMessage, getGroqService, StreamCallbacks } from '../groq.service';
import { globalToolRegistry } from './tools/tool-registry';

export interface AgentCallbacks extends StreamCallbacks {
  onToolStart?: (toolName: string, args: any) => void;
  onToolEnd?: (toolName: string, result: any) => void;
}

export class AgentOrchestrator {
  private groqService = getGroqService();
  private maxIterations = 5;

  async run(
    messages: GroqMessage[],
    callbacks: AgentCallbacks,
    signal?: AbortSignal,
    modelOverride?: string
  ): Promise<GroqMessage[]> {
    const currentMessages = [...messages];
    let iteration = 0;

    while (iteration < this.maxIterations) {
      iteration++;
      if (signal?.aborted) break;

      const tools = globalToolRegistry.getGroqTools();
      const groqClient = (this.groqService as any).client;
      
      if (!groqClient) {
        callbacks.onError({ code: 'NOT_CONFIGURED', message: 'Groq not configured.', retryable: false });
        return currentMessages;
      }

      let fullText = '';
      const toolCalls: any[] = [];
      let stopReason = null;

      try {
        const stream = await groqClient.chat.completions.create(
          {
            model: modelOverride ?? this.groqService.getModel(),
            messages: currentMessages,
            stream: true,
            max_tokens: 1000,
            temperature: 0.7,
            tools: tools?.length ? tools : undefined,
            tool_choice: tools?.length ? 'auto' : undefined,
          },
          { signal }
        );

        for await (const chunk of stream) {
          if (signal?.aborted) break;

          const delta = chunk.choices[0]?.delta;
          stopReason = chunk.choices[0]?.finish_reason || stopReason;

          // Handle text token
          if (delta?.content) {
            fullText += delta.content;
            callbacks.onToken(delta.content);
          }

          // Handle tool calls streaming
          if (delta?.tool_calls) {
            for (const toolCallDelta of delta.tool_calls) {
              const index = toolCallDelta.index;
              if (!toolCalls[index]) {
                toolCalls[index] = {
                  id: toolCallDelta.id,
                  type: 'function',
                  function: { name: toolCallDelta.function?.name || '', arguments: '' }
                };
              }
              if (toolCallDelta.function?.arguments) {
                toolCalls[index].function.arguments += toolCallDelta.function.arguments;
              }
            }
          }
        }

      } catch (err: any) {
        if (signal?.aborted || err.name === 'AbortError') return currentMessages;
        callbacks.onError({ code: 'PROVIDER_ERROR', message: err.message, retryable: true });
        return currentMessages;
      }

      // Append assistant's response to messages
      if (fullText || toolCalls.length > 0) {
        const assistantMessage: any = { role: 'assistant' };
        if (fullText) assistantMessage.content = fullText;
        if (toolCalls.length > 0) assistantMessage.tool_calls = toolCalls;
        currentMessages.push(assistantMessage);
      }

      // If no tool calls, we are done
      if (toolCalls.length === 0) {
        callbacks.onComplete(fullText);
        break;
      }

      // Execute tool calls
      for (const tc of toolCalls) {
        const toolName = tc.function.name;
        const argsStr = tc.function.arguments;
        
        let parsedArgs = {};
        try { parsedArgs = JSON.parse(argsStr || '{}'); } catch(e){}

        if (callbacks.onToolStart) {
          callbacks.onToolStart(toolName, parsedArgs);
        }

        const result = await globalToolRegistry.executeTool(toolName, argsStr);
        
        if (callbacks.onToolEnd) {
          callbacks.onToolEnd(toolName, result);
        }

        // Append tool result (sanitize huge base64 strings so LLM input token limits are never exceeded)
        let toolResultStr = JSON.stringify(result);
        if (toolResultStr.length > 2000) {
          toolResultStr = toolResultStr.replace(/data:image\/[^;]+;base64,[A-Za-z0-9+/=]{80,}/g, (match) => {
            return `data:image/...;base64,[TRUNCATED_${match.length}_CHARS]`;
          });
        }

        currentMessages.push({
          role: 'tool',
          tool_call_id: tc.id,
          content: toolResultStr,
        });
      }
      
      // Loop continues with tool results in currentMessages
    }

    return currentMessages;
  }
}
