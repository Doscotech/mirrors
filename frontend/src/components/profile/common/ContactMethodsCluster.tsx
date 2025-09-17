"use client";
import React from 'react';

export interface ContactMethod {
  type: 'email' | 'phone' | 'chat' | 'video';
  value?: string;
  onPress?: () => void;
}

export interface ContactMethodsClusterProps {
  methods: ContactMethod[];
}

export function ContactMethodsCluster({ methods }: ContactMethodsClusterProps) {
  if (!methods.length) return <div className="flex gap-2 text-[10px] text-muted-foreground/50">No contact methods</div>;
  return (
    <div className="flex flex-wrap gap-2">
      {methods.map((m, i) => (
        <button
          key={i}
            onClick={m.onPress}
          className="h-8 w-8 rounded-full border border-muted/50 bg-muted/30 hover:bg-muted/50 flex items-center justify-center text-[11px]"
          aria-label={m.type}
        >
          {iconForType(m.type)}
        </button>
      ))}
    </div>
  );
}

function iconForType(type: ContactMethod['type']) {
  // Placeholder icons (unicode / minimal). Swap with lucide or custom set.
  switch (type) {
    case 'email': return '✉️';
    case 'phone': return '📞';
    case 'chat': return '💬';
    case 'video': return '📹';
    default: return '?';
  }
}

export default ContactMethodsCluster;
