# Command Center Mobile Implementation

## Document Overview
This document outlines the complete implementation plan for bringing the **Command Center** (Agents/Templates marketplace and management system) to the Kortix mobile app.

---

## 1. Feature Analysis

### 1.1 What is Command Center?

The Command Center is a comprehensive agents management system that consists of three main tabs:

1. **My Agents** - Personal agent management
   - Create, edit, delete agents
   - Set default agents
   - View agent configurations (tools, MCPs, system prompts)
   - Publish agents as marketplace templates
   
2. **Explore (Marketplace)** - Agent template discovery
   - Browse public agent templates
   - Filter by tags, search by name/description
   - Preview templates with full details
   - Install templates as new agents
   - View download counts, creator info
   - Share template links
   
3. **My Templates** - Published templates management
   - View templates you've published
   - Unpublish templates
   - Delete templates
   - Track download counts

### 1.2 Current Web Implementation

**Location**: `frontend/src/app/(dashboard)/agents/page.tsx`

**Key Components**:
- `TabsNavigation` - Tab switcher between my-agents, explore, my-templates
- `MyAgentsTab` - Agent list with grid/list view, sorting, filtering
- `MarketplaceTab` - Template marketplace with search, tags, pagination
- `MyTemplatesTab` - User's published templates
- `AgentCard` / `AgentCardV2` - Agent/template display cards
- `MarketplaceAgentPreviewDialog` - Full template preview with install option
- `NewAgentDialog` - Create new agent modal
- `PublishDialog` - Publish agent as template

**Data Hooks** (from `use-secure-mcp.ts` and `use-agents.ts`):
- `useAgents(params)` - Fetch user's agents with pagination, search, filters
- `useMarketplaceTemplates(params)` - Fetch marketplace templates
- `useMyTemplates(params)` - Fetch user's published templates
- `useCreateAgent()` - Create new agent
- `useUpdateAgent()` - Update agent metadata
- `useDeleteAgent()` - Delete agent
- `useInstallTemplate()` - Install template as agent
- `usePublishTemplate()` / `useCreateTemplate()` - Publish agent to marketplace
- `useUnpublishTemplate()` / `useDeleteTemplate()` - Remove from marketplace

**Backend Endpoints**:
- `GET /agents` - List user's agents (with pagination, search, filters)
- `POST /agents` - Create new agent
- `PUT /agents/{agent_id}` - Update agent
- `DELETE /agents/{agent_id}` - Delete agent
- `GET /templates/marketplace` - List marketplace templates
- `GET /templates/my` - List user's published templates
- `POST /templates` - Create template from agent
- `POST /templates/{template_id}/install` - Install template
- `POST /templates/{template_id}/publish` - Publish template
- `DELETE /templates/{template_id}` - Delete template

---

## 2. Mobile Architecture Plan

### 2.1 Navigation Structure

```
Bottom Tab Navigator
├─ Chat (existing)
├─ Command Center (NEW)
│   └─ Stack Navigator
│       ├─ AgentsHome (Tab View)
│       │   ├─ My Agents Tab
│       │   ├─ Explore Tab
│       │   └─ My Templates Tab
│       ├─ AgentConfig Screen (edit agent)
│       ├─ TemplatePreview Screen (preview before install)
│       └─ NewAgent Screen (create agent)
└─ Settings (existing)
```

### 2.2 Screen Definitions

#### **AgentsHomeScreen** (`apps/mobile/app/(tabs)/agents/index.tsx`)
- Top tab navigator with 3 tabs: My Agents, Explore, My Templates
- Search bar (global, applies to active tab)
- Tab-specific action buttons (e.g., "+ New Agent" on My Agents tab)

#### **MyAgentsTab** (`apps/mobile/components/agents/MyAgentsTab.tsx`)
- FlatList of user's agents
- Pull-to-refresh
- Infinite scroll / Load more
- Search functionality
- Sort options: Date Created, Name, Last Updated
- Filter options: Default Agent, Has MCP Tools, Has AgentPress Tools
- Agent cards with:
  - Avatar/Icon
  - Name, description
  - Tool count badges
  - Default star indicator
  - Action menu (Edit, Delete, Set Default, Publish)

#### **ExploreTab** (`apps/mobile/components/agents/ExploreTab.tsx`)
- FlatList of marketplace templates
- Pull-to-refresh
- Infinite scroll
- Search functionality
- Tag filter chips (horizontal scroll)
- Sort options: Newest, Popular, Most Downloaded, Name
- Template cards with:
  - Avatar/Icon
  - Name, description
  - Creator name/badge
  - Download count
  - Tags
  - "Install" button
  - Tap to preview

