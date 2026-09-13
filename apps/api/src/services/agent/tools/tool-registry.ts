import { AITool, buildGroqToolDefinition } from './tool.interface';
import { webSearchTool } from './webSearch.tool';
import { webResearchTool } from './webResearch.tool';
import { placesSearchTool } from './placesSearch.tool';
import { generateImageTool } from './generateImage.tool';
import { editImageTool } from './editImage.tool';
import { generateVideoTool } from './generateVideo.tool';
import { textToSpeechTool } from './textToSpeech.tool';
import { speechToTextTool } from './speechToText.tool';
import { youtubeSearchTool } from './youtubeSearch.tool';
import { youtubeVideoDetailsTool } from './youtubeVideoDetails.tool';
import { youtubeAnalyticsTool } from './youtubeAnalytics.tool';
import { youtubeThumbnailTool } from './youtubeThumbnail.tool';
import { searchConsoleAnalyticsTool } from './searchConsoleAnalytics.tool';
import { githubRepositoriesTool } from './githubRepositories.tool';
import { githubFilesTool } from './githubFiles.tool';
import { githubIssuesTool } from './githubIssues.tool';
import { githubPullRequestsTool } from './githubPullRequests.tool';
import { executeCodeTool } from './executeCode.tool';
import { wokwiSimulateTool } from './wokwiSimulate.tool';
import { hardwareCompileTool, hardwareUploadTool, serialMonitorTool } from './hardwareTools';
import { githubTool } from './github.tool';

export class ToolRegistry {
  private tools: Map<string, AITool> = new Map();

  register(tool: AITool) {
    if (this.tools.has(tool.name)) {
      throw new Error(`Tool ${tool.name} is already registered.`);
    }
    this.tools.set(tool.name, tool);
  }

  getTool(name: string): AITool | undefined {
    return this.tools.get(name);
  }

  getAllTools(): AITool[] {
    return Array.from(this.tools.values());
  }

  getGroqTools() {
    const arr = Array.from(this.tools.values());
    if (arr.length === 0) return undefined;
    return arr.map(buildGroqToolDefinition);
  }

  async executeTool(name: string, argsStr: string, context?: any) {
    const tool = this.tools.get(name);
    if (!tool) {
      return { success: false, error: `Tool ${name} not found.` };
    }

    try {
      const args = JSON.parse(argsStr);
      const parsedArgs = tool.parameters.parse(args);
      return await tool.execute(parsedArgs, context);
    } catch (err: any) {
      return { success: false, error: `Tool execution failed: ${err.message}` };
    }
  }
}

export const globalToolRegistry = new ToolRegistry();

// ─── Register All AI Tools ───────────────────────────────────────────
globalToolRegistry.register(webSearchTool);
globalToolRegistry.register(webResearchTool);
globalToolRegistry.register(placesSearchTool);
globalToolRegistry.register(generateImageTool);
globalToolRegistry.register(editImageTool);
globalToolRegistry.register(generateVideoTool);
globalToolRegistry.register(textToSpeechTool);
globalToolRegistry.register(speechToTextTool);
globalToolRegistry.register(youtubeSearchTool);
globalToolRegistry.register(youtubeVideoDetailsTool);
globalToolRegistry.register(youtubeAnalyticsTool);
globalToolRegistry.register(youtubeThumbnailTool);
globalToolRegistry.register(searchConsoleAnalyticsTool);
globalToolRegistry.register(githubRepositoriesTool);
globalToolRegistry.register(githubFilesTool);
globalToolRegistry.register(githubIssuesTool);
globalToolRegistry.register(githubPullRequestsTool);
globalToolRegistry.register(executeCodeTool);
globalToolRegistry.register(wokwiSimulateTool);
globalToolRegistry.register(hardwareCompileTool);
globalToolRegistry.register(hardwareUploadTool);
globalToolRegistry.register(serialMonitorTool);

// Backward-compatibility aliases
const imageGenerationAlias: AITool = {
  ...generateImageTool,
  name: 'imageGeneration',
};
globalToolRegistry.register(imageGenerationAlias);

globalToolRegistry.register(githubTool);
