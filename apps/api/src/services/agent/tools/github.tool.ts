import { z } from 'zod';
import { AITool } from './tool.interface';
import { tokenStore } from '../../oauth/token-store';

export const githubTool: AITool<{ action: string; owner?: string; repo?: string; path?: string; query?: string }> = {
  name: 'github',
  description: 'Access GitHub repositories, files, issues, commits, and pull requests for authorized accounts.',
  parameters: z.object({
    action: z.enum(['listRepos', 'getFile', 'listFiles', 'getCommits', 'getIssues', 'searchCode']).describe('Action to perform.'),
    owner: z.string().optional().describe('Repository owner (username or org).'),
    repo: z.string().optional().describe('Repository name.'),
    path: z.string().optional().describe('File or directory path within the repo.'),
    query: z.string().optional().describe('Search query for searchCode action.'),
  }),
  execute: async ({ action, owner, repo, path, query }) => {
    const token = tokenStore.get('github');
    if (!token) {
      return { success: false, error: 'GitHub is not connected. Click "Connect GitHub" to authorize.' };
    }

    const headers = {
      Authorization: `Bearer ${token.accessToken}`,
      'User-Agent': 'EVOLY-AI',
      Accept: 'application/vnd.github+json',
    };

    try {
      let url = '';
      switch (action) {
        case 'listRepos':
          url = 'https://api.github.com/user/repos?sort=updated&per_page=20';
          break;
        case 'listFiles':
          if (!owner || !repo) return { success: false, error: 'owner and repo are required for listFiles.' };
          url = `https://api.github.com/repos/${owner}/${repo}/contents/${path || ''}`;
          break;
        case 'getFile':
          if (!owner || !repo || !path) return { success: false, error: 'owner, repo, and path are required for getFile.' };
          url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
          break;
        case 'getCommits':
          if (!owner || !repo) return { success: false, error: 'owner and repo are required for getCommits.' };
          url = `https://api.github.com/repos/${owner}/${repo}/commits?per_page=10`;
          break;
        case 'getIssues':
          if (!owner || !repo) return { success: false, error: 'owner and repo are required for getIssues.' };
          url = `https://api.github.com/repos/${owner}/${repo}/issues?per_page=10&state=open`;
          break;
        case 'searchCode':
          if (!query) return { success: false, error: 'query is required for searchCode.' };
          url = `https://api.github.com/search/code?q=${encodeURIComponent(query)}&per_page=5`;
          break;
        default:
          return { success: false, error: `Unknown action: ${action}` };
      }

      const res = await fetch(url, { headers });
      if (!res.ok) {
        if (res.status === 401) return { success: false, error: 'GitHub token is invalid or expired. Reconnect GitHub.' };
        throw new Error(`GitHub API error ${res.status}: ${res.statusText}`);
      }

      const data: any = await res.json();

      // For file content, decode base64
      if (action === 'getFile' && data.content) {
        data.decodedContent = Buffer.from(data.content, 'base64').toString('utf-8');
      }

      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },
};
