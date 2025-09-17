"use client";
import React, { useMemo } from 'react';

export interface MiniCalendarEvent {
  id: string;
  date: string; // ISO
  label?: string;
  color?: string; // tailwind color class or hex
}

export interface MiniCalendarProps {
  month: Date; // any day in target month
  selected?: Date | null;
  events?: MiniCalendarEvent[];
  onSelect?: (date: Date) => void;
}

export function MiniCalendar({ month, selected, events = [], onSelect }: MiniCalendarProps) {
  const start = new Date(month.getFullYear(), month.getMonth(), 1);
  const firstDay = start.getDay();
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells = useMemo(() => {
    const arr: (Date | null)[] = [];
    for (let i = 0; i < firstDay; i++) arr.push(null);
    for (let d = 1; d <= daysInMonth; d++) arr.push(new Date(month.getFullYear(), month.getMonth(), d));
    return arr;
  }, [firstDay, daysInMonth, month]);

  const eventMap = useMemo(() => {
    const map: Record<string, MiniCalendarEvent[]> = {};
    for (const e of events) {
      const key = e.date.split('T')[0];
      map[key] = map[key] || [];
      map[key].push(e);
    }
    return map;
  }, [events]);

  return (
    <div className="text-[10px] select-none">
      <div className="grid grid-cols-7 gap-1 mb-1 text-muted-foreground/70">
        {['S','M','T','W','T','F','S'].map(d => <div key={d} className="text-center py-1">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d,i) => {
          if (!d) return <div key={i} className="h-8" />;
          const key = d.toISOString().split('T')[0];
          const evts = eventMap[key] || [];
          const isSelected = selected && d.toDateString() === selected.toDateString();
          const isToday = new Date().toDateString() === d.toDateString();
          return (
            <button
              key={i}
              onClick={() => onSelect?.(d)}
              className={[
                'relative h-8 rounded-md flex items-center justify-center font-medium transition-colors',
                'hover:bg-muted/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                isSelected ? 'bg-primary text-primary-foreground' : isToday ? 'bg-primary/10 text-primary' : 'bg-muted/30'
              ].join(' ')}
              aria-label={d.toDateString()}
            >
              <span className="text-[11px] leading-none">{d.getDate()}</span>
              {evts.length > 0 && (
                <span className="absolute -bottom-0.5 inset-x-0 mx-auto flex gap-[2px] justify-center">
                  {evts.slice(0,3).map(e => <span key={e.id} className={"w-1.5 h-1.5 rounded-full " + (e.color || 'bg-indigo-500')} />)}
                  {evts.length > 3 && <span className="text-[8px] text-muted-foreground/70">+{evts.length-3}</span>}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default MiniCalendar;
