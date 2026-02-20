'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import type { Repository, Analysis } from '@/lib/db';

type RepoWithAnalysis = Repository & { latestAnalysis: Analysis | null };

interface Props {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  repos: RepoWithAnalysis[];
  overallScore: number | null;
}

function scoreColor(score: number | null | undefined): string {
  if (score == null) return 'text-slate-400';
  if (score >= 75) return 'text-emerald-600';
  if (score >= 50) return 'text-amber-500';
  return 'text-red-500';
}

function scoreBg(score: number | null | undefined): string {
  if (score == null) return 'bg-slate-100';
  if (score >= 75) return 'bg-emerald-50 border-emerald-200';
  if (score >= 50) return 'bg-amber-50 border-amber-200';
  return 'bg-red-50 border-red-200';
}

function scoreLabel(score: number | null | undefined): string {
  if (score == null) return 'Not analyzed';
  if (score >= 75) return 'AI-Ready';
  if (score >= 50) return 'Needs Improvement';
  return 'Critical Issues';
}

export default function DashboardClient({ user, repos: initialRepos, overallScore }: Props) {
  const [repos, setRepos] = useState<RepoWithAnalysis[]>(initialRepos);
  const [showAddRepo, setShowAddRepo] = useState(false);
  const [addRepoForm, setAddRepoForm] = useState({ name: '', url: '', description: '', defaultBranch: 'main' });
  const [addRepoError, setAddRepoError] = useState<string | null>(null);
  const [addRepoLoading, setAddRepoLoading] = useState(false);
  const [uploadingRepoId, setUploadingRepoId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleAddRepo(e: React.FormEvent) {
    e.preventDefault();
    setAddRepoError(null);
    setAddRepoLoading(true);

    try {
      const res = await fetch('/api/repos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addRepoForm),
      });

      const data = await res.json();
      if (!res.ok) {
        setAddRepoError(data.error || 'Failed to add repository');
        return;
      }

      const newRepo: RepoWithAnalysis = { ...data.repo, latestAnalysis: null };
      setRepos(prev => [newRepo, ...prev]);
      setShowAddRepo(false);
      setAddRepoForm({ name: '', url: '', description: '', defaultBranch: 'main' });
    } catch {
      setAddRepoError('Network error. Please try again.');
    } finally {
      setAddRepoLoading(false);
    }
  }

  async function handleDeleteRepo(repoId: string) {
    if (!confirm('Delete this repository and all its analyses?')) return;

    const res = await fetch(`/api/repos?id=${repoId}`, { method: 'DELETE' });
    if (res.ok) {
      setRepos(prev => prev.filter(r => r.id !== repoId));
    }
  }

  async function handleUploadAnalysis(repoId: string) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      setUploadingRepoId(repoId);
      setUploadError(null);

      try {
        const text = await file.text();
        const data = JSON.parse(text);

        const res = await fetch('/api/analysis/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ repoId, data }),
        });

        const result = await res.json();
        if (!res.ok) {
          setUploadError(result.error || 'Upload failed');
          return;
        }

        // Update repo in list with new analysis
        setRepos(prev => prev.map(r =>
          r.id === repoId
            ? { ...r, latestAnalysis: result.analysis, aiScore: result.analysis.aiScore }
            : r
        ));
      } catch {
        setUploadError('Invalid JSON file or network error');
      } finally {
        setUploadingRepoId(null);
      }
    };

    input.click();
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                AIReady
              </span>
              <nav className="hidden md:flex items-center gap-6 ml-6">
                <a href="/dashboard" className="text-sm font-medium text-slate-900 border-b-2 border-blue-600 pb-0.5">Dashboard</a>
                <a href="/docs" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">Docs</a>
              </nav>
            </div>
            <div className="flex items-center gap-3">
              {user.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.image} alt={user.name || 'User'} className="w-8 h-8 rounded-full" />
              )}
              <span className="text-sm text-slate-600 hidden sm:block">{user.name || user.email}</span>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-sm text-slate-500 hover:text-slate-700 transition-colors px-3 py-1.5 rounded-md hover:bg-slate-100"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome + overall score */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Welcome back, {user.name?.split(' ')[0] || 'Developer'}!
            </h1>
            <p className="text-slate-500 mt-1 text-sm">
              {repos.length === 0
                ? 'Add your first repository to start tracking AI readiness.'
                : `Tracking ${repos.length} repositor${repos.length === 1 ? 'y' : 'ies'}`}
            </p>
          </div>
          {overallScore != null && (
            <div className={`flex items-center gap-3 px-5 py-3 rounded-xl border-2 ${scoreBg(overallScore)}`}>
              <div className="text-right">
                <div className={`text-3xl font-black ${scoreColor(overallScore)}`}>{overallScore}</div>
                <div className="text-xs font-medium text-slate-500 -mt-0.5">/ 100</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Overall AI Score</div>
                <div className={`text-sm font-medium ${scoreColor(overallScore)}`}>{scoreLabel(overallScore)}</div>
              </div>
            </div>
          )}
        </div>

        {/* Upload error banner */}
        {uploadError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex justify-between">
            <span>{uploadError}</span>
            <button onClick={() => setUploadError(null)} className="ml-4 font-bold">×</button>
          </div>
        )}

        {/* Repositories section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Repositories</h2>
            <button
              onClick={() => setShowAddRepo(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <span className="text-lg leading-none">+</span> Add Repository
            </button>
          </div>

          {repos.length === 0 ? (
            <div className="bg-white rounded-xl border-2 border-dashed border-slate-200 p-12 text-center">
              <div className="text-5xl mb-4">🚀</div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Get Started with AIReady</h3>
              <p className="text-slate-500 max-w-md mx-auto mb-6 text-sm">
                Add a repository, run the CLI, then upload the results to get your AI readiness score.
              </p>
              <div className="bg-slate-900 text-slate-300 p-4 rounded-lg text-sm font-mono max-w-lg mx-auto text-left">
                <div className="mb-1 text-slate-500"># Install and run analysis</div>
                <div className="text-cyan-400">npx @aiready/cli scan .</div>
                <div className="mt-2 mb-1 text-slate-500"># Save as JSON</div>
                <div className="text-cyan-400">npx @aiready/cli scan . --output json &gt; report.json</div>
              </div>
              <button
                onClick={() => setShowAddRepo(true)}
                className="mt-6 px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Your First Repository
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {repos.map(repo => (
                <RepoCard
                  key={repo.id}
                  repo={repo}
                  uploading={uploadingRepoId === repo.id}
                  onUpload={() => handleUploadAnalysis(repo.id)}
                  onDelete={() => handleDeleteRepo(repo.id)}
                />
              ))}
            </div>
          )}
        </section>

        {/* CLI quickstart (shown when repos exist but none analyzed) */}
        {repos.length > 0 && repos.every(r => !r.latestAnalysis) && (
          <section className="bg-slate-900 rounded-xl p-6 text-white">
            <h3 className="font-semibold text-lg mb-1">Run your first analysis</h3>
            <p className="text-slate-400 text-sm mb-4">Generate a report JSON and upload it to see your AI readiness scores.</p>
            <div className="font-mono text-sm space-y-1">
              <div>
                <span className="text-slate-500"># </span>
                <span className="text-cyan-400">npx @aiready/cli scan . --output json &gt; report.json</span>
              </div>
              <div>
                <span className="text-slate-500"># then upload report.json via the button on your repo card</span>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Add Repository Modal */}
      {showAddRepo && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={e => { if (e.target === e.currentTarget) setShowAddRepo(false); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-900">Add Repository</h3>
              <button onClick={() => setShowAddRepo(false)} className="text-slate-400 hover:text-slate-600 text-xl leading-none">×</button>
            </div>
            <form onSubmit={handleAddRepo} className="px-6 py-5 space-y-4">
              {addRepoError && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {addRepoError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Repository Name</label>
                <input
                  type="text"
                  required
                  placeholder="my-awesome-project"
                  value={addRepoForm.name}
                  onChange={e => setAddRepoForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Repository URL</label>
                <input
                  type="text"
                  required
                  placeholder="https://github.com/user/repo"
                  value={addRepoForm.url}
                  onChange={e => setAddRepoForm(f => ({ ...f, url: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="What does this repo do?"
                  value={addRepoForm.description}
                  onChange={e => setAddRepoForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Default Branch</label>
                <input
                  type="text"
                  placeholder="main"
                  value={addRepoForm.defaultBranch}
                  onChange={e => setAddRepoForm(f => ({ ...f, defaultBranch: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddRepo(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addRepoLoading}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addRepoLoading ? 'Adding...' : 'Add Repository'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function RepoCard({
  repo,
  uploading,
  onUpload,
  onDelete,
}: {
  repo: RepoWithAnalysis;
  uploading: boolean;
  onUpload: () => void;
  onDelete: () => void;
}) {
  const score = repo.aiScore;
  const analysis = repo.latestAnalysis;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col gap-4 hover:border-slate-300 transition-colors">
      {/* Repo header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold text-slate-900 truncate">{repo.name}</h3>
          {repo.description && (
            <p className="text-xs text-slate-500 mt-0.5 truncate">{repo.description}</p>
          )}
          <a
            href={repo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-500 hover:text-blue-700 mt-0.5 truncate block"
          >
            {repo.url}
          </a>
        </div>
        {score != null && (
          <div className={`flex-shrink-0 text-center px-3 py-1.5 rounded-lg border ${scoreBg(score)}`}>
            <div className={`text-2xl font-black leading-none ${scoreColor(score)}`}>{score}</div>
            <div className="text-xs text-slate-400 mt-0.5">/ 100</div>
          </div>
        )}
      </div>

      {/* Breakdown grid */}
      {analysis?.breakdown && (
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(analysis.breakdown).map(([key, val]) => (
            <BreakdownItem key={key} label={formatBreakdownKey(key)} value={val as number} />
          ))}
        </div>
      )}

      {/* Summary line */}
      {analysis?.summary && (
        <div className="flex gap-3 text-xs text-slate-500">
          <span>{analysis.summary.totalFiles} files</span>
          {analysis.summary.criticalIssues > 0 && (
            <span className="text-red-500 font-medium">{analysis.summary.criticalIssues} critical</span>
          )}
          {analysis.summary.warnings > 0 && (
            <span className="text-amber-500">{analysis.summary.warnings} warnings</span>
          )}
        </div>
      )}

      {!analysis && (
        <p className="text-xs text-slate-400 italic">No analysis yet — upload a report to get scored.</p>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-1 border-t border-slate-100">
        <button
          onClick={onUpload}
          disabled={uploading}
          className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? 'Uploading...' : analysis ? 'Update Analysis' : 'Upload Analysis'}
        </button>
        <button
          onClick={onDelete}
          className="px-3 py-2 text-slate-400 hover:text-red-500 hover:bg-red-50 text-xs font-medium rounded-lg transition-colors"
          title="Delete repository"
        >
          Delete
        </button>
      </div>

      {repo.lastAnalysisAt && (
        <p className="text-xs text-slate-400 -mt-2">
          Last analyzed {new Date(repo.lastAnalysisAt).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}

function BreakdownItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-slate-50 rounded-lg px-2.5 py-2">
      <div className={`text-sm font-semibold ${scoreColor(value)}`}>{value}</div>
      <div className="text-xs text-slate-500 leading-tight">{label}</div>
    </div>
  );
}

function formatBreakdownKey(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, s => s.toUpperCase())
    .trim();
}
