# Agent Card Background Colors - Implementation Guide

## Current Card Design

### Overview
The agent cards in the Command Center (both "Explore" and "My Agents" pages) currently use a **unified white/neutral background** design with subtle gradients. The cards are rendered using the `UnifiedAgentCard` component located at:

```
frontend/src/components/ui/unified-agent-card.tsx
```

### Current Background Styling

**Standard Card Background (Line 432):**
```tsx
className={cn(
  'group relative bg-gradient-to-br from-card/95 to-card/50 backdrop-blur-sm rounded-3xl overflow-hidden transition-all duration-500 border cursor-pointer flex flex-col border-border/40 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1',
  className
)}
```

**Key Features:**
- **Base Color**: `bg-gradient-to-br from-card/95 to-card/50` - Creates a subtle gradient from card color to semi-transparent
- **Backdrop Blur**: `backdrop-blur-sm` - Adds a glass-morphism effect
- **Border**: `border-border/40` - Subtle border that becomes more prominent on hover (`hover:border-primary/40`)
- **Hover Effects**: 
  - Shadow: `hover:shadow-xl hover:shadow-primary/5`
  - Transform: `hover:-translate-y-1` (lifts card up)
  - Gradient overlay opacity changes (lines 569, 572)

### Current Card Variants

The `UnifiedAgentCard` component supports multiple variants:
- `marketplace` - Marketplace template cards (Explore tab)
- `template` - User template cards
- `agent` - User agent cards (My Agents tab)
- `onboarding` - Selection cards for onboarding
- `showcase` - Home page showcase
- `dashboard` - Dashboard quick access
- `compact` - Compact version

## How to Add Card Background Colors

### Option 1: Individual Card Colors (Data-Driven)

Add a `card_color` or `background_color` field to each agent's data and use it in the card styling.

#### Step 1: Update the BaseAgentData Interface

In `/Users/macbookpro/mirrors/frontend/src/components/ui/unified-agent-card.tsx` (around line 40):

```tsx
export interface BaseAgentData {
  id: string;
  name: string;
  description?: string;
  tags?: string[];
  created_at?: string;
  icon?: string;
  role?: string;
  capabilities?: string[];
  
  // Icon/avatar data
  icon_name?: string;
  icon_color?: string;
  icon_background?: string;
  
  // NEW: Card background color
  card_background?: string; // e.g., "purple", "blue", "green", "orange"
  
  // ... rest of the interface
}
```

#### Step 2: Create Color Mapping Utility

Add a color mapping function in the same file:

```tsx
// Color theme mapping - add after the BaseAgentData interface
const getCardColorClasses = (color?: string) => {
  const colorMap: Record<string, {
    base: string;
    hover: string;
    glow: string;
    border: string;
  }> = {
    purple: {
      base: 'from-purple-50/95 to-purple-100/50 dark:from-purple-950/95 dark:to-purple-900/50',
      hover: 'group-hover:from-purple-100/95 group-hover:to-purple-200/50 dark:group-hover:from-purple-900/95 dark:group-hover:to-purple-800/50',
      glow: 'from-purple-500/20 to-purple-400/5',
      border: 'border-purple-200/40 hover:border-purple-400/40 dark:border-purple-800/40 dark:hover:border-purple-600/40'
    },
    blue: {
      base: 'from-blue-50/95 to-blue-100/50 dark:from-blue-950/95 dark:to-blue-900/50',
      hover: 'group-hover:from-blue-100/95 group-hover:to-blue-200/50 dark:group-hover:from-blue-900/95 dark:group-hover:to-blue-800/50',
      glow: 'from-blue-500/20 to-blue-400/5',
      border: 'border-blue-200/40 hover:border-blue-400/40 dark:border-blue-800/40 dark:hover:border-blue-600/40'
    },
    green: {
      base: 'from-emerald-50/95 to-emerald-100/50 dark:from-emerald-950/95 dark:to-emerald-900/50',
      hover: 'group-hover:from-emerald-100/95 group-hover:to-emerald-200/50 dark:group-hover:from-emerald-900/95 dark:group-hover:to-emerald-800/50',
      glow: 'from-emerald-500/20 to-emerald-400/5',
      border: 'border-emerald-200/40 hover:border-emerald-400/40 dark:border-emerald-800/40 dark:hover:border-emerald-600/40'
    },
    orange: {
      base: 'from-orange-50/95 to-orange-100/50 dark:from-orange-950/95 dark:to-orange-900/50',
      hover: 'group-hover:from-orange-100/95 group-hover:to-orange-200/50 dark:group-hover:from-orange-900/95 dark:group-hover:to-orange-800/50',
      glow: 'from-orange-500/20 to-orange-400/5',
      border: 'border-orange-200/40 hover:border-orange-400/40 dark:border-orange-800/40 dark:hover:border-orange-600/40'
    },
    pink: {
      base: 'from-pink-50/95 to-pink-100/50 dark:from-pink-950/95 dark:to-pink-900/50',
      hover: 'group-hover:from-pink-100/95 group-hover:to-pink-200/50 dark:group-hover:from-pink-900/95 dark:group-hover:to-pink-800/50',
      glow: 'from-pink-500/20 to-pink-400/5',
      border: 'border-pink-200/40 hover:border-pink-400/40 dark:border-pink-800/40 dark:hover:border-pink-600/40'
    },
    cyan: {
      base: 'from-cyan-50/95 to-cyan-100/50 dark:from-cyan-950/95 dark:to-cyan-900/50',
      hover: 'group-hover:from-cyan-100/95 group-hover:to-cyan-200/50 dark:group-hover:from-cyan-900/95 dark:group-hover:to-cyan-800/50',
      glow: 'from-cyan-500/20 to-cyan-400/5',
      border: 'border-cyan-200/40 hover:border-cyan-400/40 dark:border-cyan-800/40 dark:hover:border-cyan-600/40'
    },
    amber: {
      base: 'from-amber-50/95 to-amber-100/50 dark:from-amber-950/95 dark:to-amber-900/50',
      hover: 'group-hover:from-amber-100/95 group-hover:to-amber-200/50 dark:group-hover:from-amber-900/95 dark:group-hover:to-amber-800/50',
      glow: 'from-amber-500/20 to-amber-400/5',
      border: 'border-amber-200/40 hover:border-amber-400/40 dark:border-amber-800/40 dark:hover:border-amber-600/40'
    },
    default: {
      base: 'from-card/95 to-card/50',
      hover: '',
      glow: 'from-primary/20 to-primary/5',
      border: 'border-border/40 hover:border-primary/40'
    }
  };
  
  return colorMap[color || 'default'] || colorMap.default;
};
```

#### Step 3: Update the renderStandardCard Function

Modify the `renderStandardCard` function (around line 430) to use the color:

```tsx
const renderStandardCard = () => {
  const colorClasses = getCardColorClasses(data.card_background);
  
  const cardClassName = cn(
    'group relative bg-gradient-to-br backdrop-blur-sm rounded-3xl overflow-hidden transition-all duration-500 border cursor-pointer flex flex-col',
    colorClasses.base,
    colorClasses.hover,
    colorClasses.border,
    'hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1',
    className
  );
  
  // ... rest of the function
  
  return (
    <div className={cardClassName} onClick={() => onClick?.(data)}>
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-primary/3 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
      
      {/* Glow effect - now uses color-specific glow */}
      <div className={cn(
        "absolute -inset-[1px] bg-gradient-to-br rounded-3xl opacity-0 group-hover:opacity-100 blur-sm transition-all duration-500 -z-10",
        colorClasses.glow
      )} />
      
      {/* ... rest of the card content */}
    </div>
  );
};
```

#### Step 4: Update Data Mapping

Update the data mapping in the components that use `UnifiedAgentCard`:

**In `marketplace-tab.tsx` (around line 170):**
```tsx
<UnifiedAgentCard
  key={item.id}
  variant="marketplace"
  data={{
    id: item.id,
    name: item.name,
    tags: item.tags,
    created_at: item.created_at,
    creator_id: item.creator_id,
    creator_name: item.creator_name,
    is_kortix_team: item.is_kortix_team,
    download_count: item.download_count,
    marketplace_published_at: item.marketplace_published_at,
    icon_name: item.icon_name,
    icon_color: item.icon_color,
    icon_background: item.icon_background,
    card_background: item.card_background, // NEW
  }}
  // ... rest of props
/>
```

