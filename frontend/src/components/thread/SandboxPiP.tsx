"use client";
import React, { useEffect, useRef, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSandboxViewStore } from '@/lib/stores/sandbox-view-store';
import { cn } from '@/lib/utils';

interface StatusBadgeProps { status: string }
const SandboxStatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config: Record<string, { label: string; className: string }> = {
    connecting: { label: 'CONNECTING', className: 'bg-amber-500/90 text-white animate-pulse' },
    running: { label: 'RUNNING', className: 'bg-emerald-600 text-white' },
    error: { label: 'ERROR', className: 'bg-red-600 text-white' },
    failed: { label: 'FAILED', className: 'bg-red-600 text-white' },
  };
  const cfg = config[status] || { label: status.toUpperCase(), className: 'bg-zinc-500 text-white' };
  return (
    <span
      className={cn('text-[10px] px-1.5 py-0.5 rounded tracking-wide font-medium select-none', cfg.className)}
      data-sandbox-status={status}
    >
      {cfg.label}
    </span>
  );
};

interface SandboxPiPProps {
  children: React.ReactNode;
  title?: string;
  agentStatus?: string; // 'idle' | 'connecting' | 'running' | 'error' | 'failed'
}

export const SandboxPiP: React.FC<SandboxPiPProps> = ({ children, title = 'Agent Sandbox', agentStatus }) => {
  const { mode, pipPosition, pipSize, setPipPosition, setPipSize, setMode, markDismissed } = useSandboxViewStore();
  const [justMounted, setJustMounted] = useState(true);
  const lastCustomSizeRef = useRef<{ width: number; height: number } | null>(null);
  const dragEndRef = useRef<number>(0);
  const ref = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ dragging: boolean; startX: number; startY: number; origX: number; origY: number }>({ dragging: false, startX: 0, startY: 0, origX: 0, origY: 0 });
  const resizeRef = useRef<{ resizing: boolean; startX: number; startY: number; origW: number; origH: number }>({ resizing: false, startX: 0, startY: 0, origW: 0, origH: 0 });

  const clampWithinViewport = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const maxX = vw - pipSize.width - 8; // 8px margin
    const maxY = vh - pipSize.height - 8;
    let { x, y } = pipPosition;
    if (x > maxX) x = maxX; if (y > maxY) y = maxY;
    if (x < 8) x = 8; if (y < 8) y = 8;
    if (x !== pipPosition.x || y !== pipPosition.y) setPipPosition({ x, y });
  }, [pipPosition, pipSize.width, pipSize.height, setPipPosition]);

  useEffect(() => {
    if (mode !== 'pip') return;

    function onMouseDown(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-pip-drag]')) return;
      dragRef.current.dragging = true;
      dragRef.current.startX = e.clientX;
      dragRef.current.startY = e.clientY;
      dragRef.current.origX = pipPosition.x;
      dragRef.current.origY = pipPosition.y;
      e.preventDefault();
    }
    function onMouseMove(e: MouseEvent) {
      if (!dragRef.current.dragging) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      setPipPosition({ x: dragRef.current.origX + dx, y: dragRef.current.origY + dy });
    }
    function onMouseUp() {
      if (dragRef.current.dragging) {
        dragRef.current.dragging = false;
        dragEndRef.current = Date.now();
        // Snap to edge if near
        requestAnimationFrame(() => edgeSnap());
      }
    }

    function onResizeMouseDown(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-pip-resize]')) return;
      resizeRef.current.resizing = true;
      resizeRef.current.startX = e.clientX;
      resizeRef.current.startY = e.clientY;
      resizeRef.current.origW = pipSize.width;
      resizeRef.current.origH = pipSize.height;
      e.preventDefault();
    }
    function onResizeMouseMove(e: MouseEvent) {
      if (!resizeRef.current.resizing) return;
      const dx = e.clientX - resizeRef.current.startX;
      const dy = e.clientY - resizeRef.current.startY;
      const nextW = Math.min(Math.max(260, resizeRef.current.origW + dx), 900);
      const nextH = Math.min(Math.max(180, resizeRef.current.origH + dy), 700);
      setPipSize({ width: nextW, height: nextH });
    }
  function onResizeMouseUp() { resizeRef.current.resizing = false; }

    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousedown', onResizeMouseDown);
    window.addEventListener('mousemove', onResizeMouseMove);
    window.addEventListener('mouseup', onResizeMouseUp);
    window.addEventListener('resize', clampWithinViewport);
    return () => {
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousedown', onResizeMouseDown);
      window.removeEventListener('mousemove', onResizeMouseMove);
      window.removeEventListener('mouseup', onResizeMouseUp);
      window.removeEventListener('resize', clampWithinViewport);
    };
  }, [mode, pipPosition.x, pipPosition.y, pipSize.width, pipSize.height, setPipPosition, setPipSize, clampWithinViewport]);

  // Re-clamp when size changes
  useEffect(() => { if (mode === 'pip') clampWithinViewport(); }, [pipSize.width, pipSize.height, mode, clampWithinViewport]);

  // Edge snapping logic
  const edgeSnap = useCallback(() => {
    const margin = 16;
    const threshold = 120; // distance within which to snap
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const candidates = [
      { x: margin, y: margin }, // TL
      { x: vw - pipSize.width - margin, y: margin }, // TR
      { x: margin, y: vh - pipSize.height - margin }, // BL
      { x: vw - pipSize.width - margin, y: vh - pipSize.height - margin }, // BR
    ];
    let best = { x: pipPosition.x, y: pipPosition.y };
    let bestDist = Infinity;
    for (const c of candidates) {
      const dx = c.x - pipPosition.x;
      const dy = c.y - pipPosition.y;
      const d = Math.hypot(dx, dy);
      if (d < bestDist) { bestDist = d; best = c; }
    }
    if (bestDist <= threshold) {
      setPipPosition(best);
    }
  }, [pipPosition, pipSize.width, pipSize.height, setPipPosition]);

  // Double click header to toggle size preset
  const handleHeaderDoubleClick = useCallback(() => {
    // If current size is small preset, restore last custom or go large
    const small = { width: 420, height: 260 };
    const large = { width: 720, height: 480 };
    const isSmall = Math.abs(pipSize.width - small.width) < 4 && Math.abs(pipSize.height - small.height) < 4;
    const isLarge = Math.abs(pipSize.width - large.width) < 4 && Math.abs(pipSize.height - large.height) < 4;
    if (isSmall) {
      // Go large, remember nothing
      lastCustomSizeRef.current = small;
      setPipSize(large);
    } else if (isLarge) {
      // Return to last custom if present, else small
      setPipSize(lastCustomSizeRef.current || small);
      lastCustomSizeRef.current = large;
    } else {
      // Save current as custom then go small
      lastCustomSizeRef.current = { ...pipSize };
      setPipSize(small);
    }
  }, [pipSize, setPipSize]);

  // Keyboard shortcut (Cmd/Ctrl+Shift+P) to toggle PiP
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!(e.shiftKey && (e.metaKey || e.ctrlKey))) return;
      if (e.key.toLowerCase() !== 'p') return;
      e.preventDefault();
      if (mode === 'pip') {
        markDismissed();
        setMode('docked');
      } else {
        setMode('pip');
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mode, setMode, markDismissed]);

  useEffect(() => {
    if (mode === 'pip') {
      setJustMounted(true);
      const t = requestAnimationFrame(() => setJustMounted(false));
      return () => cancelAnimationFrame(t);
    }
  }, [mode]);

  if (mode !== 'pip') return null;

  return createPortal(
    <div
      ref={ref}
      role="dialog"
      aria-label="Agent environment viewer"
      className={cn(
        'fixed z-[1200] rounded-md border bg-background overflow-hidden group select-none',
        'transition-all will-change-transform',
        'shadow-[0_8px_28px_-6px_rgba(0,0,0,0.35),0_2px_6px_-1px_rgba(0,0,0,0.25)]',
        justMounted ? 'animate-pip-in' : 'animate-none'
      )}
      style={{
        width: pipSize.width,
        height: pipSize.height,
        transform: `translate3d(${pipPosition.x}px, ${pipPosition.y}px, 0)`
      }}
    >
      <div
        data-pip-drag
        onDoubleClick={handleHeaderDoubleClick}
        className="h-7 flex items-center justify-between px-2 bg-muted/70 backdrop-blur-sm cursor-move text-xs gap-2 relative"
      >
        <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-medium truncate" title={title}>{title}</span>
          {agentStatus && agentStatus !== 'idle' && (
            <SandboxStatusBadge status={agentStatus} />
          )}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setMode('docked')}
            className="hover:text-primary outline-none focus-visible:ring"
            aria-label="Return to docked view"
            type="button"
          >⤢</button>
          <button
            onClick={() => { markDismissed(); setMode('docked'); }}
            className="hover:text-destructive outline-none focus-visible:ring"
            aria-label="Close PiP"
            type="button"
          >✕</button>
        </div>
      </div>
      <div className="w-full h-[calc(100%-1.75rem)] bg-black/90 relative">
        {children}
        <div
          data-pip-resize
          className="absolute right-0 bottom-0 w-3 h-3 cursor-se-resize opacity-80 hover:opacity-100 after:content-[''] after:block after:w-full after:h-full after:bg-[linear-gradient(135deg,transparent_50%,theme(colors.emerald.500)_51%)]"
          aria-label="Resize sandbox window"
          role="presentation"
        />
      </div>
    </div>,
    document.body
  );
};

// (StatusBadge component moved above for declaration order)
// Local styles for animation
// Using a style tag here keeps component self-contained
if (typeof document !== 'undefined' && !document.getElementById('pip-anim-styles')) {
  const style = document.createElement('style');
  style.id = 'pip-anim-styles';
  style.textContent = `@keyframes pipIn{0%{opacity:0;transform:scale(.85) translate3d(var(--pip-x,0),var(--pip-y,0),0)}70%{opacity:1;}100%{opacity:1;transform:scale(1) translate3d(var(--pip-x,0),var(--pip-y,0),0)}}.animate-pip-in{animation:pipIn .26s cubic-bezier(.32,.72,.33,1)} `;
  document.head.appendChild(style);
}
