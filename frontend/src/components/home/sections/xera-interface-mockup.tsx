"use client";

import React from "react";
import { motion, useMotionValue, useTransform, useSpring } from "motion/react";

type Message = {
  id: string;
  sender: "user" | "ai";
  text: string;
  linkedTools?: string[]; // names shown to indicate console linkage
};

const messages: Message[] = [
  {
    id: "M1",
    sender: "user",
    text: "My wallet was drained. Can you trace where the funds went and compile a brief report?",
  },
  {
    id: "M2",
    sender: "ai",
    text:
      "I can investigate: 1) pull recent transactions, 2) trace onward hops, 3) detect exchange or mixer endpoints, 4) prepare a summary and freeze-request draft. Please share the address or a tx hash.",
  },
  {
    id: "M3",
    sender: "user",
    text: "Address: 0xA1b2…9F42 and first suspicious tx: 0xdead…beef.",
  },
  {
    id: "M4",
    sender: "ai",
    text:
      "Got it. I’m pulling chain metadata, then tracing the path. I’ll flag centralized endpoints and known mixers, and estimate recovery likelihood.",
    linkedTools: ["web.browse", "chain.scan"],
  },
  {
    id: "M5",
    sender: "ai",
    text:
      "Initial findings: funds split across 3 hops. Two routes converge into an address historically linked to Exchange-X deposit hot-wallets. Risk score: High for cash-out.",
    linkedTools: ["graph.trace", "exchange.lookup"],
  },
  {
    id: "M6",
    sender: "ai",
    text:
      "I can compile a case with evidence and draft a freeze request for Exchange-X’s compliance team. Proceed?",
    linkedTools: ["case.create", "report.generate"],
  },
];