**In `agents-grid.tsx` (around line 66):**
```tsx
const agentToCardData = (agent: Agent): import('@/components/ui/unified-agent-card').BaseAgentData => {
  return {
    id: agent.agent_id,
    agent_id: agent.agent_id,
    name: agent.name,
    // ... other fields
    card_background: agent.card_background, // NEW
  };
};
```

### Option 2: Tag-Based Automatic Colors

Automatically assign colors based on agent tags for a more dynamic experience.

#### Implementation:

Add a function to determine color from tags:

```tsx
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
    'finance': 'emerald',
  };
  
  // Find first matching tag
  for (const tag of tags) {
    const lowerTag = tag.toLowerCase();
    for (const [key, color] of Object.entries(tagColorMap)) {
      if (lowerTag.includes(key)) {
        return color;
      }
    }
  }
  
  // Fallback: use hash of first tag for consistent color
  const hash = tags[0].split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colors = ['purple', 'blue', 'green', 'orange', 'pink', 'cyan', 'amber'];
  return colors[hash % colors.length];
};
```

Then use it in the card:

```tsx
const renderStandardCard = () => {
  const cardColor = data.card_background || getColorFromTags(data.tags);
  const colorClasses = getCardColorClasses(cardColor);
  
  // ... rest of the function
};
```

### Option 3: Random Colors for Visual Variety

For a more playful design, assign random (but consistent) colors based on agent ID:

```tsx
const getColorFromId = (id: string): string => {
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colors = ['purple', 'blue', 'green', 'orange', 'pink', 'cyan', 'amber'];
  return colors[hash % colors.length];
};
```

## Backend Changes (If Storing Colors)

If you want to store the card background color in the database:

### 1. Add Migration

Create a new migration file in `backend/supabase/migrations/`:

```sql
-- Add card_background column to agents table
ALTER TABLE agents 
ADD COLUMN IF NOT EXISTS card_background TEXT;

-- Add card_background column to marketplace_templates table
ALTER TABLE marketplace_templates 
ADD COLUMN IF NOT EXISTS card_background TEXT;

-- Add check constraint for valid colors
ALTER TABLE agents
ADD CONSTRAINT valid_card_background 
CHECK (card_background IN ('purple', 'blue', 'green', 'orange', 'pink', 'cyan', 'amber', NULL));

ALTER TABLE marketplace_templates
ADD CONSTRAINT valid_card_background 
CHECK (card_background IN ('purple', 'blue', 'green', 'orange', 'pink', 'cyan', 'amber', NULL));
```

### 2. Update TypeScript Types

In your agent type definitions, add:

```typescript
interface Agent {
  // ... existing fields
  card_background?: string;
}

interface MarketplaceTemplate {
  // ... existing fields
  card_background?: string;
}
```

## Recommended Approach

**I recommend Option 2 (Tag-Based Automatic Colors)** because:

1. ✅ **No database changes required** - Works immediately
2. ✅ **Automatic** - No manual color selection needed
3. ✅ **Consistent** - Same tags = same colors
4. ✅ **Visual variety** - Different categories get different colors
5. ✅ **Better UX** - Users can visually distinguish agent types at a glance

Later, you can add Option 1 to allow manual color override if needed.

## Preview of Color Schemes

```
Purple:  Tech/Code agents       (from-purple-50 to-purple-100)
Blue:    Productivity agents    (from-blue-50 to-blue-100)
Green:   Support agents         (from-emerald-50 to-emerald-100)
Orange:  Sales/Marketing        (from-orange-50 to-orange-100)
Pink:    Design agents          (from-pink-50 to-pink-100)
Cyan:    Data/Analytics         (from-cyan-50 to-cyan-100)
Amber:   Writing/Content        (from-amber-50 to-amber-100)
```

All colors have dark mode variants that work seamlessly with your existing theme.

## Testing

After implementing, test with:
1. Light and dark modes
2. Different screen sizes
3. Hover states
4. Multiple cards side by side
5. Long agent names and descriptions

## Files to Modify

1. **Primary**: `/Users/macbookpro/mirrors/frontend/src/components/ui/unified-agent-card.tsx`
2. **Secondary** (if needed): 
   - `/Users/macbookpro/mirrors/frontend/src/components/agents/custom-agents-page/marketplace-tab.tsx`
   - `/Users/macbookpro/mirrors/frontend/src/components/agents/agents-grid.tsx`
