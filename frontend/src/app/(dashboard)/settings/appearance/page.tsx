'use client';
import React, { useEffect } from 'react';

function AppearanceControls() {
  const [theme, setThemeState] = React.useState<string>(() => typeof window !== 'undefined' ? (localStorage.getItem('ui-theme') || 'system') : 'system');
  const [density, setDensity] = React.useState<string>(() => typeof window !== 'undefined' ? (localStorage.getItem('ui-density') || 'comfortable') : 'comfortable');
  useEffect(() => { if (typeof document !== 'undefined') { document.documentElement.dataset.theme = theme; localStorage.setItem('ui-theme', theme); }}, [theme]);
  useEffect(() => { if (typeof document !== 'undefined') { document.documentElement.dataset.density = density; localStorage.setItem('ui-density', density); }}, [density]);
  const themeOptions = ['system','light','dark'];
  const densityOptions = ['comfortable','compact'];
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-3 border rounded-md p-4 bg-muted/20">
        <div>
          <h3 className="text-sm font-medium">Theme</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">Choose light / dark or follow OS.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {themeOptions.map(opt => (
            <button key={opt} onClick={()=>setThemeState(opt)} className={`h-8 px-3 text-xs rounded border transition ${theme===opt? 'bg-primary text-primary-foreground border-primary':'bg-background hover:bg-muted border-muted'}`}>{opt}</button>
          ))}
        </div>
      </div>
      <div className="space-y-3 border rounded-md p-4 bg-muted/20">
        <div>
          <h3 className="text-sm font-medium">Density</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">Adjust spacing in interactive surfaces.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {densityOptions.map(opt => (
            <button key={opt} onClick={()=>setDensity(opt)} className={`h-8 px-3 text-xs rounded border transition ${density===opt? 'bg-secondary text-secondary-foreground border-secondary':'bg-background hover:bg-muted border-muted'}`}>{opt}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AppearanceSettingsPage() {
  return (
    <div className="py-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">Appearance</h1>
        <p className="text-sm text-muted-foreground">Theme & interface preferences.</p>
      </header>
      <AppearanceControls />
    </div>
  );
}