function Bubble({
  sender,
  children,
  id,
  linkedTools,
}: {
  sender: Message["sender"];
  children: React.ReactNode;
  id?: string;
  linkedTools?: string[];
}) {
  const isUser = sender === "user";
  return (
    <div className={`w-full flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className="max-w-full sm:max-w-[75%]">
        <div
          className={`rounded-2xl px-3 py-2 text-[13px] sm:text-sm leading-relaxed backdrop-blur-md border ${
            isUser ? "bg-white/10 border-white/20" : "bg-black/40 border-white/10"
          }`}
        >
          <span className="text-white/90">{children}</span>
        </div>
        {/* Meta row: message id + linked tools */}
        {(id || (linkedTools && linkedTools.length)) && (
          <div className={`mt-1 flex items-center gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
            {id && (
              <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] bg-white/5 border border-white/10 text-white/70">
                {id}
              </span>
            )}
            {linkedTools && linkedTools.length > 0 && (
              <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] bg-white/5 border border-white/10 text-white/70">
                Linked: {linkedTools.join(", ")}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function XeraInterfaceMockup() {
  const [progress, setProgress] = React.useState(0);
  const [activeTab, setActiveTab] = React.useState<"chat" | "console">("chat"); // mobile tab
  const ref = React.useRef<HTMLDivElement | null>(null);

  // 3D tilt / parallax controls
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotX = useTransform(my, [-0.5, 0.5], [8, -8]);
  const rotY = useTransform(mx, [-0.5, 0.5], [-8, 8]);
  const scale = useSpring(1, { stiffness: 220, damping: 18 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width; // 0..1
    const y = (e.clientY - r.top) / r.height; // 0..1
    mx.set(x - 0.5); // -0.5..0.5
    my.set(y - 0.5);
  };
  const handleMouseLeave = () => {
    mx.set(0);
    my.set(0);
  };
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
    { ref: "M4", name: "web.browse", detail: "etherscan.io", desc: "Open explorer and pull base txn metadata", color: "bg-emerald-400" },
    { ref: "M4", name: "chain.scan", detail: "address/0x…9F42", desc: "Enumerate inbound/outbound transfers, timestamps", color: "bg-amber-400" },
    { ref: "M5", name: "graph.trace", detail: "depth=3, fanout=8", desc: "Trace onward hops and merge reconverging paths", color: "bg-sky-400" },
    { ref: "M5", name: "exchange.lookup", detail: "Exchange-X hot-wallet", desc: "Match endpoint against labeled exchange clusters", color: "bg-fuchsia-400" },
    { ref: "M6", name: "case.create", detail: "CASE-00921", desc: "Create investigation case with evidence bundle", color: "bg-emerald-400" },
    { ref: "M6", name: "report.generate", detail: "freeze_request.pdf", desc: "Draft freeze request with chain links & screenshots", color: "bg-indigo-400" },
  ];
  return (
    <div className="relative w-full" style={{ perspective: 1600 }}>
      {/* Tilting card */}
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onHoverStart={() => scale.set(1.01)}
        onHoverEnd={() => scale.set(1)}
        style={{ rotateX: rotX as any, rotateY: rotY as any, scale }}
        className="relative w-full rounded-xl overflow-hidden border border-white/10 shadow-[0_40px_140px_-20px_rgba(0,0,0,0.65)] bg-[radial-gradient(100%_100%_at_50%_0%,rgba(18,18,20,0.92),rgba(8,8,10,1))] min-h-[560px] sm:min-h-[620px] md:aspect-[16/9]"
      >
        {/* Ambient glows */}
        <div
          className="pointer-events-none absolute -top-24 -left-16 size-72 rounded-full"
          style={{ background: "radial-gradient(circle at center, rgba(56,189,248,0.18), transparent 60%)" }}
        />
        <div
          className="pointer-events-none absolute -bottom-28 -right-10 size-72 rounded-full"
          style={{ background: "radial-gradient(circle at center, rgba(168,85,247,0.18), transparent 60%)" }}
        />
        {/* Rotating conic ring backdrop */}
        <motion.div
          aria-hidden
          initial={{ rotate: 0, opacity: 0.24 }}
          animate={{ rotate: 360, opacity: 0.28 }}
          transition={{ duration: 18, ease: "linear", repeat: Infinity }}
          className="pointer-events-none absolute -inset-6 -z-10 rounded-[32px] blur-2xl"
          style={{
            background:
              "conic-gradient(from 0deg at 50% 50%, rgba(59,130,246,0.18), rgba(16,185,129,0.18), rgba(236,72,153,0.18), rgba(59,130,246,0.18))",
          }}
        />
        {/* Grid overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
            backgroundPosition: "center",
          }}
        />
        {/* Top reflection */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-24"
          style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.10), transparent)" }}
        />

        {/* Header */}
        <div className="h-12 px-3 sm:px-4 flex items-center justify-between border-b border-white/10 bg-black/40 backdrop-blur-md">
          <div className="flex items-center gap-2 text-sm text-white/80">
            <div className="size-2 rounded-full bg-emerald-400" />
            Project • Demo
          </div>
          <div className="flex items-center gap-2 text-[11px] text-white/60">
            <div className="px-2 py-1 rounded-md bg-white/5 border border-white/10">Share</div>
            <div className="px-2 py-1 rounded-md bg-white/5 border border-white/10">Settings</div>
          </div>
        </div>

        {/* Model & agent selector bar + mobile tabs */}
        <div className="h-10 px-2 sm:px-3 flex items-center gap-2 sm:gap-3 border-b border-white/10 bg-black/30 backdrop-blur-md text-[11px] sm:text-[12px] text-white/70">
          <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-white/5 border border-white/10">
            <div className="size-4 rounded-full bg-white/20 ring-1 ring-inset ring-white/20" />
            <span>agent: Investigator</span>
          </div>
          <div className="px-2 py-1 rounded-md bg-white/5 border border-white/10">gpt-4o</div>
          <div className="px-2 py-1 rounded-md bg-white/5 border border-white/10">memory: on</div>
          <div className="px-2 py-1 rounded-md bg-white/5 border border-white/10">tools: web, files</div>
          {/* Mobile tab toggle */}
          <div className="ml-auto flex md:hidden items-center gap-1">
            <button
              onClick={() => setActiveTab("chat")}
              className={`px-2 py-1 rounded-md border ${
                activeTab === "chat" ? "bg-white/15 border-white/20 text-white" : "bg-white/5 border-white/10 text-white/70"
              }`}
            >
              Chat
            </button>
            <button
              onClick={() => setActiveTab("console")}
              className={`px-2 py-1 rounded-md border ${
                activeTab === "console" ? "bg-white/15 border-white/20 text-white" : "bg-white/5 border-white/10 text-white/70"
              }`}
            >
              Console
            </button>
          </div>
        </div>

        {/* Main split: left chat interface, right agent console (50/50 on md+, tabs on mobile) */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 h-[calc(100%-5.5rem)] md:h-[calc(100%-5.5rem)]">
          {/* Left: Chat interface */}
          <div className={`relative overflow-hidden bg-black/30 ${activeTab === "chat" ? "block" : "hidden md:block"}`}>
            {/* Messages area */}
            <div className="absolute inset-0 overflow-y-auto p-3 sm:p-4 pb-36 space-y-3">
              {messages.map((m) => (
                <Bubble key={m.id} sender={m.sender} id={m.id} linkedTools={m.linkedTools}>
                  {m.text}
                </Bubble>
              ))}

              {/* Assistant message with structured formatting */}
              <div className="max-w-2xl rounded-2xl bg-white/[0.06] border border-white/10 p-3 text-[13px] sm:text-sm text-white/90 space-y-2">
                <div className="leading-relaxed">Here’s what I can do next:</div>
                <ul className="list-disc pl-5 space-y-1 text-white/85">
                  <li>Pull full transaction history and cross-check onward transfers</li>
                  <li>Trace paths to labeled clusters (exchanges/mixers)</li>
                  <li>Generate evidence pack and freeze-request draft</li>
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
          </div>

          {/* Right: Agent console */}
          <div className={`relative md:border-l border-t md:border-t-0 border-white/10 bg-black/20 backdrop-blur-md ${activeTab === "console" ? "block" : "hidden md:block"}`}>
            {/* Title bar */}
            <div className="h-10 px-3 sm:px-4 flex items-center justify-between border-b border-white/10 text-sm text-white/80">
              <div>Xera's Console</div>
              <div className="size-6 rounded bg-white/10 grid place-items-center">×</div>
            </div>

            {/* Body: tool call timeline with stagger */}
            <div className="h-[calc(100%-5.5rem)] p-3 sm:p-4 overflow-y-auto space-y-3">
              <div className="text-xs text-white/70">Running • Tool calls</div>
              {timeline.map((t, idx) => (
                <motion.div
                  key={`${t.name}-${idx}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 * idx, duration: 0.35, ease: "easeOut" }}
                  className="rounded-lg border border-white/10 bg-white/[0.03] p-3"
                >
                  <div className="flex items-center justify-between text-xs text-white/85">
                    <div className="flex items-center gap-2">
                      <div className={`size-2 rounded-full ${t.color}`} /> {t.name}
                    </div>
                    <div className="text-white/60">{t.detail}</div>
                  </div>
                  <div className="mt-2 text-[12px] text-white/80">{t.desc}</div>
                  {/* Link back to message */}
                  {t.ref && (
                    <div className="mt-2 inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] bg-white/5 border border-white/10 text-white/70">
                      Ref: {t.ref}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Floating chips */}
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="absolute top-3 left-3 text-[11px] text-white/80 bg-white/5 border border-white/10 rounded-md px-2 py-1 backdrop-blur-sm"
            >
              Live session
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="absolute top-3 right-3 text-[11px] text-white/80 bg-white/5 border border-white/10 rounded-md px-2 py-1 backdrop-blur-sm"
            >
              Secure • Encrypted
            </motion.div>

            {/* Bottom controls */}
            <div className="h-12 px-3 sm:px-4 flex items-center justify-between border-t border-white/10 text-xs text-white/80">
              <div className="flex items-center gap-3">
                <div>{Math.round((progress / 100) * 29)}/29</div>
                <div className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                <div className="w-40 h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full rounded-full bg-white/50 transition-all" style={{ width: `${progress}%` }} />
                </div>
                {/* Typing indicator */}
                <div className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 border border-white/10 bg-white/5 text-[11px] text-white/70">
                  <div className="size-1.5 rounded-full bg-white/60 animate-pulse" />
                  <div className="size-1.5 rounded-full bg-white/60 animate-pulse [animation-delay:120ms]" />
                  <div className="size-1.5 rounded-full bg-white/60 animate-pulse [animation-delay:240ms]" />
                  <span className="ml-1">AI is drafting…</span>
                </div>
              </div>
              <div className="px-2 py-1 rounded-md bg-white/5 border border-white/10">Latest Tool</div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
