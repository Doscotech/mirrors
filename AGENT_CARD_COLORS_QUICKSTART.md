# Agent Card Colors - Quick Implementation

## Current Design
- **All cards have white/neutral backgrounds** with subtle gradients
- Located in: `frontend/src/components/ui/unified-agent-card.tsx`
- Current background: `bg-gradient-to-br from-card/95 to-card/50`

## Quick Add Color (Tag-Based) - 5 Minutes

### Step 1: Add Color Mapping Function

In `unified-agent-card.tsx`, add after line 105 (after BaseAgentData interface):

```tsx
// Color theme mapping based on tags
const getColorFromTags = (tags?: string[]): string => {
  if (!tags || tags.length === 0) return 'default';
  
  const tagColorMap: Record<string, string> = {
    'productivity': 'blue',
    'code': 'purple',
    'writing': 'amber',
    'data': 'cyan',
    'design': 'pink',
    'sales': 'orange',
    'support': 'green',
    'research': 'purple',
    'marketing': 'orange',
  };
  
  for (const tag of tags) {
    const lowerTag = tag.toLowerCase();
    for (const [key, color] of Object.entries(tagColorMap)) {
      if (lowerTag.includes(key)) return color;
    }
  }
  
  // Consistent fallback color from tag hash
  const hash = tags[0].split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colors = ['purple', 'blue', 'green', 'orange', 'pink', 'cyan', 'amber'];
  return colors[hash % colors.length];
};

const getCardColorClasses = (color: string) => {
  const colorMap = {
    purple: {
      bg: 'from-purple-50/95 to-purple-100/50 dark:from-purple-950/95 dark:to-purple-900/50',
      border: 'border-purple-200/40 hover:border-purple-400/40 dark:border-purple-800/40',
      glow: 'from-purple-500/20 to-purple-400/5',
    },
    blue: {
      bg: 'from-blue-50/95 to-blue-100/50 dark:from-blue-950/95 dark:to-blue-900/50',
      border: 'border-blue-200/40 hover:border-blue-400/40 dark:border-blue-800/40',
      glow: 'from-blue-500/20 to-blue-400/5',
    },
    green: {
      bg: 'from-emerald-50/95 to-emerald-100/50 dark:from-emerald-950/95 dark:to-emerald-900/50',
      border: 'border-emerald-200/40 hover:border-emerald-400/40 dark:border-emerald-800/40',
      glow: 'from-emerald-500/20 to-emerald-400/5',
    },
    orange: {
      bg: 'from-orange-50/95 to-orange-100/50 dark:from-orange-950/95 dark:to-orange-900/50',
      border: 'border-orange-200/40 hover:border-orange-400/40 dark:border-orange-800/40',
      glow: 'from-orange-500/20 to-orange-400/5',
    },
    pink: {
      bg: 'from-pink-50/95 to-pink-100/50 dark:from-pink-950/95 dark:to-pink-900/50',
      border: 'border-pink-200/40 hover:border-pink-400/40 dark:border-pink-800/40',
      glow: 'from-pink-500/20 to-pink-400/5',
    },
    cyan: {
      bg: 'from-cyan-50/95 to-cyan-100/50 dark:from-cyan-950/95 dark:to-cyan-900/50',
      border: 'border-cyan-200/40 hover:border-cyan-400/40 dark:border-cyan-800/40',
      glow: 'from-cyan-500/20 to-cyan-400/5',
    },
    amber: {
      bg: 'from-amber-50/95 to-amber-100/50 dark:from-amber-950/95 dark:to-amber-900/50',
      border: 'border-amber-200/40 hover:border-amber-400/40 dark:border-amber-800/40',
      glow: 'from-amber-500/20 to-amber-400/5',
    },
    default: {
      bg: 'from-card/95 to-card/50',
      border: 'border-border/40 hover:border-primary/40',
      glow: 'from-primary/20 to-primary/5',
    }
  };
  
  return colorMap[color as keyof typeof colorMap] || colorMap.default;
};
```

### Step 2: Update renderStandardCard Function

Replace line 432-434 with:

```tsx
const renderStandardCard = () => {
  const cardColor = getColorFromTags(data.tags);
  const colorClasses = getCardColorClasses(cardColor);
  
  const cardClassName = cn(
    'group relative bg-gradient-to-br backdrop-blur-sm rounded-3xl overflow-hidden transition-all duration-500 border cursor-pointer flex flex-col hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1',
    colorClasses.bg,
    colorClasses.border,
    className
  );
```

And update line 572 (glow effect) to:

```tsx
<div className={cn(
  "absolute -inset-[1px] bg-gradient-to-br rounded-3xl opacity-0 group-hover:opacity-100 blur-sm transition-all duration-500 -z-10",
  colorClasses.glow
)} />
```

## Result

- Cards with **"code"** tags → Purple background
- Cards with **"productivity"** tags → Blue background  
- Cards with **"sales"** tags → Orange background
- Cards with **"support"** tags → Green background
- Cards with **"design"** tags → Pink background
- Cards with **"data"** tags → Cyan background
- Cards with **"writing"** tags → Amber background
- Cards with no matching tags → Random consistent color

## Before & After

**Before:**
```
All cards: white/neutral gradient background
```

**After:**
```
Code Agent      → Soft purple tint
Sales Agent     → Soft orange tint
Support Agent   → Soft green tint
(etc.)
```

Colors are **subtle and professional** - using 50/100 opacity variants that work in both light and dark modes.

## Test It

```bash
cd frontend
npm run dev
```

Navigate to `/agents` and check the Explore and My Agents tabs!