#### **MyTemplatesTab** (`apps/mobile/components/agents/MyTemplatesTab.tsx`)
- FlatList of user's published templates
- Pull-to-refresh
- Search functionality
- Template cards with:
  - Avatar/Icon
  - Name, description
  - Download count
  - Published date
  - Action menu (Unpublish, Delete)

#### **TemplatePreviewScreen** (`apps/mobile/app/(tabs)/agents/preview/[templateId].tsx`)
- Full-screen modal presentation
- Scrollable content:
  - Large avatar/icon
  - Template name, description
  - Creator info
  - Tags
  - Download count
  - MCP requirements (integrations, custom tools, triggers)
  - AgentPress tools list
  - Model info (from metadata)
- Bottom action bar:
  - "Install" button
  - "Share" button
- Handle missing credentials flow (show dialog if configs required)

#### **AgentConfigScreen** (`apps/mobile/app/(tabs)/agents/config/[agentId].tsx`)
- Edit agent details:
  - Name, description
  - Avatar/Icon picker
  - System prompt
  - Model selector
  - Tools configuration (MCP, AgentPress)
- Save button
- Delete button

#### **NewAgentScreen** (`apps/mobile/app/(tabs)/agents/new.tsx`)
- Simple form:
  - Agent name
  - Description
  - Avatar/Icon picker
  - Initial model selection
- "Create" button → Navigate to AgentConfigScreen

---

## 3. State Management

### 3.1 Zustand Stores

#### **agent-store.ts**
```typescript
interface AgentStore {
  // My Agents
  agents: Agent[];
  agentsLoading: boolean;
  agentsPage: number;
  agentsTotalPages: number;
  agentsSearch: string;
  agentsSort: 'created_at' | 'name' | 'updated_at';
  agentsSortOrder: 'asc' | 'desc';
  
  // Marketplace Templates
  marketplaceTemplates: Template[];
  marketplaceLoading: boolean;
  marketplacePage: number;
  marketplaceTotalPages: number;
  marketplaceSearch: string;
  marketplaceSelectedTags: string[];
  marketplaceSort: 'newest' | 'popular' | 'most_downloaded' | 'name';
  
  // My Templates
  myTemplates: Template[];
  myTemplatesLoading: boolean;
  myTemplatesPage: number;
  myTemplatesTotalPages: number;
  
  // Actions
  fetchAgents: () => Promise<void>;
  fetchMarketplaceTemplates: () => Promise<void>;
  fetchMyTemplates: () => Promise<void>;
  createAgent: (data: CreateAgentData) => Promise<Agent>;
  updateAgent: (id: string, data: UpdateAgentData) => Promise<void>;
  deleteAgent: (id: string) => Promise<void>;
  installTemplate: (templateId: string) => Promise<InstallResult>;
  publishAgent: (agentId: string) => Promise<void>;
  setAgentsSearch: (search: string) => void;
  setMarketplaceSearch: (search: string) => void;
  resetAgentsFilters: () => void;
  resetMarketplaceFilters: () => void;
}
```

### 3.2 API Functions

Create `apps/mobile/api/agents-api.ts`:

```typescript
import { SERVER_URL } from '@/constants/config';
import { getSupabaseClient } from '@/constants/SupabaseConfig';

export interface Agent {
  agent_id: string;
  name: string;
  description?: string;
  system_prompt: string;
  model: string;
  configured_mcps: any[];
  custom_mcps: any[];
  agentpress_tools: Record<string, any>;
  is_default: boolean;
  is_public?: boolean;
  icon_name?: string;
  icon_color?: string;
  icon_background?: string;
  created_at: string;
  updated_at: string;
}

export interface Template {
  template_id: string;
  creator_id: string;
  name: string;
  description?: string;
  system_prompt?: string;
  mcp_requirements: MCPRequirement[];
  agentpress_tools: Record<string, any>;
  tags: string[];
  download_count: number;
  creator_name?: string;
  icon_name?: string;
  icon_color?: string;
  icon_background?: string;
  is_kortix_team?: boolean;
  created_at: string;
  marketplace_published_at?: string;
  metadata?: Record<string, any>;
}

export async function fetchAgents(params: {
  page?: number;
  limit?: number;
  search?: string;
  sort_by?: string;
  sort_order?: string;
}): Promise<{ agents: Agent[]; pagination: any }> {
  const supabase = getSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) throw new Error('Not authenticated');
  
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.search) queryParams.append('search', params.search);
  if (params.sort_by) queryParams.append('sort_by', params.sort_by);
  if (params.sort_order) queryParams.append('sort_order', params.sort_order);
  
  const response = await fetch(`${SERVER_URL}/agents?${queryParams}`, {
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
    },
  });
  
  if (!response.ok) throw new Error('Failed to fetch agents');
  return response.json();
}

export async function fetchMarketplaceTemplates(params: {
  page?: number;
  limit?: number;
  search?: string;
  tags?: string;
  sort_by?: string;
  sort_order?: string;
}): Promise<{ templates: Template[]; pagination: any }> {
  const supabase = getSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) throw new Error('Not authenticated');
  
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.search) queryParams.append('search', params.search);
  if (params.tags) queryParams.append('tags', params.tags);
  if (params.sort_by) queryParams.append('sort_by', params.sort_by);
  if (params.sort_order) queryParams.append('sort_order', params.sort_order);
  
  const response = await fetch(`${SERVER_URL}/templates/marketplace?${queryParams}`, {
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
    },
  });
  
  if (!response.ok) throw new Error('Failed to fetch templates');
  return response.json();
}

export async function createAgent(data: {
  name: string;
  description?: string;
  icon_name?: string;
  icon_color?: string;
  icon_background?: string;
}): Promise<Agent> {
  const supabase = getSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) throw new Error('Not authenticated');
  
  const response = await fetch(`${SERVER_URL}/agents`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) throw new Error('Failed to create agent');
  return response.json();
}

export async function deleteAgent(agentId: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) throw new Error('Not authenticated');
  
  const response = await fetch(`${SERVER_URL}/agents/${agentId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
    },
  });
  
  if (!response.ok) throw new Error('Failed to delete agent');
}

export async function installTemplate(templateId: string, instanceName?: string): Promise<any> {
  const supabase = getSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) throw new Error('Not authenticated');
  
  const response = await fetch(`${SERVER_URL}/templates/${templateId}/install`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ instance_name: instanceName }),
  });
  
  if (!response.ok) throw new Error('Failed to install template');
  return response.json();
}

