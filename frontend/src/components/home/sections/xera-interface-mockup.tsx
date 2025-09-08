"use client";

import React from "react";
import { motion } from "motion/react";

type Message = { sender: "user" | "ai"; text: string };

const messages: Message[] = [
  { sender: "user", text: "Summarize today’s pipeline alerts and create a Jira for anything critical." },
  { sender: "ai", text: "I’ve grouped 42 alerts into 5 incidents. Creating Jira tickets for P1 items and drafting post-mortems." },
  { sender: "ai", text: "Linked dashboards and logs. Want me to notify the on-call channel and assign owners?" },
];

function Bubble({ sender, children }: { sender: Message["sender"]; children: React.ReactNode }) {
  const isUser = sender === "user";
  return (
    <div className={`w-full flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`rounded-2xl px-3 py-2 text-sm max-w-[75%] leading-relaxed backdrop-blur-md border ${
          isUser ? "bg-white/10 border-white/20" : "bg-black/40 border-white/10"
        }`}
      >
        <span className="text-white/90">{children}</span>
      </div>
    </div>
  );
}

export function XeraInterfaceMockup() {
  const [progress, setProgress] = React.useState(0);
  React.useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      i += 5;
      setProgress((p) => Math.min(100, p + 5));
      if (i >= 100) clearInterval(timer);
    }, 300);
    return () => clearInterval(timer);
  }, []);

  const timeline = [
    { name: 'web.browse', detail: 'explorer.tronscan.org', desc: 'Open URL and extract txn metadata', color: 'bg-emerald-400' },
    { name: 'fetch.get', detail: 'GET /api/transaction/:txid', desc: 'Pull sender/recipient, timestamp, onward transfers', color: 'bg-amber-400' },
    { name: 'ocr.extract', detail: '/uploads/wallet-screenshot.png', desc: 'Recognize small text and re-run tracing', color: 'bg-sky-400' },
    { name: 'jira.create', detail: 'SEC-1234', desc: 'Draft incident ticket and assign owner', color: 'bg-emerald-400' },
  ];
  return (
    <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden border border-white/10 shadow-[0_20px_80px_-10px_rgba(0,0,0,0.5)] bg-[radial-gradient(100%_100%_at_50%_0%,rgba(18,18,20,0.9),rgba(8,8,10,1))]">
      {/* Header mirrors thread SiteHeader minimal shape */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-white/10 bg-black/40 backdrop-blur-md">
        <div className="flex items-center gap-2 text-sm text-white/80">
          <div className="size-2 rounded-full bg-emerald-400" />
          Project • Demo
        </div>
        <div className="flex items-center gap-2 text-[11px] text-white/60">
          <div className="px-2 py-1 rounded-md bg-white/5 border border-white/10">Share</div>
          <div className="px-2 py-1 rounded-md bg-white/5 border border-white/10">Settings</div>
        </div>
      </div>

  {/* Model & agent selector bar */}
      <div className="h-10 px-3 flex items-center gap-3 border-b border-white/10 bg-black/30 backdrop-blur-md text-[12px] text-white/70">
        {/* Agent selector moved here */}
        <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-white/5 border border-white/10">
          <div className="size-4 rounded-full bg-white/20 ring-1 ring-inset ring-white/20" />
          <span>agent: Investigator</span>
        </div>
        <div className="px-2 py-1 rounded-md bg-white/5 border border-white/10">gpt-4o</div>
        <div className="px-2 py-1 rounded-md bg-white/5 border border-white/10">memory: on</div>
        <div className="px-2 py-1 rounded-md bg-white/5 border border-white/10">tools: web, files</div>
      </div>

      {/* Main split: left chat interface, right agent console (50/50) */}
      <div className="h-[calc(100%-5.5rem)] grid grid-cols-2">
        {/* Left: Chat interface */}
        <div className="relative overflow-hidden bg-black/30">
          {/* Messages area */}
          <div className="absolute inset-0 overflow-y-auto p-4 pb-36 space-y-3">
            {/* User message */}
            <div className="w-full flex justify-end">
              <div className="max-w-xl rounded-2xl bg-white/10 border border-white/20 p-3 text-sm text-white/90">
                Someone hacked my wallet. Can you trace the transactions and prepare a report?
              </div>
            </div>
            {/* Assistant message with structured formatting */}
            <div className="max-w-2xl rounded-2xl bg-white/[0.06] border border-white/10 p-3 text-sm text-white/90 space-y-2">
              <div className="leading-relaxed">Here’s what I can do next:</div>
              <ul className="list-disc pl-5 space-y-1 text-white/85">
                <li>Pull transaction history and cross-check onward transfers</li>
                <li>OCR clearer images and re-run tracing</li>
                <li>Run deeper variant search across multiple explorers</li>
              </ul>
              <div className="text-white/70 text-[12px]">Reply with 1–3, or paste an address/txid to begin immediately.</div>
            </div>
            {/* Tool chips (static preview) */}
            <div className="flex gap-2 text-xs">
              <div className="inline-flex items-center gap-1.5 py-1 px-2 text-xs text-white/80 bg-white/5 rounded-lg border border-white/10">
                <div className="size-3 rounded-sm bg-white/30" /> web.browse
              </div>
              <div className="inline-flex items-center gap-1.5 py-1 px-2 text-xs text-white/80 bg-white/5 rounded-lg border border-white/10">
                <div className="size-3 rounded-sm bg-white/30" /> files.read
              </div>
              <div className="inline-flex items-center gap-1.5 py-1 px-2 text-xs text-white/80 bg-white/5 rounded-lg border border-white/10">
                <div className="size-3 rounded-sm bg-white/30" /> jira.create
              </div>
            </div>
          </div>

          {/* Chat input shell */}
          <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-black/50 backdrop-blur-md p-3">
            <div className="max-w-3xl">
              <div className="h-12 rounded-xl bg-white/[0.06] border border-white/10 px-4 flex items-center justify-between">
                <span className="text-xs text-white/60">Describe what you need help with…</span>
                <div className="flex items-center gap-2">
                  <button className="h-8 px-3 rounded-lg bg-white text-black text-xs font-medium">Send</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Agent console */}
        <div className="relative border-l border-white/10 bg-black/20 backdrop-blur-md">
          {/* Console modal */}
          <div className="absolute inset-4 rounded-xl border border-white/10 bg-[radial-gradient(60%_120%_at_50%_0%,rgba(53,62,94,0.5),rgba(25,28,40,0.8))] shadow-[0_8px_40px_rgba(0,0,0,0.5)] overflow-hidden">
            {/* Title bar */}
            <div className="h-10 px-4 flex items-center justify-between border-b border-white/10 text-sm text-white/80">
              <div>Xera's Console</div>
              <div className="size-6 rounded bg-white/10 grid place-items-center">×</div>
            </div>
            {/* Body: tool call timeline with stagger */}
            <div className="h-[calc(100%-5.5rem)] p-4 overflow-y-auto space-y-3">
              <div className="text-xs text-white/70">Running • Tool calls</div>
              {timeline.map((t, idx) => (
                <motion.div
                  key={t.name}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 * idx, duration: 0.35, ease: 'easeOut' }}
                  className="rounded-lg border border-white/10 bg-white/[0.03] p-3"
                >
                  <div className="flex items-center justify-between text-xs text-white/85">
                    <div className="flex items-center gap-2"><div className={`size-2 rounded-full ${t.color}`} /> {t.name}</div>
                    <div className="text-white/60">{t.detail}</div>
                  </div>
                  <div className="mt-2 text-[12px] text-white/80">{t.desc}</div>
                </motion.div>
              ))}
            </div>
            {/* Bottom controls */}
            <div className="h-12 px-4 flex items-center justify-between border-t border-white/10 text-xs text-white/80">
              <div className="flex items-center gap-3">
                <div>{Math.round((progress/100)*29)}/29</div>
                <div className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                <div className="w-40 h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full rounded-full bg-white/50 transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>
              <div className="px-2 py-1 rounded-md bg-white/5 border border-white/10">Latest Tool</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
