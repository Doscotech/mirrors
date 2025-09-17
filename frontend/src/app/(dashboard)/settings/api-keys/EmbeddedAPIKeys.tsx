'use client';
import React from 'react';
import dynamic from 'next/dynamic';

// Import the existing heavy page dynamically to reuse logic without full page chrome.
const Full = dynamic(() => import('./page').then(m => m.default || m).catch(()=>Promise.resolve(()=>null)), { ssr:false });

export default function EmbeddedAPIKeys() {
  return (
    <div className="border rounded-md p-4 bg-muted/20">
      <Full />
    </div>
  );
}
