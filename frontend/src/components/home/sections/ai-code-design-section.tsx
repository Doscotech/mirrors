'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { vujahdayScript } from '@/app/fonts';
import { cn } from '@/lib/utils';
import { Code2, MessageSquareText, Plug, Webhook, Clock, Github, Wand2, Image as ImageIcon, Mic, Video, Database, Globe, Zap, Sparkles, Play, GitBranch, FileDiff, Terminal, Settings } from 'lucide-react';

// Small, self-contained blocks to mirror the reference's two-column feature stack
function BlockCard({
  title,
  subtitle,
  icon: Icon,
  children,
  delay = 0,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ComponentType<any>;
  children?: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.5, delay }}
  className="group relative overflow-hidden rounded-xl border bg-card/60 backdrop-blur-md"
    >
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/5 to-transparent opacity-50" />
      <div className="relative p-5 sm:p-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          {Icon && <Icon className="h-4 w-4" />}
          <span>{title}</span>
        </div>
        {subtitle && (
          <div className="text-foreground font-medium mb-3">{subtitle}</div>
        )}
  <div className="rounded-lg border bg-background p-3 sm:p-4">{children}</div>
      </div>
    </motion.div>
  );
}

function ChatPreview() {
  const messages = [
    { sender: 'user' as const, text: "Find breaking changes in prisma and draft a migration PR." },
    { sender: 'ai' as const, text: (
      <>
        Got it. I will:
        <ol className="mt-2 list-decimal pl-5 space-y-1">
          <li>Scan release notes</li>
          <li>Update schema + generate diff</li>
          <li>Open PR with migration plan</li>
        </ol>
      </>
    ) },
  ];

  const ToolChips = () => (
    <div className="flex flex-wrap gap-2">
      {['web.browse', 'git.diff', 'pr.create'].map((t) => (
        <span key={t} className="inline-flex items-center gap-1.5 rounded-md border bg-background px-2 py-1 text-[11px] text-muted-foreground">
          <span className="size-2 rounded-sm bg-muted-foreground/40" /> {t}
        </span>
      ))}
    </div>
  );

  const Bubble = ({ sender, children }: { sender: 'user' | 'ai'; children: React.ReactNode }) => {
    const isUser = sender === 'user';
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-10%' }}
        transition={{ duration: 0.35 }}
        className={cn('w-full flex gap-3', isUser ? 'justify-end' : 'justify-start')}
      >
        {!isUser && (
          <div className="size-7 shrink-0 rounded-full bg-emerald-500/10 grid place-items-center text-emerald-400 text-[10px] font-semibold border border-emerald-500/20">
            AI
          </div>
        )}
        <div className={cn('max-w-[80%] rounded-2xl border px-3 py-2 text-sm leading-relaxed backdrop-blur-md', isUser ? 'bg-white/10 border-white/20' : 'bg-white/[0.06] border-white/10')}>
          <div className="text-white/90">{children}</div>
        </div>
        {isUser && (
          <div className="size-7 shrink-0 rounded-full bg-primary/10 grid place-items-center text-primary text-[10px] font-semibold border border-primary/20">
            U
          </div>
        )}
      </motion.div>
    );
  };

  const Typing = () => (
    <div className="flex items-start gap-3">
      <div className="size-7 shrink-0 rounded-full bg-emerald-500/10 grid place-items-center text-emerald-400 text-[10px] font-semibold border border-emerald-500/20">AI</div>
      <div className="rounded-2xl border bg-white/[0.06] border-white/10 px-3 py-2">
        <div className="flex items-center gap-1">
          <span className="size-1.5 rounded-full bg-white/70 animate-bounce [animation-delay:-0.2s]" />
          <span className="size-1.5 rounded-full bg-white/70 animate-bounce [animation-delay:-0.1s]" />
          <span className="size-1.5 rounded-full bg-white/70 animate-bounce" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative space-y-3">
      {messages.map((m, i) => (
        <Bubble key={i} sender={m.sender}>{m.text}</Bubble>
      ))}
      {/* Tool chips shown after AI plan */}
      <div className="pl-10"><ToolChips /></div>
      {/* Typing indicator */}
      <Typing />
      {/* Compact input shell */}
      <div className="pt-2">
        <div className="h-9 rounded-lg bg-white/[0.06] border border-white/10 px-3 flex items-center justify-between text-xs text-white/70">
          <span className="truncate">Describe what you need help with…</span>
          <button className="ml-2 h-7 px-2 rounded-md bg-white text-black text-[11px] font-medium">Send</button>
        </div>
      </div>
    </div>
  );
}

