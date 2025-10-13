'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';

// Lightweight loader for UnicornStudio script (copied pattern)
function useUnicornScript(version = '1.4.25') {
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const scriptUrl = `https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v${version}/dist/unicornStudio.umd.js`;
    const existing = document.querySelector(`script[src="${scriptUrl}"]`) as HTMLScriptElement | null;
    if (existing) {
      if ((window as any).UnicornStudio) setIsLoaded(true);
      else existing.addEventListener('load', () => setIsLoaded(true));
      return;
    }

    const script = document.createElement('script');
    script.src = scriptUrl;
    script.async = true;
    script.onload = () => setIsLoaded(true);
    script.onerror = () => console.error('Failed to load UnicornStudio script');
    document.body.appendChild(script);

    return () => {
      // keep the script in DOM to avoid double-loading across components
    };
  }, [version]);

  return { isLoaded, UnicornStudio: (window as any).UnicornStudio as any };
}

export function UnicornLightning({
  projectId = 'Gr1LmwbKSeJOXhpYEdit',
  minWidth = 900,
  className,
  simulateHover = false,
}: {
  projectId?: string;
  minWidth?: number; // only initialize scene on wider screens by default
  className?: string;
  simulateHover?: boolean; // if true, overlay animations run even without actual hover
}) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [visible, setVisible] = useState(false);
  const sceneRef = useRef<any | null>(null);
  const { isLoaded, UnicornStudio } = useUnicornScript();

  // Lightning state
  const [flash, setFlash] = useState(0);

  useEffect(() => {
  // If simulateHover is set we intentionally show the overlay for header-like effects
  if (!isDark) return;
  if (typeof window === 'undefined') return;
  if (prefersReducedMotion) return;
  if (!simulateHover && window.innerWidth < minWidth) return;

    let cancelled = false;

    const init = async () => {
      try {
        const scenes = await UnicornStudio?.init?.({ scale: 1, dpi: 1.2 });
        // try to find any scene that contains our project container
        const container = document.querySelector(`[data-us-project="${projectId}"]`);
        const ourScene = scenes?.find((s: any) => s.element === container || (s.element && container && s.element.contains(container)));
        if (ourScene) {
          sceneRef.current = ourScene;
          if (!cancelled) setVisible(true);
        } else {
          if (!cancelled) setVisible(true);
        }
      } catch (e) {
        console.error('Unicorn init failed', e);
        if (!cancelled) setVisible(true);
      }
    };

    void init();

    return () => {
      cancelled = true;
      try {
        if (sceneRef.current?.destroy) sceneRef.current.destroy();
      } catch (e) {}
      sceneRef.current = null;
    };
  }, [isLoaded, UnicornStudio, isDark, prefersReducedMotion, minWidth, projectId]);

  useEffect(() => {
    if (!visible || prefersReducedMotion) return;
    let mounted = true;
    // Randomized lightning flashes
    const doFlash = () => {
      // random delay between 4-12s
      const delay = 3000 + Math.random() * 9000;
      setTimeout(() => {
        if (!mounted) return;
        // cause a short sequence of flashes
        const flashes = Math.random() > 0.6 ? 2 + Math.floor(Math.random() * 3) : 1;
        let i = 0;
        const run = () => {
          setFlash((f) => f + 1);
          i += 1;
          if (i < flashes) setTimeout(run, 80 + Math.random() * 120);
          else doFlash();
        };
        run();
      }, delay);
    };

    doFlash();

    return () => { mounted = false; };
  }, [visible, prefersReducedMotion]);

  // If not dark or script not loaded and reduced-motion or small screen, render nothing
  if (!isDark) return null;

  return (
    <div aria-hidden className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Scene container - allow UnicornStudio to mount here if present */}
      <div data-us-project={projectId} className="absolute inset-0 w-full h-[calc(100vh+80px)]" style={{ backgroundColor: 'transparent' }} />

      {/* Lightning overlay - sits above the scene but behind content (z index 10, content should be z-20) */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {/* multiple flashes layered to give variety */}
        {[0,1,2].map((layer) => {
          const key = `${flash}-${layer}`;
          const delay = layer * 60;
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0 }}
              animate={{ opacity: flash ? [0, 0.85 - layer*0.25, 0] : 0 }}
              transition={{ duration: 0.25 + layer*0.05, times: [0, 0.35, 1], ease: 'easeOut', delay }}
              className="absolute inset-0 bg-white/70 mix-blend-screen"
              style={{ filter: `blur(${10 + layer * 6}px)`, pointerEvents: 'none' }}
            />
          );
        })}

        {/* occasional blue tint flash */}
        <motion.div
          key={`blue-${flash}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: flash ? [0, 0.45, 0] : 0 }}
          transition={{ duration: 0.35, times: [0, 0.4, 1], ease: 'easeOut' }}
          className="absolute inset-0 bg-blue-300/30 mix-blend-screen"
          style={{ filter: 'blur(80px)', pointerEvents: 'none' }}
        />
      </div>
    </div>
  );
}

export default UnicornLightning;
