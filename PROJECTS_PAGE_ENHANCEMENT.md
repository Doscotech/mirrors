# Projects Page Thread Display Enhancement

## Overview
This document outlines the proposed changes to enhance the projects page on the frontend by adding a vertical list view option alongside the existing grid view, and improving thread sorting to prioritize recently interacted threads.

## Current Implementation
- **Layout**: Threads are displayed in a responsive grid layout (`grid gap-4 md:grid-cols-2 lg:grid-cols-3`)
- **Sorting**: Threads are sorted by `updated_at` or `created_at` (most recent first)
- **Display**: Each thread shows title, description, agent name, project chip, and metadata

## Proposed Changes

### 1. View Toggle Implementation
**Location**: Add toggle buttons above the thread list, next to the search input

**UI Components**:
- Use existing `Toggle` component from `@/components/ui/toggle`
- Icons: `Grid3X3` and `List` from `lucide-react`
- Default view: Grid (maintain current behavior)

**State Management**:
- Add `viewMode` state: `'grid' | 'list'`
- Persist preference in localStorage (optional enhancement)

### 2. Layout Changes

#### Grid View (Current)
- Maintain existing: `grid gap-4 md:grid-cols-2 lg:grid-cols-3`
- Card-based layout with hover effects

#### List View (New)
- Layout: `flex flex-col gap-4`
- Full-width thread items
- Horizontal layout within each item for better space utilization

**List Item Structure**:
```
[Title] [Project Chip] [Agent Info] [Delete Button]
[Description]
[Metadata: Updated time, Thread ID]
```

### 3. Sorting Enhancement
**Current**: Sort by `updated_at || created_at` descending
**Proposed**: Continue using `updated_at` as it represents the most recent interaction

**Rationale**: 
- `updated_at` field is updated whenever a thread receives new messages or modifications
- This effectively represents "most recently interacted with"
- No additional API changes needed

### 4. Responsive Design
- Grid view: Maintain responsive columns
- List view: Single column on all screen sizes
- Ensure mobile compatibility

### 5. Component Structure
**File**: `/frontend/src/app/(dashboard)/projects/page.tsx`

**New State**:
```typescript
const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
```

**Toggle Component**:
```tsx
<div className="flex items-center gap-2">
  <Toggle
    pressed={viewMode === 'grid'}
    onPressedChange={() => setViewMode('grid')}
    size="sm"
  >
    <Grid3X3 className="h-4 w-4" />
  </Toggle>
  <Toggle
    pressed={viewMode === 'list'}
    onPressedChange={() => setViewMode('list')}
    size="sm"
  >
    <List className="h-4 w-4" />
  </Toggle>
</div>
```

**Conditional Layout**:
```tsx
<div className={viewMode === 'grid' ? 'grid gap-4 md:grid-cols-2 lg:grid-cols-3' : 'flex flex-col gap-4'}>
  {/* Thread items */}
</div>
```

### 6. Thread Item Variations

#### Grid Item (Current)
- Maintain existing card layout
- Compact information display

#### List Item (New)
- Horizontal layout with more space for content
- Left-aligned title and description
- Right-aligned metadata and actions
- Better for scanning through many threads

### 7. Implementation Steps
1. Import required components and icons
2. Add view mode state
3. Create toggle UI component
4. Implement conditional layout rendering
5. Style list view items
6. Test responsive behavior
7. Verify sorting logic

### 8. Testing Considerations
- Test toggle functionality
- Verify both layouts work on mobile/desktop
- Ensure search functionality works in both views
- Test delete functionality in both views
- Performance with large number of threads

### 9. Future Enhancements
- Persist view preference in localStorage
- Add more sorting options (alphabetical, creation date, etc.)
- Add filtering options (by project, agent, date range)
- Implement virtual scrolling for large lists

## Dependencies
- Existing UI components: `Toggle`, `Button`
- Icons: `Grid3X3`, `List` from `lucide-react`
- No new API endpoints required

## Risk Assessment
- **Low Risk**: Changes are primarily UI/UX focused
- **Backward Compatible**: Grid view remains default
- **Minimal Breaking Changes**: Only layout modifications
- **Performance**: No impact on data fetching or rendering performance</content>
<parameter name="filePath">/Users/macbookpro/mirrors/PROJECTS_PAGE_ENHANCEMENT.md