function CodeSnippet() {
  return (
    <pre className="text-xs leading-relaxed overflow-auto rounded-md bg-zinc-950 text-zinc-100 p-4 border border-zinc-800">
<code>{`diff --git a/prisma/schema.prisma b/prisma/schema.prisma
@@ -12,6 +12,9 @@ model User {
   id        String   @id @default(cuid())
   email     String   @unique
   createdAt DateTime @default(now())
 
+  // New field for billing tier
+  plan      String   @default("free")
+
   posts     Post[]
 }
`}</code>
    </pre>
  );
}

function DesignTokens() {
  const swatches = ['#22d3ee', '#8b5cf6', '#f43f5e', '#f59e0b', '#10b981', '#60a5fa'];
  return (
    <div className="flex items-center gap-3 flex-wrap">
      {swatches.map((c) => (
        <div key={c} className="flex flex-col items-center gap-1">
          <div className="size-8 rounded-md border" style={{ backgroundColor: c }} />
          <div className="text-[10px] font-mono text-muted-foreground">{c}</div>
        </div>
      ))}
    </div>
  );
}

function CapabilitiesList() {
  const caps = [
    { icon: ImageIcon, name: 'Image creation', desc: 'Generate brand assets, UI mocks, and diagrams.' },
    { icon: Wand2, name: 'Image editing', desc: 'Inpaint, background removal, upscale, recolor.' },
    { icon: Mic, name: 'Voice synthesis', desc: 'Realistic TTS for product tours and voice agents.' },
    { icon: Video, name: 'Video snippets', desc: 'Short how‑tos, demo reels, and animated previews.' },
    { icon: Code2, name: 'Code & refactor', desc: 'Create files, diff, test, and open PRs.' },
    { icon: Database, name: 'Data & tools', desc: 'Query DBs, call APIs, and orchestrate automations.' },
    { icon: Globe, name: 'Web actions', desc: 'Browse, extract, and interact with web apps.' },
    { icon: Zap, name: 'Workflows', desc: 'Chain steps with triggers, retries, and approvals.' },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {caps.map(({ icon: Icon, name, desc }, i) => (
        <div key={i} className="rounded-md border bg-background p-3">
          <div className="flex items-start gap-3">
            <div className="size-8 rounded-md border grid place-items-center bg-muted/30 text-foreground/90">
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-medium">{name}</div>
              <div className="text-xs text-muted-foreground">{desc}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Timeline() {
  const steps = [
    { name: 'web.browse', status: 'done' },
    { name: 'fetch.get', status: 'done' },
    { name: 'diff.compute', status: 'live' },
    { name: 'pr.create', status: 'queue' },
  ];
  return (
    <div className="space-y-2">
      {steps.map((s, i) => (
        <div key={i} className="flex items-center justify-between rounded-md border bg-background px-3 py-2 text-xs">
          <div className="flex items-center gap-2">
            <div className={cn('size-1.5 rounded-full', s.status === 'done' ? 'bg-emerald-400' : s.status === 'live' ? 'bg-amber-400 animate-pulse' : 'bg-muted-foreground/40')} />
            <span className="font-mono text-muted-foreground">{s.name}</span>
          </div>
          <span className="text-muted-foreground/70">{s.status}</span>
        </div>
      ))}
    </div>
  );
}

// Integrations screen mock
function IntegrationsGrid() {
  const items = [
    { key: 'github', name: 'GitHub', status: 'Connected' },
    { key: 'jira', name: 'Jira', status: 'Connect' },
    { key: 'slack', name: 'Slack', status: 'Connected' },
    { key: 'notion', name: 'Notion', status: 'Connect' },
    { key: 'linear', name: 'Linear', status: 'Connect' },
    { key: 'postgres', name: 'Postgres', status: 'Connect' },
  ];

  // Lightweight brand icons (monochrome) to avoid extra deps
  const SlackIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false" {...props}>
      <rect x="8" y="1" width="4" height="7" rx="2" fill="currentColor" />
      <rect x="8" y="12" width="4" height="7" rx="2" fill="currentColor" />
      <rect x="12" y="8" width="7" height="4" rx="2" fill="currentColor" />
      <rect x="1" y="8" width="7" height="4" rx="2" fill="currentColor" />
    </svg>
  );

  const NotionIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...props}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 7.5v9M16 7.5v9M8 7.5l8 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );

  const JiraIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...props}>
      <path d="M12 3l4 4-4 4-4-4 4-4Z" fill="currentColor" />
      <path d="M7 8l4 4-2.5 2.5L4.5 10.5 7 8Z" fill="currentColor" opacity=".65" />
      <path d="M17 8l2.5 2.5-4 4L13 12l4-4Z" fill="currentColor" opacity=".65" />
    </svg>
  );

  const LinearIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...props}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7 17l10-10M10 17l7-7M13 17l4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );

  const PostgresIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...props}>
      <ellipse cx="12" cy="6" rx="7.5" ry="3.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4.5 6v8c0 1.93 3.36 3.5 7.5 3.5s7.5-1.57 7.5-3.5V6" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4.5 10c0 1.93 3.36 3.5 7.5 3.5s7.5-1.57 7.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );

  const BrandIcon = ({ id }: { id: string }) => {
    const common = { className: 'h-5 w-5' } as const;
    switch (id) {
      case 'github':
        return <Github {...common} />;
      case 'slack':
        return <SlackIcon {...common} />;
      case 'notion':
        return <NotionIcon {...common} />;
      case 'jira':
        return <JiraIcon {...common} />;
      case 'linear':
        return <LinearIcon {...common} />;
      case 'postgres':
        return <PostgresIcon {...common} />;
      default:
        return <div className="h-5 w-5 rounded-sm bg-muted" aria-hidden />;
    }
  };
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <div className="h-8 flex-1 rounded-md border bg-background px-2 flex items-center" aria-hidden>
          <span className="opacity-60">Search integrations…</span>
        </div>
        <span className="rounded-md border bg-background px-2 py-1">All</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {items.map((it) => (
          <div key={it.key} className="rounded-lg border bg-card/70 p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-md border grid place-items-center bg-background text-foreground" aria-label={`${it.name} icon`}>
                <BrandIcon id={it.key} />
              </div>
              <div>
                <div className="text-sm text-foreground">{it.name}</div>
                <div className="text-[11px] text-muted-foreground">{it.status === 'Connected' ? 'Account linked' : 'Not connected'}</div>
              </div>
            </div>
            <button className={cn('h-7 px-2 rounded-md text-[11px] border', it.status === 'Connected' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-background text-foreground/80')}>{it.status}</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// Triggers/automations history
function TriggersHistory() {
  const logs = [
    { svc: 'GitHub', ev: 'issue.opened', ago: '2m', status: 'done' },
    { svc: 'Stripe', ev: 'invoice.paid', ago: '12m', status: 'done' },
    { svc: 'Slack', ev: 'message.posted', ago: '1h', status: 'live' },
    { svc: 'Notion', ev: 'page.updated', ago: '3h', status: 'queued' },
  ];
  return (
    <div className="text-xs space-y-2">
      {logs.map((l, i) => (
        <div key={i} className="flex items-center justify-between rounded-md border bg-background px-3 py-2">
          <div className="flex items-center gap-2">
            <div className={cn('size-1.5 rounded-full', l.status === 'done' ? 'bg-emerald-400' : l.status === 'live' ? 'bg-amber-400 animate-pulse' : 'bg-muted-foreground/40')} />
            <span className="font-medium text-foreground/90">{l.svc}</span>
            <span className="text-muted-foreground">{l.ev}</span>
          </div>
          <div className="text-muted-foreground/70">{l.ago} ago</div>
        </div>
      ))}
    </div>
  );
}

// Refined code editor with header + line numbers + diff highlighting
function CodeWorkbench() {
  const diff = `diff --git a/prisma/schema.prisma b/prisma/schema.prisma
@@ -12,6 +12,11 @@ model User {
   id        String   @id @default(cuid())
   email     String   @unique
   createdAt DateTime @default(now())

+  // Billing tier for usage limits
+  plan      String   @default("free")
+  // Index for faster lookups
+  @@index([plan])

   posts     Post[]
 }`;
  const lines = diff.split('\n');

  return (
    <div className="rounded-md border bg-zinc-950 text-zinc-100 overflow-hidden">
      {/* Top workbar */}
      <div className="h-10 px-3 flex items-center justify-between border-b border-zinc-800 bg-zinc-900/80">
        <div className="flex items-center gap-3 text-[11px] text-zinc-300">
          <GitBranch className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">main</span>
          <span className="opacity-40">/</span>
          <span>prisma/schema.prisma</span>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <button className="inline-flex items-center gap-1 rounded-md bg-zinc-800 border border-zinc-700 px-2 py-1"><Sparkles className="h-3.5 w-3.5" /> Ask AI</button>
          <button className="inline-flex items-center gap-1 rounded-md bg-zinc-800 border border-zinc-700 px-2 py-1"><Play className="h-3.5 w-3.5" /> Dry‑run</button>
          <button className="inline-flex items-center gap-1 rounded-md bg-white text-black px-2 py-1"><FileDiff className="h-3.5 w-3.5" /> Apply</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="h-8 flex items-center gap-2 px-2 border-b border-zinc-800 bg-zinc-950/60 text-[11px]">
        <div className="rounded-md bg-zinc-800/80 border border-zinc-700 px-2 py-0.5">schema.prisma</div>
        <div className="rounded-md border border-zinc-800 px-2 py-0.5 text-zinc-400">migration.sql</div>
        <div className="ml-auto flex items-center gap-2 text-zinc-400">
          <Terminal className="h-3.5 w-3.5" />
          <Settings className="h-3.5 w-3.5" />
        </div>
      </div>

      {/* Editor */}
      <div className="grid grid-cols-[44px_1fr] text-[12px]/relaxed font-mono">
        {lines.map((ln, i) => {
          const type = ln.startsWith('+') ? 'add' : ln.startsWith('-') ? 'del' : ln.startsWith('@@') ? 'hunk' : 'ctx';
          const content = ln.replace(/^\+|^-/, '');
          return (
            <React.Fragment key={i}>
              <div className={cn('px-2 py-0.5 text-right select-none border-r border-zinc-800', type === 'add' ? 'text-emerald-400' : type === 'del' ? 'text-rose-400' : 'text-zinc-500')}>{i + 1}</div>
              <div className={cn('px-3 py-0.5 whitespace-pre overflow-x-auto relative',
                type === 'add' && 'bg-emerald-950/40 text-emerald-200',
                type === 'del' && 'bg-rose-950/40 text-rose-200',
                type === 'hunk' && 'bg-zinc-900/60 text-zinc-300')}
              >
                {/* Inline ghost suggestion ala Copilot */}
                {type === 'ctx' && i === 6 ? (
                  <>
                    {content}
                    <span className="opacity-30">  // consider enum Plan {'{'} free pro enterprise {'}'}</span>
                  </>
                ) : (
                  ln
                )}

                {/* Inline hint bubble ala Claude/OpenAI */}
                {type === 'add' && i === 8 && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px]">
                    <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 text-emerald-200 px-2 py-1 shadow">
                      Suggested by AI · <button className="underline">explain</button>
                    </div>
                  </div>
                )}
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Status bar */}
      <div className="h-8 px-3 flex items-center justify-between border-t border-zinc-800 bg-zinc-900/80 text-[11px] text-zinc-300">
        <div className="flex items-center gap-3">
          <span>UTF‑8</span>
          <span>LF</span>
          <span>Prisma</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded px-1.5 py-0.5 bg-zinc-800 border border-zinc-700">gpt‑4o‑mini</span>
          <span className="rounded px-1.5 py-0.5 bg-zinc-800 border border-zinc-700">2.2k tokens</span>
        </div>
      </div>
    </div>
  );
}

function SidePanel() {
  return (
    <div className="rounded-md border bg-card/70 p-3">
      <div className="text-xs mb-2 text-muted-foreground">AI Plan</div>
      <ol className="text-xs space-y-1.5 list-decimal pl-4">
        <li>Update Prisma schema with plan + index</li>
        <li>Generate migration and run checks</li>
        <li>Open PR with summary + rollout steps</li>
      </ol>
      <div className="mt-4">
        <div className="text-xs mb-2 text-muted-foreground">Tokens & Params</div>
        <div className="rounded-md border bg-background p-2 space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span>Context tokens</span>
            <span className="font-mono">2,240</span>
          </div>
          <div className="h-1.5 rounded bg-muted overflow-hidden">
            <div className="h-full w-[45%] bg-gradient-to-r from-emerald-400/70 to-emerald-500" />
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span>Temperature</span>
            <span className="font-mono">0.2</span>
          </div>
          <div className="h-1.5 rounded bg-muted overflow-hidden">
            <div className="h-full w-[20%] bg-gradient-to-r from-sky-400/70 to-sky-500" />
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span>Model</span>
            <span className="rounded bg-muted px-1.5 py-0.5">gpt‑4o‑mini</span>
          </div>
        </div>
      </div>
      <div className="mt-4">
        <div className="text-xs mb-2 text-muted-foreground">Live Tools</div>
        <Timeline />
      </div>
      <div className="mt-4 space-y-2">
        <input className="w-full h-8 rounded-md border bg-background px-2 text-[12px]" placeholder="Commit message…" />
        <div className="flex gap-2">
          <button className="h-8 px-2 rounded-md bg-zinc-900 border border-zinc-700 text-[11px]">Revert</button>
          <button className="h-8 px-2 rounded-md bg-white text-black text-[11px]">Create PR</button>
        </div>
      </div>
    </div>
  );
}

export function AiCodeDesignSection() {
  return (
    <section className="w-full">
      <div className="w-full max-w-6xl mx-auto py-24 lg:py-32 px-6 sm:px-8">
        <div className="mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-foreground leading-tight">
            <span className="bg-gradient-to-l from-white/20 via-white/90 to-white/20 bg-[length:200%_100%] bg-clip-text text-transparent motion-reduce:animate-none animate-[shimmer_3s_ease_infinite]">AI</span>
            <span className="text-foreground/60 mx-2">•</span>
            <span className="font-mono">Code</span>
            <span className="text-foreground/60 mx-2">•</span>
            <span className={cn(vujahdayScript.className, 'not-italic text-4xl lg:text-5xl')}>Design</span>
            <br />
            <span className="text-base sm:text-lg text-muted-foreground">Side-by-side-by-side</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Left column */}
          <div className="flex flex-col gap-6 lg:gap-8">
            <BlockCard title="Integrations" subtitle="Connect tools and services" icon={Plug} delay={0.05}>
              <IntegrationsGrid />
            </BlockCard>
            <BlockCard title="Triggers" subtitle="Recent automations and events" icon={Webhook} delay={0.1}>
              <TriggersHistory />
            </BlockCard>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-6 lg:gap-8 mt-6 lg:mt-0">
            <BlockCard title="Chat" subtitle="Natural language to working output" icon={MessageSquareText} delay={0.05}>
              <ChatPreview />
            </BlockCard>
            <BlockCard title="Capabilities" subtitle="What the agent can do" icon={Wand2} delay={0.1}>
              <CapabilitiesList />
            </BlockCard>
            <BlockCard title="Code workspace" subtitle="Editor‑like with AI coding actions" icon={Code2} delay={0.15}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <CodeWorkbench />
                <SidePanel />
              </div>
            </BlockCard>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AiCodeDesignSection;
