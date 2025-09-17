'use client';
import React from 'react';
import dynamic from 'next/dynamic';

const FullCreds = dynamic(() => import('./page').then(m => m.default || m).catch(()=>Promise.resolve(()=>null)), { ssr:false });

export default function EmbeddedCredentials() {
  return (
    <div className="border rounded-md p-4 bg-muted/20">
      <FullCreds />
    </div>
  );
}
