# Command Center - Visual Overview

## App Navigation Structure

```
┌─────────────────────────────────────────────┐
│          Bottom Tab Navigator                │
├─────────────┬─────────────┬─────────────────┤
│    Chat     │   Command   │    Settings     │
│  (Existing) │   Center    │   (Existing)    │
│             │    (NEW)    │                 │
└─────────────┴──────┬──────┴─────────────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │   Agents Stack Nav    │
         └───────────┬───────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
    ┌──────┐   ┌────────┐   ┌──────────┐
    │ Home │   │  New   │   │  Config  │
    │      │   │ Agent  │   │  Agent   │
    └──┬───┘   └────────┘   └──────────┘
       │
       ▼
  ┌─────────────────┐
  │   Tab View      │
  ├─────────────────┤
  │  My Agents      │ ✅ Functional
  │  Explore        │ ⏳ Placeholder
  │  My Templates   │ ⏳ Placeholder
  └─────────────────┘
```

## Chat Screen Enhancement

```
┌─────────────────────────────────────┐
│         Chat Screen                  │
├─────────────────────────────────────┤
│                                     │
│  ┌────────────────────────────┐   │
│  │    Message Thread          │   │
│  │                            │   │
│  │  User: Hello               │   │
│  │  Agent: Hi there!          │   │
│  │                            │   │
│  └────────────────────────────┘   │
│                                     │
│  ┌────────────────────────────┐   │
│  │  🤖 Research Assistant  ▼  │   │  ← Agent Selector (NEW)
│  └────────────────────────────┘   │
│                                     │
│  ┌────────────────────────────┐   │
│  │  ⚙️ GPT-4o              ▼  │   │  ← Model Selector
│  └────────────────────────────┘   │
│                                     │
│  ┌────────────────────────────┐   │
│  │  Type a message...    [📎] │   │  ← Chat Input
│  └────────────────────────────┘   │
└─────────────────────────────────────┘
```

## My Agents Tab Layout

```
┌─────────────────────────────────────┐
│  My Agents (3)             [+ New]  │
├─────────────────────────────────────┤
│                                     │
│  ┌────────────────────────────┐   │
│  │  🤖 Research Assistant   ⋮  │   │
│  │  Helps with research         │   │
│  │  [Default] [GPT-4o]          │   │
│  └────────────────────────────┘   │
│         │                          │
│         └─▶ Action Menu            │
│              ├─ Edit               │
│              ├─ Set as Default     │
│              └─ Delete             │
│                                     │
│  ┌────────────────────────────┐   │
│  │  🤖 Code Helper          ⋮  │   │
│  │  Coding assistant            │   │
│  │  [Claude Sonnet]             │   │
│  └────────────────────────────┘   │
│                                     │
│  ┌────────────────────────────┐   │
│  │  🤖 Writing Coach        ⋮  │   │
│  │  Improves writing            │   │
│  │  [GPT-4o Mini]               │   │
│  └────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

## Create New Agent Flow

```
Step 1: Tap "New"
    │
    ▼
┌─────────────────────────────────────┐
│      Create Agent        [✕]        │
├─────────────────────────────────────┤
│                                     │
│        ┌───────────┐                │
│        │    🤖     │   ← Preview     │
│        │  (color)  │                │
│        └───────────┘                │
│                                     │
│  Agent Name *                       │
│  ┌──────────────────────────┐      │
│  │ Research Assistant       │      │
│  └──────────────────────────┘      │
│                                     │
│  Description                        │
│  ┌──────────────────────────┐      │
│  │ Helps with research      │      │
│  │ tasks and analysis       │      │
│  └──────────────────────────┘      │
│  120/200 characters                 │
│                                     │
│  Choose Color                       │
│  ●  ●  ●  ●  ●  ●  ●  ●   ← 8 colors│
│                                     │
│  ┌──────────────────────────┐      │
│  │    Create Agent          │      │
│  └──────────────────────────┘      │
└─────────────────────────────────────┘
    │
    ▼
Success Alert
    │
    ▼
Navigate to Edit Screen
```

## Edit Agent Flow

```
Step 1: Tap Agent Card or "Edit" from Menu
    │
    ▼
