'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function CardUnicornOverlay({ active }: { active: boolean }) {
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [flash, setFlash] = React.useState(0);

  React.useEffect(() => {
    if (!active || prefersReducedMotion) return;
    let mounted = true;
    const doFlash = () => {
      const delay = 600 + Math.random() * 1000;
      setTimeout(() => {
        if (!mounted) return;
        const flashes = Math.random() > 0.6 ? 2 + Math.floor(Math.random() * 2) : 1;
        let i = 0;
        const run = () => {
          setFlash((f) => f + 1);
          i += 1;
          if (i < flashes) setTimeout(run, 60 + Math.random() * 90);
          else doFlash();
        };
        run();
      }, delay);
    };
    doFlash();
    return () => { mounted = false; };
  }, [active, prefersReducedMotion]);

  if (!active) return null;

  return (
    <div aria-hidden className="absolute inset-0 pointer-events-none z-0">
      {[0,1].map((layer) => (
        <motion.div
          key={`${flash}-${layer}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: flash ? [0, 0.6 - layer*0.2, 0] : 0 }}
          transition={{ duration: 0.18 + layer*0.06, times: [0, 0.4, 1], ease: 'easeOut' }}
          className="absolute inset-0 mix-blend-screen"
          style={{ background: layer === 0 ? 'linear-gradient(180deg, rgba(255,255,255,0.6), transparent)' : 'rgba(96,165,250,0.06)', filter: `blur(${6 + layer*6}px)` }}
        />
      ))}
    </div>
  );
}
