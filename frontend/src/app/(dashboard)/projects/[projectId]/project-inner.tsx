"use client";
import { useParams } from 'next/navigation';
import { useProjectDetailQuery } from '@/hooks/react-query/threads/use-project';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface ThreadPreviewProps {
  threadId: string;
}

function ThreadLatestMessage({ threadId }: ThreadPreviewProps) {
  const [preview, setPreview] = useState<string>('');
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('messages')
          .select('content, type, created_at')
          .eq('thread_id', threadId)
          .neq('type', 'cost')
          .neq('type', 'summary')
          .order('created_at', { ascending: false })
          .limit(1);
        if (error) return;
        if (!cancelled && data && data.length) {
          try {
            const raw = data[0].content;
            // content may be JSON string with {role, content}
            let text = '';
            if (typeof raw === 'string') {
              try {
                const parsed = JSON.parse(raw);
                if (parsed && typeof parsed === 'object') {
                  if (Array.isArray(parsed.content)) {
                    text = parsed.content.map((c: any) => c.text || c.value || '').join(' ');
                  } else if (parsed.content?.text) {
                    text = parsed.content.text;
                  } else if (parsed.content) {
                    text = String(parsed.content);
                  } else if (parsed.message) {
                    text = String(parsed.message);
                  }
                  if (!text && parsed.role && parsed.content) {
                    text = typeof parsed.content === 'string' ? parsed.content : '';
                  }
                } else {
                  text = raw;
                }
              } catch {
                text = raw;
              }
            } else {
              text = JSON.stringify(raw);
            }
            text = text.replace(/\s+/g, ' ').trim();
            if (text.length > 120) text = text.slice(0, 117) + '...';
            setPreview(text);
          } catch {}
        }
      } catch (e) {
        // silent
      }
    };
    load();
    return () => { cancelled = true; };
  }, [threadId]);
  if (!preview) return <span className="text-xs text-muted-foreground">No messages yet</span>;
  return <span className="text-xs text-muted-foreground line-clamp-1">{preview}</span>;
}

export default function ProjectInner() {
  const params = useParams();
  const projectId = params?.projectId as string | undefined;
  const { data: projectDetail, isLoading, error } = useProjectDetailQuery(projectId);

  return (
    <div className="p-6 space-y-6">
      {isLoading && <div className="text-sm text-muted-foreground">Loading...</div>}
      {error && <div className="text-sm text-destructive">Failed to load project</div>}
      {projectDetail && (
        <>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">{projectDetail.project?.name || 'Untitled Project'}</h1>
            <p className="text-sm text-muted-foreground mt-1">Created {new Date(projectDetail.project?.created_at).toLocaleDateString()}</p>
          </div>
          <div className="border rounded-lg divide-y">
            {projectDetail.threads?.length ? projectDetail.threads.map((t: any) => (
              <Link key={t.thread_id} href={`/projects/${projectId}/thread/${t.thread_id}`} className="block p-4 hover:bg-muted/50 group">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Thread {t.thread_id.slice(0,8)}</span>
                  <span className="text-[11px] text-muted-foreground">{t.message_count} msgs</span>
                </div>
                <div className="mt-1">
                  <ThreadLatestMessage threadId={t.thread_id} />
                </div>
              </Link>
            )) : (
              <div className="p-6 text-sm text-muted-foreground">No threads yet.</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
