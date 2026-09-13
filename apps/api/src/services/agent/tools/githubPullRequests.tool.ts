import { z } from 'zod';
import { AITool } from './tool.interface';
import { gitHubService } from '../../github/github.service';

export const githubPullRequestsTool: AITool<{ owner: string; repo: string; state?: 'open' | 'closed' | 'all' }> = {
  name: 'githubPullRequests',
  description: 'List pull requests in a GitHub repository.',
  parameters: z.object({
    owner: z.string().describe('Repository owner.'),
    repo: z.string().describe('Repository name.'),
    state: z.enum(['open', 'closed', 'all']).optional().default('open').describe('State of pull requests.'),
  }),
  execute: async ({ owner, repo, state }) => {
    try {
      const prs = await gitHubService.listPullRequests(owner, repo, state);
      return {
        success: true,
        data: prs.map((p) => ({
          number: p.number,
          title: p.title,
          state: p.state,
          htmlUrl: p.html_url,
          user: p.user?.login,
          createdAt: p.created_at,
          mergedAt: p.merged_at,
        })),
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Failed to list GitHub pull requests.',
        code: 'GITHUB_ERROR',
      };
    }
  },
};
