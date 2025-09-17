"use client";
import React from 'react';

export interface FilterTimeframeControlsProps {
  statuses: string[];
  activeStatus: string;
  onStatusChange: (s: string) => void;
  months: Date[];
  activeMonth: Date;
  onMonthChange: (d: Date) => void;
}

export function FilterTimeframeControls({ statuses, activeStatus, onStatusChange, months, activeMonth, onMonthChange }: FilterTimeframeControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-[11px]">
      <div className="flex items-center gap-1">
        {statuses.map(s => (
          <button
            key={s}
            onClick={() => onStatusChange(s)}
            className={[
              'h-7 rounded-full px-3 font-medium transition-colors border',
              s === activeStatus ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted/40 hover:bg-muted/60 border-muted/50'
            ].join(' ')}
          >{s}</button>
        ))}
      </div>
      <div className="flex items-center gap-1 ml-auto">
        {months.map(m => {
          const label = m.toLocaleDateString(undefined,{ month:'short', year:'numeric'});
          const active = m.getMonth() === activeMonth.getMonth() && m.getFullYear() === activeMonth.getFullYear();
          return (
            <button
              key={label}
              onClick={() => onMonthChange(m)}
              className={[
                'h-7 rounded-full px-3 font-medium transition-colors border',
                active ? 'bg-secondary text-secondary-foreground border-secondary' : 'bg-muted/30 hover:bg-muted/50 border-muted/40'
              ].join(' ')}
            >{label}</button>
          );
        })}
      </div>
    </div>
  );
}

export default FilterTimeframeControls;