// More API functions: updateAgent, publishAgent, etc.
```

---

## 4. UI Components

### 4.1 Core Components

#### **AgentCard.tsx**
```tsx
interface AgentCardProps {
  agent: Agent;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleDefault: () => void;
  onPublish: () => void;
}
```

Features:
- Avatar display (icon-based or image)
- Name, description
- Tool count badges
- Default star indicator
- Three-dot menu for actions
- Swipeable for quick actions (optional)

#### **TemplateCard.tsx**
```tsx
interface TemplateCardProps {
  template: Template;
  onPress: () => void;
  onInstall: () => void;
}
```

Features:
- Avatar display
- Name, description
- Creator badge
- Tags (horizontal scroll)
- Download count
- "Install" button
- Tap entire card to preview

#### **TagFilter.tsx**
```tsx
interface TagFilterProps {
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  availableTags: string[];
}
```

Features:
- Horizontal ScrollView of tag chips
- Toggle selection
- Visual indication of selected tags

#### **AgentAvatar.tsx**
```tsx
interface AgentAvatarProps {
  iconName?: string;
  iconColor?: string;
  iconBackground?: string;
  profileImageUrl?: string;
  size?: 'small' | 'medium' | 'large';
}
```

Features:
- Render Lucide icon or image
- Support different sizes
- Fallback to initials or default icon

#### **ToolBadge.tsx**
```tsx
interface ToolBadgeProps {
  type: 'mcp' | 'agentpress' | 'custom';
  count: number;
}
```

Features:
- Small pill badge showing tool counts
- Different colors for different tool types

---

## 5. Implementation Phases

### Phase 1: Basic Infrastructure (Week 1)
**Goal**: Set up navigation, basic screens, API layer

Tasks:
1. Create navigation structure:
   - Add "Command Center" tab to bottom navigator
   - Create stack navigator for agents screens
   - Set up top tab navigator for My Agents/Explore/My Templates
2. Create API functions in `agents-api.ts`:
   - `fetchAgents()`
   - `fetchMarketplaceTemplates()`
   - `fetchMyTemplates()`
   - `createAgent()`
   - `deleteAgent()`
   - `installTemplate()`
3. Create Zustand store `agent-store.ts`:
   - State definitions
   - Fetch actions with pagination
   - Search/filter state
4. Create placeholder screens:
   - `AgentsHomeScreen` with tab navigator
   - `MyAgentsTab` (empty state)
   - `ExploreTab` (empty state)
   - `MyTemplatesTab` (empty state)

**Deliverables**:
- Working navigation to Command Center
- API layer functional
- State management ready
- Placeholder UI visible

---

### Phase 2: My Agents Tab (Week 2)
**Goal**: Complete My Agents functionality

Tasks:
1. Build `AgentCard` component:
   - Design card layout
   - Implement avatar display
   - Add action menu (edit, delete, set default, publish)
2. Implement `MyAgentsTab`:
   - FlatList with agent cards
   - Pull-to-refresh
   - Pagination (load more on scroll end)
   - Search bar integration
   - Empty state UI
3. Create `NewAgentDialog` or screen:
   - Simple form for name, description, icon
   - Create button → navigate to config
4. Implement agent actions:
   - Delete agent (with confirmation)
   - Set default agent
   - Navigate to edit (placeholder for now)
5. Add search functionality:
   - Debounced search input
   - Update store on search change
   - Re-fetch agents on search

**Deliverables**:
- Full My Agents tab with CRUD operations
- Agent cards displaying correctly
- Search working
- Pagination functional

---

### Phase 3: Explore (Marketplace) Tab (Week 3)
**Goal**: Complete marketplace browsing and installation

Tasks:
1. Build `TemplateCard` component:
   - Design card layout
   - Display template info, creator, tags, download count
   - "Install" button
2. Implement `ExploreTab`:
   - FlatList with template cards
   - Pull-to-refresh
   - Pagination
   - Search bar integration
   - Tag filter chips
   - Sort options (dropdown or bottom sheet)
3. Create `TemplatePreviewScreen`:
   - Full-screen modal or stack screen
   - Display all template details
   - List MCP requirements
   - List AgentPress tools
   - Show creator info, tags, download count
   - "Install" and "Share" buttons
4. Implement template installation:
   - Call `installTemplate()` API
   - Handle success → navigate to new agent or show success toast
   - Handle missing credentials → show dialog (future: config flow)
5. Add tag filtering:
   - Fetch available tags from templates
   - Horizontal scrollable tag chips
   - Toggle tags on/off
   - Update store and re-fetch

**Deliverables**:
- Full Explore tab with browsing and filtering
- Template preview screen
- Installation flow (basic, credentials handling TBD)
- Tag filtering working

---

### Phase 4: My Templates Tab (Week 4)
**Goal**: Complete template publishing and management

Tasks:
1. Implement `MyTemplatesTab`:
   - FlatList of user's published templates
   - Display download counts, publish date
   - Pull-to-refresh
   - Search functionality
2. Add publish flow:
   - "Publish" action on My Agents cards
   - Confirmation dialog
   - Call `createTemplate()` API
   - Show success toast
3. Add unpublish/delete flow:
   - Action menu on My Templates cards
   - Confirmation dialogs
   - Call `deleteTemplate()` API
   - Update store

**Deliverables**:
- Full My Templates tab
- Publish/unpublish functionality
- Template management complete

---

### Phase 5: Agent Configuration Screen (Week 5-6)
**Goal**: Enable full agent editing

Tasks:
1. Create `AgentConfigScreen`:
   - Form with sections: Basic Info, Avatar, System Prompt, Model, Tools
   - Avatar/icon picker (Lucide icons)
   - System prompt text area
   - Model selector (reuse existing `ModelSelector` or create dedicated)
   - Tools configuration (MCP, AgentPress toggles)
2. Implement save functionality:
   - Call `updateAgent()` API
   - Validate inputs
   - Show success toast
   - Navigate back
3. Add delete functionality:
   - Delete button in config screen
   - Confirmation dialog
   - Call `deleteAgent()` API
   - Navigate back to My Agents

**Deliverables**:
- Full agent configuration screen
- Edit and save working
- Delete from config working

---

### Phase 6: Polish & Edge Cases (Week 7)
**Goal**: Handle edge cases, improve UX, add animations

Tasks:
1. Error handling:
   - Display error messages for failed API calls
   - Retry buttons on errors
   - Offline state handling
2. Loading states:
   - Skeletons for lists during initial load
   - Loading indicators for actions (install, delete, publish)
3. Empty states:
   - Friendly messages for empty lists
   - "Get Started" CTAs
4. Animations:
   - Fade-in for cards
   - Slide-in for modals
   - Smooth tab transitions
5. Accessibility:
   - Screen reader labels
   - Proper focus management
   - Keyboard navigation (if applicable)
6. Performance:
   - Memoize components
   - Optimize FlatList rendering
   - Image lazy loading

**Deliverables**:
- Polished, production-ready UI
- All edge cases handled
- Good UX across all flows

---

## 6. Data Models

### 6.1 Agent Model
```typescript
interface Agent {
  agent_id: string;
  name: string;
  description?: string;
  system_prompt: string;
  model: string;
  configured_mcps: MCPConfig[];
  custom_mcps?: CustomMCPConfig[];
  agentpress_tools: Record<string, boolean>;
  is_default: boolean;
  is_public?: boolean;
  icon_name?: string;
  icon_color?: string;
  icon_background?: string;
  profile_image_url?: string;
  created_at: string;
  updated_at: string;
  current_version_id?: string;
  version_count?: number;
}

