"use client";
import React from 'react';

export interface MeetingSlot {
  id: string;
  label: string; // e.g. "10:30 AM"
  available: boolean;
}

export interface MeetingSlotsSelectorProps {
  date: Date;
  slots: MeetingSlot[];
  onSelect: (slotId: string) => void;
}

export function MeetingSlotsSelector({ date, slots, onSelect }: MeetingSlotsSelectorProps) {
  return (
    <div className="space-y-2" aria-label="Meeting slots" role="group">
      <div className="flex items-center justify-between text-[11px] text-muted-foreground/70">
        <span>{date.toLocaleDateString(undefined,{ month:'long', day:'numeric', year:'numeric'})}</span>
        <button className="px-2 py-1 rounded bg-muted/40 hover:bg-muted/60 text-[10px]" aria-label="Change date">⋯</button>
      </div>
      <div className="flex flex-wrap gap-2">
        {slots.length === 0 && <span className="text-[10px] text-muted-foreground/50">No slots</span>}
        {slots.map(s => (
          <button
            key={s.id}
            onClick={() => s.available && onSelect(s.id)}
            disabled={!s.available}
            className={[
              'h-7 px-3 rounded-full text-[10px] font-medium border transition-colors',
              s.available ? 'bg-secondary/40 hover:bg-secondary/60 text-secondary-foreground border-secondary/50' : 'bg-muted/30 text-muted-foreground border-muted/40 cursor-not-allowed'
            ].join(' ')}
          >{s.label}</button>
        ))}
      </div>
    </div>
  );
}

export default MeetingSlotsSelector;
