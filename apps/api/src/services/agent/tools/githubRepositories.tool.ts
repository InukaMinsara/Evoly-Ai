import { z } from 'zod';
import { AITool } from './tool.interface';
import { gitHubService } from '../../github/github.service';

export const githubRepositoriesTool: AITool<{ perPage?: number }> = {
  name: 'githubRepositories',
  description: 'List repositories accessible by the authenticated GitHub account.',
  parameters: z.object({
    perPage: z.number().int().min(1).max(50).optional().default(15).describe('Number of repositories to return.'),
  }),
  execute: async ({ perPage }) => {
    try {
      const repos = await gitHubService.listRepositories(perPage);
      return {
        success: true,
        data: repos.map((r) => ({
          name: r.name,
          fullName: r.full_name,
          private: r.private,
          htmlUrl: r.html_url,
          description: r.description,
          language: r.language,
          stargazersCount: r.stargazers_count,
          updatedAt: r.updated_at,
        })),
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Failed to list GitHub repositories.',
        code: 'GITHUB_ERROR',
      };
    }
  },
};
