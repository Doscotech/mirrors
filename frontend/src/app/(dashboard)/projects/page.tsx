"use client";
import { useState, useMemo } from 'react';
import { useAllThreads } from '@/hooks/react-query/threads/use-thread-queries';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { getProjects } from '@/lib/api';
import MobileSidebarToggle from '@/components/layout/MobileSidebarToggle';

export default function ProjectsPage() {
  // This page now represents the user's thread/message history.
  const [search, setSearch] = useState('');
  const { data: threads = [], isLoading, error } = useAllThreads();

  // Load projects to show friendly project names on thread cards.
  const { data: projects = [] } = useQuery({
    queryKey: ['projects', 'list'],
    queryFn: getProjects,
    staleTime: 5 * 60 * 1000,
  });

  const projectNameMap = useMemo(() => {
    const m = new Map<string, string>();
    for (const p of projects) {
      m.set(p.id, p.name || 'Untitled Project');
    }
    return m;
  }, [projects]);

  // We only have thread metadata here; for performance we do not fetch all messages.
  // Compose a human title that starts with the thread name if available.
  const enriched = useMemo(() => {
    return threads.map(t => {
      const rawMeta = (t as any).metadata;
      let meta: any = {};
      if (typeof rawMeta === 'string') {
        try { meta = JSON.parse(rawMeta); } catch { meta = {}; }
      } else if (rawMeta && typeof rawMeta === 'object') {
        meta = rawMeta;
      }

      // Some providers store metadata under a nested field like metadata or data
      const metaRoot = (meta && typeof meta === 'object') ? meta : {};
      const altRoot = (metaRoot.metadata && typeof metaRoot.metadata === 'object') ? metaRoot.metadata :
                      (metaRoot.data && typeof metaRoot.data === 'object') ? metaRoot.data : undefined;

      const getByPath = (obj: any, path: string): unknown => {
        if (!obj) return undefined;
        const parts = path.split('.');
        let cur: any = obj;
        for (const p of parts) {
          if (cur == null) return undefined;
          // Support numeric indices like steps.0.title
          const idx = Number.isInteger(Number(p)) ? Number(p) : undefined;
          if (idx !== undefined && Array.isArray(cur)) {
            cur = cur[idx];
          } else {
            cur = cur[p as keyof typeof cur];
          }
        }
        return cur;
      };

      const pickString = (...candidates: Array<unknown>): string | undefined => {
        for (const c of candidates) {
          const v = typeof c === 'string' ? c : undefined;
          if (v) {
            const s = v.trim();
            if (s) return s;
          }
        }
        return undefined;
      };

      const pickFromPaths = (root: any, paths: string[]): string | undefined => {
        for (const p of paths) {
          const v = getByPath(root, p);
          if (typeof v === 'string') {
            const s = v.trim();
            if (s) return s;
          }
        }
        return undefined;
      };

      // Heuristic: scan metadata for a plausible title if explicit fields are missing
      const findPlausibleTitle = (root: any): string | undefined => {
        if (!root || typeof root !== 'object') return undefined;
        const priorityKeys = new Set([
          'subject','heading','question','prompt','query','goal','task','request','title','name'
        ]);
        // Shallow pass over keys
        for (const [k, v] of Object.entries(root)) {
          if (typeof v === 'string') {
            const s = v.trim();
            if (!s) continue;
            if (priorityKeys.has(k) && s.length >= 8 && s.length <= 160) return s;
          }
        }
        // Look into common arrays/objects
        const arraysToCheck = [
          getByPath(root, 'steps'),
          getByPath(root, 'plan.steps'),
          getByPath(root, 'workflow.steps'),
          getByPath(root, 'messages'),
        ];
        for (const arr of arraysToCheck) {
          if (Array.isArray(arr)) {
            for (const item of arr) {
              const s = pickFromPaths(item, ['title','heading','text','content']);
              if (s && s.length >= 8) return s;
            }
          }
        }
        // Fallback: first reasonable string value found by shallow scan
        for (const v of Object.values(root)) {
          if (typeof v === 'string') {
            const s = v.trim();
            if (s.length >= 12 && s.length <= 160) return s;
          }
        }
        return undefined;
      };

      const name = (
        pickString(metaRoot.name, metaRoot.thread_name, metaRoot.conversation_title, metaRoot.threadTitle) ||
        (altRoot ? pickString(altRoot.name, altRoot.thread_name, altRoot.conversation_title, altRoot.threadTitle) : undefined) ||
        pickFromPaths(metaRoot, [
          'thread.name',
          'thread.title',
          'task.name',
          'task.title',
          'steps.0.title',
          'plan.steps.0.title',
          'workflow.steps.0.title'
        ])
      );

      const titleRaw = (
        pickString(metaRoot.title, metaRoot.subtitle) ||
        (altRoot ? pickString(altRoot.title, altRoot.subtitle) : undefined) ||
        pickFromPaths(metaRoot, [
          'steps.0.title',
          'plan.steps.0.title',
          'first_message.title',
          'first_message.content'
        ])
      );

      let displayTitle: string;
      if (name) {
        displayTitle = titleRaw && titleRaw !== name ? `${name}: ${titleRaw}` : name;
      } else {
        const plausible = titleRaw || findPlausibleTitle(metaRoot) || (altRoot ? findPlausibleTitle(altRoot) : undefined);
        // Consider project name as a candidate title if it looks descriptive
        const projectTitle = t.project_id ? (projectNameMap.get(t.project_id) || '') : '';
        const projectTitleGood = projectTitle && !['Personal','Project','Untitled Project'].includes(projectTitle) && projectTitle.trim().length >= 4;
        displayTitle = plausible || (projectTitleGood ? projectTitle : `Thread ${t.thread_id.slice(0, 6)}`);
      }

      const agentName: string | undefined = pickString(metaRoot.agent_name, getByPath(metaRoot, 'agent.name') as any);
      const description: string | undefined = (
        pickString(metaRoot.description, metaRoot.summary, metaRoot.note) ||
        (altRoot ? pickString(altRoot.description, altRoot.summary, altRoot.note) : undefined)
      );

      return {
        ...t,
        _title: displayTitle,
        _description: description || '',
        _agentName: agentName,
      };
    });
  }, [threads, projectNameMap]);

  const filtered = useMemo(() => {
    if (!enriched) return [];
    const sorted = [...enriched].sort((a, b) => {
      const aTime = new Date(a.updated_at || a.created_at).getTime();
      const bTime = new Date(b.updated_at || b.created_at).getTime();
      return bTime - aTime;
    });
    if (!search) return sorted;
    const s = search.toLowerCase();
    return sorted.filter(t =>
      t._title.toLowerCase().includes(s) ||
      t._description.toLowerCase().includes(s) ||
      t.thread_id.toLowerCase().includes(s)
    );
  }, [enriched, search]);

  return (
    <div className="relative p-6 space-y-6">
      <div className="absolute top-2 left-2 md:hidden z-10">
        <MobileSidebarToggle />
      </div>
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Your Threads</h1>
        <p className="text-sm text-muted-foreground mt-1">Personal conversation history across all projects. Search by title or thread ID.</p>
      </div>
      <div className="flex items-center gap-3">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search threads..."
          className="w-full max-w-sm h-9 px-3 rounded-md border bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>
      {isLoading && <div className="text-sm text-muted-foreground">Loading...</div>}
      {error && <div className="text-sm text-destructive">Failed to load threads</div>}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map(t => {
          const target = `/agents/${t.thread_id}`; // existing route pattern for a single thread view
          const projectName = t.project_id ? (projectNameMap.get(t.project_id) || 'Project') : 'Personal';
          const updated = t.updated_at || t.created_at;
          const showProjectChip = projectName && projectName !== t._title;
          return (
            <Link key={t.thread_id} href={target} className="group border rounded-lg p-4 hover:border-primary transition-colors">
              <div className="flex items-start justify-between mb-2">
                <h2 className="font-medium truncate max-w-[70%] group-hover:text-primary">{t._title}</h2>
                {showProjectChip && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{projectName}</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2 min-h-[32px]">{t._description || 'No description available.'}</p>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                {t._agentName && (
                  <span className="inline-flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-primary" />{t._agentName}</span>
                )}
                <span>Updated {new Date(updated).toLocaleString()}</span>
                <span>•</span>
                <span>ID {t.thread_id.slice(0,8)}</span>
              </div>
            </Link>
          );
        })}
        {!isLoading && filtered.length === 0 && (
          <div className="col-span-full text-sm text-muted-foreground border rounded-lg p-8 text-center">
            No threads found.
          </div>
        )}
      </div>
    </div>
  );
}