interface MCPConfig {
  name: string;
  config: Record<string, any>;
}

interface CustomMCPConfig {
  name: string;
  type: 'json' | 'sse';
  config: Record<string, any>;
  enabledTools: string[];
}
```

### 6.2 Template Model
```typescript
interface Template {
  template_id: string;
  creator_id: string;
  name: string;
  description?: string;
  system_prompt?: string;
  mcp_requirements: MCPRequirement[];
  agentpress_tools: Record<string, boolean>;
  tags: string[];
  download_count: number;
  creator_name?: string;
  icon_name?: string;
  icon_color?: string;
  icon_background?: string;
  is_kortix_team?: boolean;
  created_at: string;
  marketplace_published_at?: string;
  metadata?: {
    source_agent_id?: string;
    source_version_id?: string;
    model?: string;
  };
}

interface MCPRequirement {
  qualified_name: string;
  display_name: string;
  enabled_tools: string[];
  required_config: string[];
  custom_type?: 'sse' | 'http';
  source?: 'tool' | 'trigger';
}
```

### 6.3 Installation Result Model
```typescript
interface InstallResult {
  status: 'installed' | 'configs_required';
  instance_id?: string;
  name?: string;
  missing_regular_credentials?: {
    qualified_name: string;
    display_name: string;
    required_config: string[];
  }[];
  missing_custom_configs?: {
    qualified_name: string;
    display_name: string;
    custom_type: string;
    required_config: string[];
  }[];
  template_info?: {
    template_id: string;
    name: string;
    description?: string;
  };
}
```

---

## 7. Testing Strategy

### 7.1 Unit Tests
- API functions (mock Supabase client)
- Zustand store actions
- Utility functions (formatting, validation)

### 7.2 Component Tests
- AgentCard rendering
- TemplateCard rendering
- Search input behavior
- Filter chip toggling

### 7.3 Integration Tests
- Full agent creation flow
- Template installation flow
- Publish/unpublish flow
- Search and pagination

### 7.4 E2E Tests (Manual)
- Navigate through all tabs
- Create agent, edit, delete
- Browse marketplace, install template
- Publish agent, unpublish template
- Search and filter on each tab

---

## 8. Dependencies

### New Dependencies (if needed)
- **react-native-flash-list** (optional, for better list performance)
- **react-native-gesture-handler** (already included with Expo)
- **react-native-reanimated** (already included with Expo)

### Existing Dependencies
- **Zustand** (state management)
- **Expo Router** (navigation)
- **Lucide React Native** (icons)
- **React Native** (core UI)

---

## 9. Design Considerations

### 9.1 Mobile-First UX
- **Swipe gestures**: Consider swipe-to-delete for agent/template cards
- **Bottom sheets**: Use for filters, sort options instead of dropdowns
- **Pull-to-refresh**: Implement on all lists
- **Infinite scroll**: Implement pagination gracefully (load more on scroll end)
- **Touch targets**: Ensure buttons are at least 44x44 points

### 9.2 Performance
- **FlatList optimization**: Use `getItemLayout`, `keyExtractor`, `removeClippedSubviews`
- **Image caching**: Use `expo-image` for better performance
- **Debounced search**: Avoid excessive API calls on every keystroke
- **Memoization**: Use `React.memo()` for cards

### 9.3 Offline Support (Future)
- Cache agents/templates locally
- Show cached data when offline
- Sync on reconnect

---

## 10. Security & Privacy

### 10.1 Authentication
- All API calls must include Supabase auth token
- Handle token expiration gracefully (re-authenticate)

### 10.2 Data Validation
- Validate all user inputs before API calls
- Sanitize search queries
- Ensure agent names are non-empty

### 10.3 Permissions
- Only allow users to edit/delete their own agents
- Only allow users to unpublish their own templates
- Enforce ownership checks on backend (already in place)

---

## 11. Future Enhancements

### 11.1 Advanced Features
- **Template versioning**: Show version history for templates
- **Agent sharing**: Share agents directly with other users (not just public marketplace)
- **Agent analytics**: View usage stats for published templates
- **Advanced filters**: Filter by tool types, model, etc.
- **Favorites**: Bookmark favorite templates

### 11.2 Credentials Management
- **MCP credentials flow**: Allow users to configure MCP credentials during template installation
- **Credential vault**: Secure storage for API keys and tokens

### 11.3 Social Features
- **Comments & ratings**: Allow users to comment on and rate templates
- **Following**: Follow template creators
- **Notifications**: Notify on new templates from followed creators

---

## 12. Success Metrics

### 12.1 Adoption Metrics
- % of users who navigate to Command Center
- % of users who create at least one agent
- % of users who install at least one template
- % of users who publish at least one template

### 12.2 Engagement Metrics
- Average agents per user
- Average templates installed per user
- Search usage rate
- Filter usage rate

### 12.3 Quality Metrics
- Error rate on agent creation
- Error rate on template installation
- Time to create first agent
- Time to install first template

---

## 13. Risks & Mitigations

### 13.1 Risks
1. **Complex agent configuration**: Full agent editing is complex (tools, MCPs, prompts)
   - **Mitigation**: Start with basic editing (name, description, icon), add advanced config later
2. **Missing credentials handling**: Installing templates may require MCP credentials
   - **Mitigation**: Phase 1: Show alert if configs required. Phase 2: Build credential config flow
3. **Performance on large lists**: Marketplace may have hundreds of templates
   - **Mitigation**: Use FlatList best practices, implement pagination
4. **Network errors**: Mobile users may have unstable connections
   - **Mitigation**: Implement retry logic, show friendly error messages, cache data

### 13.2 Open Questions
1. Should we allow inline agent creation or always navigate to a separate screen?
   - **Recommendation**: Separate screen for simplicity
2. Should we support drag-to-reorder agents?
   - **Recommendation**: Not in MVP, consider for v2
3. Should we show agent usage stats (e.g., message count)?
   - **Recommendation**: Not in MVP, good future enhancement

---

## 14. Summary & Next Steps

### What We're Building
A full-featured Command Center for mobile that mirrors the web version, allowing users to:
- Manage their personal agents
- Browse and install marketplace templates
- Publish and manage their own templates

### Implementation Timeline
- **Week 1**: Basic infrastructure, navigation, API layer
- **Week 2**: My Agents tab complete
- **Week 3**: Explore (Marketplace) tab complete
- **Week 4**: My Templates tab complete
- **Week 5-6**: Agent configuration screen
- **Week 7**: Polish, edge cases, testing

### Immediate Next Steps
1. Create navigation structure (bottom tab + stack)
2. Build API layer in `agents-api.ts`
3. Create Zustand store `agent-store.ts`
4. Build placeholder screens
5. Start Phase 2: My Agents tab

---

## Appendix: Key Files to Create/Modify

### New Files
- `apps/mobile/app/(tabs)/agents/index.tsx` - AgentsHomeScreen
- `apps/mobile/app/(tabs)/agents/config/[agentId].tsx` - AgentConfigScreen
- `apps/mobile/app/(tabs)/agents/preview/[templateId].tsx` - TemplatePreviewScreen
- `apps/mobile/app/(tabs)/agents/new.tsx` - NewAgentScreen
- `apps/mobile/components/agents/MyAgentsTab.tsx`
- `apps/mobile/components/agents/ExploreTab.tsx`
- `apps/mobile/components/agents/MyTemplatesTab.tsx`
- `apps/mobile/components/agents/AgentCard.tsx`
- `apps/mobile/components/agents/TemplateCard.tsx`
- `apps/mobile/components/agents/TagFilter.tsx`
- `apps/mobile/components/agents/AgentAvatar.tsx`
- `apps/mobile/components/agents/ToolBadge.tsx`
- `apps/mobile/stores/agent-store.ts`
- `apps/mobile/api/agents-api.ts`

### Modified Files
- `apps/mobile/app/(tabs)/_layout.tsx` - Add Command Center tab
- Navigation configuration (if using custom navigator)

---

**Document Version**: 1.0  
**Last Updated**: 2025-01-XX  
**Author**: GitHub Copilot  
**Status**: Ready for Implementation
