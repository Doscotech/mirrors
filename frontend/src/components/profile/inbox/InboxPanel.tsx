"use client";
import React from 'react';
import { GlassPanel } from '../GlassPanel';

export interface InboxMessageItem {
  id: string;
  title: string;
  preview: string;
  createdAt: string; // ISO
  unread?: boolean;
  highlight?: boolean;
}

export interface InboxPanelProps {
  messages: InboxMessageItem[];
  loading?: boolean;
  onOpen?: (id: string) => void;
}

export function InboxPanel({ messages, loading, onOpen }: InboxPanelProps) {
  return (
    <GlassPanel className="space-y-3" aria-label="Inbox" role="region">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium tracking-wide text-muted-foreground/80">Inbox</h3>
        <button className="text-[10px] px-2 py-1 rounded bg-muted/40 hover:bg-muted/60" aria-label="Refresh inbox">↻</button>
      </div>
      {loading && <div className="text-[11px] text-muted-foreground/70">Loading…</div>}
      {!loading && messages.length === 0 && <div className="text-[11px] text-muted-foreground/60">No messages.</div>}
      <div className="space-y-2">
        {messages.map(m => (
          <button
            key={m.id}
            onClick={() => onOpen?.(m.id)}
            className={[
              'w-full text-left rounded-md border px-3 py-2 transition-colors',
              'bg-muted/30 hover:bg-muted/50',
              m.highlight ? 'border-primary/50' : 'border-muted/40'
            ].join(' ')}
            aria-label={m.title}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[11px] font-medium truncate">
                  {m.title}
                  {m.unread && <span className="ml-1 inline-block w-1.5 h-1.5 rounded-full bg-primary align-middle" />}
                </div>
                <p className="mt-0.5 text-[10px] text-muted-foreground/70 line-clamp-2 leading-snug">{m.preview}</p>
              </div>
              <time className="text-[9px] text-muted-foreground/60 whitespace-nowrap mt-0.5" dateTime={m.createdAt}>{new Date(m.createdAt).toLocaleDateString(undefined,{ month:'short', day:'numeric'})}</time>
            </div>
          </button>
        ))}
      </div>
    </GlassPanel>
  );
}

export default InboxPanel;
