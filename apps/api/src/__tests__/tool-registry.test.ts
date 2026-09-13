import { globalToolRegistry } from '../services/agent/tools/tool-registry';

describe('Tool Registry', () => {
  it('registers all required EVOLY AI capability tools', () => {
    const tools = globalToolRegistry.getAllTools();
    const toolNames = tools.map((t) => t.name);

    expect(toolNames).toContain('webSearch');
    expect(toolNames).toContain('webResearch');
    expect(toolNames).toContain('generateImage');
    expect(toolNames).toContain('editImage');
    expect(toolNames).toContain('generateVideo');
    expect(toolNames).toContain('textToSpeech');
    expect(toolNames).toContain('speechToText');
    expect(toolNames).toContain('youtubeSearch');
    expect(toolNames).toContain('youtubeVideoDetails');
    expect(toolNames).toContain('youtubeAnalytics');
    expect(toolNames).toContain('youtubeThumbnail');
    expect(toolNames).toContain('searchConsoleAnalytics');
    expect(toolNames).toContain('githubRepositories');
    expect(toolNames).toContain('githubFiles');
    expect(toolNames).toContain('githubIssues');
    expect(toolNames).toContain('githubPullRequests');
    expect(toolNames).toContain('executeCode');
    expect(toolNames).toContain('wokwiSimulate');
    expect(toolNames).toContain('hardwareCompile');
    expect(toolNames).toContain('hardwareUpload');
    expect(toolNames).toContain('serialMonitor');
    expect(toolNames).toContain('placesSearch');
    expect(toolNames).toContain('imageGeneration');
  });

  it('builds Groq function definitions for all tools', () => {
    const groqTools = globalToolRegistry.getGroqTools();
    expect(groqTools).toBeDefined();
    expect(groqTools?.length).toBeGreaterThanOrEqual(20);

    for (const tool of groqTools!) {
      expect(tool.type).toBe('function');
      expect(tool.function.name).toBeTruthy();
      expect(tool.function.description).toBeTruthy();
      expect(tool.function.parameters).toBeDefined();
    }
  });

  it('returns error when executing unknown tool', async () => {
    const result = await globalToolRegistry.executeTool('nonExistentTool', '{}');
    expect(result.success).toBe(false);
    expect(result.error).toContain('not found');
  });
});
