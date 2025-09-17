// Profile design tokens (scaffold)
// Central place for surface radii, spacing, shadows, color scales used across the modern profile UI.

export const profileRadii = {
  hero: '1.25rem',
  panel: '1rem',
  card: '0.75rem',
  pill: '999px'
};

export const profileSpacing = {
  s1: '0.25rem',
  s2: '0.5rem',
  s3: '0.75rem',
  s4: '1rem',
  s5: '1.25rem',
  s6: '1.5rem'
};

export const profileShadows = {
  panel: '0 4px 12px -4px rgba(0,0,0,0.12), 0 2px 4px -2px rgba(0,0,0,0.08)',
  card: '0 2px 4px -2px rgba(0,0,0,0.10), 0 1px 2px -1px rgba(0,0,0,0.06)'
};

// Color schemes for project / category cards. Each provides background + border + accent utilities.
export const profileColorSchemes = {
  yellow: {
    bg: 'bg-amber-50 dark:bg-amber-500/10',
    border: 'border-amber-200/70 dark:border-amber-400/30',
    accentBar: 'bg-amber-400 dark:bg-amber-300',
    text: 'text-amber-800 dark:text-amber-200'
  },
  blue: {
    bg: 'bg-sky-50 dark:bg-sky-500/10',
    border: 'border-sky-200/70 dark:border-sky-400/30',
    accentBar: 'bg-sky-500 dark:bg-sky-300',
    text: 'text-sky-800 dark:text-sky-200'
  },
  rose: {
    bg: 'bg-rose-50 dark:bg-rose-500/10',
    border: 'border-rose-200/70 dark:border-rose-400/30',
    accentBar: 'bg-rose-500 dark:bg-rose-300',
    text: 'text-rose-800 dark:text-rose-200'
  },
  emerald: {
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    border: 'border-emerald-200/70 dark:border-emerald-400/30',
    accentBar: 'bg-emerald-500 dark:bg-emerald-300',
    text: 'text-emerald-800 dark:text-emerald-200'
  }
} as const;

export type ProfileColorSchemeKey = keyof typeof profileColorSchemes;

export const profileAnimation = {
  panelEntrance: 'animate-profile-panel',
  fadeIn: 'animate-profile-fade'
};

// Utility to clamp progress into [0,1]
export function clampProgress(value: number | null | undefined) {
  if (typeof value !== 'number' || isNaN(value)) return 0;
  return Math.min(1, Math.max(0, value));
}
