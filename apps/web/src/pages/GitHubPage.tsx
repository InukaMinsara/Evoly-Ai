import { useState, useEffect } from 'react';
import {
  Github,
  GitBranch,
  Folder,
  FileCode,
  CheckCircle2,
  Loader2,
  ExternalLink,
  Star,
  Lock,
  GitPullRequest,
  CircleDot,
} from 'lucide-react';
import { cn } from '../lib/utils';

export function GitHubPage() {
  const [repos, setRepos] = useState<any[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<any | null>(null);
  const [loadingRepos, setLoadingRepos] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<'repos' | 'details'>('repos');

  const [activeTab, setActiveTab] = useState<'files' | 'issues' | 'prs'>('files');
  const [currentPath, setCurrentPath] = useState('');
  const [contents, setContents] = useState<any[]>([]);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [loadingContents, setLoadingContents] = useState(false);

  const [issues, setIssues] = useState<any[]>([]);
  const [pullRequests, setPullRequests] = useState<any[]>([]);
  const [loadingSubData, setLoadingSubData] = useState(false);

  useEffect(() => {
    fetchRepos();
  }, []);

  const fetchRepos = async () => {
    setLoadingRepos(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:3000/api/github/repos');
      const data = await res.json();
      if (res.ok && data.success) {
        setRepos(data.repos || []);
        if (data.repos?.length > 0) {
          handleSelectRepo(data.repos[0]);
        }
      } else {
        setError(data.error || 'GitHub account not connected.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingRepos(false);
    }
  };

  const handleSelectRepo = async (repo: any) => {
    setSelectedRepo(repo);
    setCurrentPath('');
    setFileContent(null);
    setMobileTab('details');
    fetchRepoContents(repo.owner.login, repo.name, '');
  };

  const fetchRepoContents = async (owner: string, repoName: string, path: string) => {
    setLoadingContents(true);
    setFileContent(null);
    try {
      const res = await fetch(
        `http://localhost:3000/api/github/contents?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repoName)}&path=${encodeURIComponent(path)}`,
      );
      const data = await res.json();
      if (res.ok && data.success) {
        if (Array.isArray(data.contents)) {
          setContents(data.contents);
        } else if (data.contents?.content) {
          setFileContent(data.contents.content);
        }
      }
    } catch (e) {}
    setLoadingContents(false);
  };

  const fetchIssuesAndPRs = async (tab: 'issues' | 'prs') => {
    if (!selectedRepo) return;
    setActiveTab(tab);
    setLoadingSubData(true);
    try {
      const endpoint = tab === 'issues' ? 'issues' : 'pulls';
      const res = await fetch(
        `http://localhost:3000/api/github/${endpoint}?owner=${encodeURIComponent(selectedRepo.owner.login)}&repo=${encodeURIComponent(selectedRepo.name)}`,
      );
      const data = await res.json();
      if (res.ok && data.success) {
        if (tab === 'issues') setIssues(data.issues || []);
        else setPullRequests(data.pulls || []);
      }
    } catch (e) {}
    setLoadingSubData(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-surface overflow-hidden">
      {/* Header */}
      <header className="px-4 sm:px-8 py-4 sm:py-6 border-b border-surface-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 flex-shrink-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5 sm:gap-3">
            <Github className="w-6 h-6 sm:w-7 sm:h-7 text-white flex-shrink-0" />
            <span>GitHub Workspace</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Browse repositories, inspect firmware source code, and track issues and pull requests.
          </p>
        </div>

        <div className="w-full sm:w-auto">
          {repos.length > 0 ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Connected ({repos.length} repos)
            </div>
          ) : (
            <a
              href="http://localhost:3000/api/oauth/github/start"
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs border border-surface-border transition-all w-full sm:w-auto"
            >
              <Github className="w-4 h-4" />
              Connect GitHub Account
            </a>
          )}
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Repo List Sidebar */}
        <div
          className={cn(
            'border-r border-surface-border bg-surface-card flex flex-col overflow-y-auto p-4 flex-shrink-0',
            mobileTab === 'details' ? 'hidden md:flex md:w-80' : 'w-full md:w-80'
          )}
        >
          <div className="mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Repositories</span>
          </div>

          {error && (
            <div className="mb-3 p-3 rounded-xl bg-red-950/40 border border-red-800/50 text-xs text-red-300">
              {error}
            </div>
          )}

          {loadingRepos ? (
            <div className="py-8 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
            </div>
          ) : repos.length > 0 ? (
            <div className="space-y-1.5">
              {repos.map((repo) => (
                <button
                  key={repo.id}
                  onClick={() => handleSelectRepo(repo)}
                  className={cn(
                    'w-full text-left p-3 rounded-xl border transition-all',
                    selectedRepo?.id === repo.id
                      ? 'bg-evoly-600/10 border-evoly-500/50 text-white'
                      : 'border-transparent text-slate-300 hover:bg-surface-hover',
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold truncate flex items-center gap-1.5">
                      {repo.private ? <Lock className="w-3 h-3 text-amber-400" /> : <Folder className="w-3 h-3 text-slate-400" />}
                      {repo.name}
                    </span>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Star className="w-3 h-3" /> {repo.stargazers_count}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">{repo.description || 'No description'}</p>
                </button>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-500 text-xs">
              No repositories accessible. Connect your GitHub account.
            </div>
          )}
        </div>

        {/* Repo Content Area */}
        {selectedRepo ? (
          <div
            className={cn(
              'flex-1 flex flex-col min-w-0 bg-surface overflow-y-auto',
              mobileTab === 'repos' ? 'hidden md:flex' : 'flex'
            )}
          >
            {/* Repo Header */}
            <div className="p-4 sm:p-6 border-b border-surface-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-surface-card/40">
              <div>
                <button
                  onClick={() => setMobileTab('repos')}
                  className="md:hidden text-xs text-evoly-400 hover:text-evoly-300 mb-2 flex items-center gap-1 font-medium"
                >
                  ← All Repositories
                </button>
                <div className="flex items-center gap-3">
                  <GitBranch className="w-5 h-5 text-evoly-400 flex-shrink-0" />
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                      <span className="truncate max-w-[200px] xs:max-w-xs">{selectedRepo.full_name}</span>
                      <a
                        href={selectedRepo.html_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-500 hover:text-white"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </h2>
                    <span className="text-xs text-slate-400 font-mono">Default: {selectedRepo.default_branch}</span>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex bg-surface rounded-xl p-1 border border-surface-border overflow-x-auto w-full sm:w-auto">
                <button
                  onClick={() => {
                    setActiveTab('files');
                    fetchRepoContents(selectedRepo.owner.login, selectedRepo.name, currentPath);
                  }}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex-1 sm:flex-initial text-center',
                    activeTab === 'files' ? 'bg-evoly-600 text-white' : 'text-slate-400 hover:text-white',
                  )}
                >
                  Files
                </button>
                <button
                  onClick={() => fetchIssuesAndPRs('issues')}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex-1 sm:flex-initial text-center',
                    activeTab === 'issues' ? 'bg-evoly-600 text-white' : 'text-slate-400 hover:text-white',
                  )}
                >
                  Issues
                </button>
                <button
                  onClick={() => fetchIssuesAndPRs('prs')}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex-1 sm:flex-initial text-center',
                    activeTab === 'prs' ? 'bg-evoly-600 text-white' : 'text-slate-400 hover:text-white',
                  )}
                >
                  Pull Requests
                </button>
              </div>
            </div>

            {/* Tab View */}
            <div className="flex-1 p-6">
              {activeTab === 'files' && (
                <div>
                  {loadingContents ? (
                    <div className="py-12 flex justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
                    </div>
                  ) : fileContent !== null ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => fetchRepoContents(selectedRepo.owner.login, selectedRepo.name, '')}
                          className="text-xs text-evoly-400 hover:underline"
                        >
                          ← Back to file tree
                        </button>
                      </div>
                      <pre className="p-4 rounded-xl bg-surface-card border border-surface-border font-mono text-xs text-slate-200 overflow-x-auto">
                        {fileContent}
                      </pre>
                    </div>
                  ) : (
                    <div className="divide-y divide-surface-border border border-surface-border rounded-xl bg-surface-card overflow-hidden">
                      {contents.map((item, i) => (
                        <div
                          key={i}
                          onClick={() => {
                            if (item.type === 'dir') {
                              setCurrentPath(item.path);
                              fetchRepoContents(selectedRepo.owner.login, selectedRepo.name, item.path);
                            } else {
                              fetchRepoContents(selectedRepo.owner.login, selectedRepo.name, item.path);
                            }
                          }}
                          className="p-3 hover:bg-surface-hover cursor-pointer flex items-center justify-between text-xs transition-colors"
                        >
                          <span className="flex items-center gap-2 text-slate-200">
                            {item.type === 'dir' ? (
                              <Folder className="w-4 h-4 text-blue-400" />
                            ) : (
                              <FileCode className="w-4 h-4 text-slate-400" />
                            )}
                            {item.name}
                          </span>
                          <span className="text-[11px] text-slate-500">{item.size ? `${item.size} bytes` : 'Directory'}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'issues' && (
                <div>
                  {loadingSubData ? (
                    <div className="py-12 flex justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
                    </div>
                  ) : issues.length > 0 ? (
                    <div className="space-y-2">
                      {issues.map((issue) => (
                        <div key={issue.number} className="p-3 bg-surface-card border border-surface-border rounded-xl flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <CircleDot className="w-4 h-4 text-emerald-400" />
                            <span className="font-semibold text-white">#{issue.number}</span>
                            <span className="text-slate-300">{issue.title}</span>
                          </div>
                          <a href={issue.htmlUrl} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-white">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 py-8 text-center">No open issues found.</p>
                  )}
                </div>
              )}

              {activeTab === 'prs' && (
                <div>
                  {loadingSubData ? (
                    <div className="py-12 flex justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
                    </div>
                  ) : pullRequests.length > 0 ? (
                    <div className="space-y-2">
                      {pullRequests.map((pr) => (
                        <div key={pr.number} className="p-3 bg-surface-card border border-surface-border rounded-xl flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <GitPullRequest className="w-4 h-4 text-purple-400" />
                            <span className="font-semibold text-white">#{pr.number}</span>
                            <span className="text-slate-300">{pr.title}</span>
                          </div>
                          <a href={pr.htmlUrl} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-white">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 py-8 text-center">No open pull requests found.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">
            Select a repository to inspect contents.
          </div>
        )}
      </div>
    </div>
  );
}

export default GitHubPage;
