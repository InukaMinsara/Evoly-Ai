import { z } from 'zod';
import { AITool } from './tool.interface';
import { gitHubService } from '../../github/github.service';

export const githubIssuesTool: AITool<{ owner: string; repo: string; state?: 'open' | 'closed' | 'all' }> = {
  name: 'githubIssues',
  description: 'List issues in a GitHub repository.',
  parameters: z.object({
    owner: z.string().describe('Repository owner.'),
    repo: z.string().describe('Repository name.'),
    state: z.enum(['open', 'closed', 'all']).optional().default('open').describe('State of issues.'),
  }),
  execute: async ({ owner, repo, state }) => {
    try {
      const issues = await gitHubService.listIssues(owner, repo, state);
      return {
        success: true,
        data: issues.map((i) => ({
          number: i.number,
          title: i.title,
          state: i.state,
          htmlUrl: i.html_url,
          user: i.user?.login,
          comments: i.comments,
          createdAt: i.created_at,
        })),
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Failed to list GitHub issues.',
        code: 'GITHUB_ERROR',
      };
    }
  },
};
