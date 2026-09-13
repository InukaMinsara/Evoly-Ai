import { tokenStore } from '../oauth/token-store';

export class GitHubService {
  private getAccessToken(): string | null {
    const token = tokenStore.get('github');
    return token?.accessToken || null;
  }

  private async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getAccessToken();
    if (!token) {
      throw new Error('GitHub account is not connected. Please connect your GitHub account in Settings.');
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'EVOLY-AI-Platform',
      ...(options.headers as Record<string, string>),
    };

    const res = await fetch(`https://api.github.com${endpoint}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`GitHub API error (${res.status}): ${errText || res.statusText}`);
    }

    return (await res.json()) as T;
  }

  /**
   * List authenticated user repositories.
   */
  async listRepositories(perPage = 30) {
    return await this.request<any[]>(`/user/repos?sort=updated&per_page=${perPage}`);
  }

  /**
   * Get file or directory contents from a repository.
   */
  async getContents(owner: string, repo: string, path = '') {
    const data = await this.request<any>(`/repos/${owner}/${repo}/contents/${path}`);
    if (Array.isArray(data)) {
      return data.map((item) => ({
        name: item.name,
        path: item.path,
        type: item.type,
        size: item.size,
        downloadUrl: item.download_url,
      }));
    }
    // Single file
    const content = data.content ? Buffer.from(data.content, 'base64').toString('utf8') : '';
    return {
      name: data.name,
      path: data.path,
      type: data.type,
      size: data.size,
      content,
    };
  }

  /**
   * List issues in a repository.
   */
  async listIssues(owner: string, repo: string, state: 'open' | 'closed' | 'all' = 'open') {
    return await this.request<any[]>(`/repos/${owner}/${repo}/issues?state=${state}`);
  }

  /**
   * List pull requests in a repository.
   */
  async listPullRequests(owner: string, repo: string, state: 'open' | 'closed' | 'all' = 'open') {
    return await this.request<any[]>(`/repos/${owner}/${repo}/pulls?state=${state}`);
  }
}

export const gitHubService = new GitHubService();
