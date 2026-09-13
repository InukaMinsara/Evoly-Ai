import { placesSearchTool } from './placesSearch.tool';
import { generateImageTool } from './generateImage.tool';
import { editImageTool } from './editImage.tool';
import { githubTool } from './github.tool';
import { youtubeAnalyticsTool } from './youtubeAnalytics.tool';
import { webSearchTool } from './webSearch.tool';
import { AITool } from './tool.interface';
import { globalToolRegistry } from './tool-registry';

export function registerAllTools(): void {
  // Already registered in tool-registry.ts directly — re-exported here for clarity
}

// Re-export all tools and registries
export {
  AITool,
  globalToolRegistry,
  webSearchTool,
  placesSearchTool,
  generateImageTool,
  generateImageTool as imageGenerationTool, // Compatibility alias
  editImageTool,
  githubTool,
  youtubeAnalyticsTool,
};
