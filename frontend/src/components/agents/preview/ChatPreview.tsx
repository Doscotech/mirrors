"use client";

import React, { useMemo, useRef, useState } from 'react';
import { Loader2, Send } from 'lucide-react';
import { useTryChat, tryChatStream } from '@/hooks/react-query/secure-mcp/use-secure-mcp';
import { toast } from 'sonner';

type ChatMessage = { role: 'user' | 'assistant'; content: string };

export function ChatPreview({ templateId, initialPrompt }: { templateId: string; initialPrompt?: string }) {
  const [input, setInput] = useState(initialPrompt || 'Give me a one-sentence overview of what you can do.');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const listRef = useRef<HTMLDivElement>(null);
  const tryChat = useTryChat(templateId);
  const [streaming, setStreaming] = useState<boolean>(true);
  const abortRef = useRef<AbortController | null>(null);

  const canSend = useMemo(() => input.trim().length > 0 && !tryChat.isPending, [input, tryChat.isPending]);

  const send = async () => {
    if (!canSend) return;
    const userMsg: ChatMessage = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    try {
      if (streaming) {
        abortRef.current?.abort();
        abortRef.current = new AbortController();
        let acc = '';
        await tryChatStream(
          templateId,
          { message: userMsg.content },
          (ev) => {
            if (ev.type === 'chunk') {
              acc += ev.delta;
              // live update last assistant bubble or push new one if not present
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last && last.role === 'assistant') {
                  const next = [...prev];
                  next[next.length - 1] = { role: 'assistant', content: acc };
                  return next;
                }
                return [...prev, { role: 'assistant', content: acc }];
              });
            } else if (ev.type === 'error') {
              const msg = ev.error?.message || 'Preview stream failed';
              toast.error(msg);
            }
          },
          abortRef.current.signal
        );
      } else {
        const res = await tryChat.mutateAsync({ message: userMsg.content });
        if (res?.reply) {
          setMessages(prev => [...prev, { role: 'assistant', content: res.reply }]);
        }
      }
    } catch (e: any) {
      const retryAfter = e?.retry_after;
      if (retryAfter) {
        toast.error(`Too many previews. Try again in ${retryAfter}s.`);
      } else {
        toast.error(e?.message || 'Preview failed. Please try again.');
      }
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, preview failed. Please try again.' }]);
    } finally {
      // scroll to bottom
      setTimeout(() => {
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
      }, 50);
    }
  };

  return (
    <div className="rounded-xl border bg-background/50">
      <div ref={listRef} className="max-h-80 overflow-auto p-3 space-y-2">
        {messages.length === 0 && (
          <p className="text-sm text-muted-foreground">This is a preview area. Send one sample message to see how the agent responds. Tools are disabled for preview.</p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>
              {m.content}
            </div>
          </div>
        ))}
        {tryChat.isPending && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Generating…</div>
        )}
        {tryChat.error && (
          <div className="text-xs text-destructive">Preview request failed.</div>
        )}
      </div>
      <div className="border-t p-2 flex items-center gap-2">
        <input
          className="flex-1 rounded-md border bg-background px-3 py-2 text-sm"
          placeholder="Type a sample message"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
          disabled={tryChat.isPending}
        />
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <input type="checkbox" checked={streaming} onChange={(e) => setStreaming(e.target.checked)} />
          Stream
        </label>
        <button onClick={send} disabled={!canSend} className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground disabled:opacity-50">
          {tryChat.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          <span>Send</span>
        </button>
      </div>
    </div>
  );
}

export default ChatPreview;