┌─────────────────────────────────────┐
│      Edit Agent                     │
├─────────────────────────────────────┤
│                                     │
│        ┌───────────┐                │
│        │    🤖     │   ← Preview     │
│        │  (color)  │                │
│        └───────────┘                │
│                                     │
│  Agent Name                         │
│  ┌──────────────────────────┐      │
│  │ Research Assistant       │      │
│  └──────────────────────────┘      │
│                                     │
│  Description                        │
│  ┌──────────────────────────┐      │
│  │ [Editable text area]     │      │
│  └──────────────────────────┘      │
│                                     │
│  Choose Color                       │
│  ●  ●  ●  ●  ●  ●  ●  ●            │
│                                     │
│  Default Agent                      │
│  ┌──────────────────────────┐      │
│  │ ⭐ Use as default  [ON]  │      │
│  └──────────────────────────┘      │
│  Sets this agent as default         │
│                                     │
│  ┌──────────────────────────┐      │
│  │    Save Changes          │      │
│  └──────────────────────────┘      │
│                                     │
│  ┌──────────────────────────┐      │
│  │  🗑️  Delete Agent        │      │
│  └──────────────────────────┘      │
└─────────────────────────────────────┘
```

## Data Flow Diagram

```
┌──────────────┐
│     User     │
│   Actions    │
└──────┬───────┘
       │
       ▼
┌──────────────┐      ┌──────────────┐
│  Component   │ ────▶│ Agent Store  │
│   (UI)       │      │  (Zustand)   │
└──────┬───────┘      └──────┬───────┘
       │                     │
       │                     │
       ▼                     ▼
┌──────────────┐      ┌──────────────┐
│ agents-api.ts│ ────▶│   Backend    │
│  (API Layer) │      │   Server     │
└──────────────┘      └──────┬───────┘
       ▲                     │
       │                     │
       │     Response        │
       └─────────────────────┘
       │
       ▼
┌──────────────┐
│  UI Update   │
│ (Auto-sync)  │
└──────────────┘
```

## Feature Checklist

### ✅ Implemented (Phase 1 & 2)
```
Agent Selector
  ✅ Display agent list
  ✅ Expand/collapse toggle
  ✅ Select agent
  ✅ Pass to chat API
  ✅ Default badge

My Agents Tab
  ✅ List all agents
  ✅ Agent cards with info
  ✅ Pull-to-refresh
  ✅ Empty state
  ✅ Action menu
  ✅ Quick actions

Create Agent
  ✅ Name input
  ✅ Description input
  ✅ Color picker
  ✅ Live preview
  ✅ Validation
  ✅ Create API call
  ✅ Success handling

Edit Agent
  ✅ Load existing data
  ✅ Edit all fields
  ✅ Color picker
  ✅ Default toggle
  ✅ Save changes
  ✅ Delete agent
  ✅ Confirmations
```

### ⏳ Pending (Phase 3+)
```
Marketplace
  ⏳ Browse templates
  ⏳ Search templates
  ⏳ Filter by tags
  ⏳ Template preview
  ⏳ Install template
  ⏳ Share template

My Templates
  ⏳ List published
  ⏳ Publish agent
  ⏳ Unpublish
  ⏳ Delete template
  ⏳ View analytics

Advanced Config
  ⏳ System prompt editor
  ⏳ Model selection
  ⏳ Tool configuration
  ⏳ MCP setup
```

## Color System

```
Agent Avatar Colors:

🔵 Blue      ● #3B82F6  on  #EFF6FF
🟢 Green     ● #10B981  on  #F0FDF4
🟡 Amber     ● #F59E0B  on  #FFFBEB
🔴 Red       ● #EF4444  on  #FEF2F2
🟣 Purple    ● #8B5CF6  on  #F5F3FF
🩷 Pink      ● #EC4899  on  #FDF2F8
🔷 Teal      ● #14B8A6  on  #F0FDFA
🟠 Orange    ● #F97316  on  #FFF7ED
```

## Progress Bar

```
Phase 1: Navigation & Structure
████████████████████████████████ 100%

Phase 2: Agent CRUD
████████████████████████████████ 100%

Phase 3: Marketplace
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   0%

Phase 4: Template Management
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   0%

Phase 5: Advanced Configuration
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   0%

Overall Progress
████████████░░░░░░░░░░░░░░░░░░░░  40%
```

---

*Visual guide created: October 5, 2025*
