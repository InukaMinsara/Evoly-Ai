import { z } from 'zod';
import { AITool } from './tool.interface';
import { gitHubService } from '../../github/github.service';

export const githubFilesTool: AITool<{ owner: string; repo: string; path?: string }> = {
  name: 'githubFiles',
  description: 'Read file contents or list folder directory structure inside a GitHub repository.',
  parameters: z.object({
    owner: z.string().describe('Repository owner (user or organization).'),
    repo: z.string().describe('Repository name.'),
    path: z.string().optional().default('').describe('Path to file or directory.'),
  }),
  execute: async ({ owner, repo, path }) => {
    try {
      const contents = await gitHubService.getContents(owner, repo, path);
      return {
        success: true,
        data: contents,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Failed to read GitHub repository contents.',
        code: 'GITHUB_ERROR',
      };
    }
  },
};
