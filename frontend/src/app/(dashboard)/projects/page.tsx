"use client";
import { useState, useMemo } from 'react';
import { useProjectsQuery } from '@/hooks/react-query/threads/use-project';
import Link from 'next/link';

export default function ProjectsPage() {
  const [search, setSearch] = useState('');
  const { data, isLoading, error } = useProjectsQuery();

  const filtered = useMemo(() => {
    if (!data) return [];
    // Sort by most recently interacted with: prefer updated_at, fallback created_at
    const sorted = [...data].sort((a, b) => {
      const aTime = new Date(a.updated_at || a.created_at).getTime();
      const bTime = new Date(b.updated_at || b.created_at).getTime();
      return bTime - aTime; // desc
    });
    if (!search) return sorted;
    const s = search.toLowerCase();
    return sorted.filter(p => p.name.toLowerCase().includes(s) || (p.description || '').toLowerCase().includes(s));
  }, [data, search]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Projects</h1>
        <p className="text-sm text-muted-foreground mt-1">All your conversation spaces (threads) grouped by project. All models available; billing is usage-based.</p>
      </div>
      <div className="flex items-center gap-3">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search projects..."
          className="w-full max-w-sm h-9 px-3 rounded-md border bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>
      {isLoading && <div className="text-sm text-muted-foreground">Loading...</div>}
      {error && <div className="text-sm text-destructive">Failed to load projects</div>}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
  {filtered.map(p => {
        const target = p.latest_thread_id ? `/projects/${p.project_id}/thread/${p.latest_thread_id}` : `/projects/${p.project_id}`;
        return (
          <Link key={p.project_id} href={target} className="group border rounded-lg p-4 hover:border-primary transition-colors">
            <div className="flex items-start justify-between mb-2">
              <h2 className="font-medium truncate max-w-[70%] group-hover:text-primary">{p.name || 'Untitled Project'}</h2>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{p.thread_count || 0} th</span>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2 min-h-[32px]">{p.description || 'No description'}</p>
            <div className="mt-3 flex items-center gap-3 text-[11px] text-muted-foreground">
              <span>{p.message_count || 0} msgs</span>
              <span>•</span>
              <span>{new Date(p.created_at).toLocaleDateString()}</span>
            </div>
          </Link>
        );
      })}
        {!isLoading && filtered.length === 0 && (
          <div className="col-span-full text-sm text-muted-foreground border rounded-lg p-8 text-center">
            No projects found.
          </div>
        )}
      </div>
    </div>
  );
}
