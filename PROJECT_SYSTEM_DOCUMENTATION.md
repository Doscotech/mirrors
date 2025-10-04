# Project System Documentation

**Created**: October 4, 2025  
**Purpose**: Comprehensive documentation of how projects are created, managed, and organized in the system

---

## Table of Contents

1. [Overview](#overview)
2. [Project Data Model](#project-data-model)
3. [Project Creation Flow](#project-creation-flow)
4. [Project Limits & Quotas](#project-limits--quotas)
5. [Project-Thread-Message Hierarchy](#project-thread-message-hierarchy)
6. [Sandbox Integration](#sandbox-integration)
7. [API Endpoints](#api-endpoints)
8. [Frontend Hooks & Components](#frontend-hooks--components)
9. [Database Schema](#database-schema)
10. [Common Use Cases](#common-use-cases)

---

## Overview

**Projects** are the primary organizational unit in the system. They:
- Group related threads (conversations) together
- Have their own dedicated sandbox environment for code execution
- Are owned by a specific account (user)
- Can contain multiple agents and threads
- Have usage limits based on subscription tier

**Key Characteristics:**
- Each project gets a unique `project_id` (UUID)
- Projects are account-scoped (users only see their own projects)
- Projects can be searched by name or description
- Projects track creation and update timestamps
- Projects can be public or private

---

## Project Data Model

### Core Project Object

```typescript
interface Project {
  id: string;                    // project_id (UUID)
  name: string;                  // User-defined name
  description: string;           // Optional description
  account_id: string;            // Owner's user ID
  created_at: string;            // ISO timestamp
  updated_at?: string;           // ISO timestamp
  is_public?: boolean;           // Public visibility flag
  sandbox: {                     // Associated sandbox
    id: string;                  // Sandbox ID
    pass: string;                // Sandbox password
    vnc_preview?: string;        // VNC preview URL
    sandbox_url?: string;        // Full sandbox URL
  };
  thread_count?: number;         // Number of threads (computed)
  message_count?: number;        // Number of messages (computed)
  latest_thread_id?: string;     // Most recent thread (computed)
}
```

### Database Fields

**Table**: `projects`

```sql
- project_id (uuid, primary key)
- account_id (uuid, foreign key to auth.users)
- name (text)
- description (text, nullable)
- created_at (timestamp with time zone)
- updated_at (timestamp with time zone)
- is_public (boolean, default false)
- sandbox (jsonb) -- Stores sandbox connection info
```

---

## Project Creation Flow

### 1. **Explicit Project Creation** (User-Initiated)

**Frontend → API:**

```typescript
// User clicks "Create Project" button
const projectData = {
  name: "My Website Project",
  description: "Building a landing page"
};

// Calls API
const project = await createProject(projectData, accountId);
```

**Backend Processing:**

1. **Validate User Session**: Extract `account_id` from JWT token
2. **Check Project Limits**: Verify user hasn't exceeded tier quota
3. **Insert Project Record**: Create entry in `projects` table
4. **Return Project Object**: Send back project with UUID

**File**: `frontend/src/lib/api.ts` (Line 404)

```typescript
export const createProject = async (
  projectData: { name: string; description: string },
  accountId?: string,
): Promise<Project> => {
  const supabase = createClient();

  // Get user ID if not provided
  if (!accountId) {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!userData.user) throw new Error('You must be logged in to create a project');
    accountId = userData.user.id;
  }

  // Insert into database
  const { data, error } = await supabase
    .from('projects')
    .insert({
      name: projectData.name,
      description: projectData.description || null,
      account_id: accountId,
    })
    .select()
    .single();

  if (error) {
    handleApiError(error, { operation: 'create project', resource: 'project' });
    throw error;
  }

  // Map to Project type
  const project = {
    id: data.project_id,
    name: data.name,
    description: data.description || '',
    created_at: data.created_at,
    sandbox: { id: '', pass: '', vnc_preview: '' },
  };
  
  return project;
};
```

---

### 2. **Automatic Project Creation** (Agent-Initiated)

When a user sends their **first message** to an agent without selecting an existing project, the system automatically creates a project.

**Flow**:

1. User sends message through `/agent/initiate` endpoint
2. Backend checks if `project_id` was provided in request
3. If no project exists → Creates new project automatically
4. Project name is derived from user's prompt (first 30 chars)
5. Sandbox is optionally created if files were uploaded

**File**: `backend/core/agent_runs.py` (Line 789)

```python
@router.post("/agent/initiate", response_model=InitiateAgentResponse)
async def initiate_agent_with_files(
    prompt: str = Form(...),
    model_name: Optional[str] = Form(None),
    agent_id: Optional[str] = Form(None),
    files: List[UploadFile] = File(default=[]),
    user_id: str = Depends(verify_and_get_user_id_from_jwt)
):
    # ... authentication and validation ...
    
    # Check project limit
    project_limit_check = await check_project_count_limit(client, account_id)
    if not project_limit_check['can_create']:
        error_detail = {
            "message": "Project limit exceeded",
            "current_count": project_limit_check['current_count'],
            "limit": project_limit_check['limit'],
            "tier": project_limit_check['tier_name'],
            "error_code": "PROJECT_LIMIT_EXCEEDED"
        }
        raise HTTPException(status_code=402, detail=error_detail)

    # 1. CREATE PROJECT
    placeholder_name = f"{prompt[:30]}..." if len(prompt) > 30 else prompt
    project = await client.table('projects').insert({
        "project_id": str(uuid.uuid4()),
        "account_id": account_id,
        "name": placeholder_name,
        "created_at": datetime.now(timezone.utc).isoformat()
    }).execute()
    
    project_id = project.data[0]['project_id']
    logger.info(f"Created new project: {project_id}")
    
    # 2. CREATE SANDBOX (if needed)
    # Sandbox creation is lazy - only created when tools require it
    # or if files were uploaded immediately
```

**File**: `backend/agent/handlers/agent_runs.py` (Line 771)  
(Similar implementation in agent handler)

---

## Project Limits & Quotas

Projects have **tier-based limits** to prevent abuse and manage resource allocation.

### Limit Configuration

**File**: `backend/agent/utils.py` (Line 435)

```python
async def check_project_count_limit(client, account_id: str) -> Dict[str, Any]:
    """
    Check if a user can create more projects based on their subscription tier.
    
    Returns:
        Dict containing:
        - can_create: bool - whether user can create another project
        - current_count: int - current number of projects
        - limit: int - maximum projects allowed for this tier
        - tier_name: str - subscription tier name
    """
    
    # LOCAL MODE: Unlimited projects for development
    if config.ENV_MODE.value == "local":
        return {
            'can_create': True,
            'current_count': 0,
            'limit': 999999,
            'tier_name': 'local'
        }
    
    # Check cache first
    try:
        result = await Cache.get(f"project_count_limit:{account_id}")
        if result:
            return result
    except Exception as cache_error:
        logger.warning(f"Cache read failed: {cache_error}")

    # Count current projects
    projects_result = await client.table('projects')\
        .select('project_id')\
        .eq('account_id', account_id)\
        .execute()
    
    current_count = len(projects_result.data or [])
    
    # Get subscription tier
    try:
        from services.billing import get_subscription_tier
        tier_name = await get_subscription_tier(client, account_id)
    except Exception:
        tier_name = 'free'  # Default to free tier
    
    # Get limit for tier
    project_limit = config.PROJECT_LIMITS.get(tier_name, config.PROJECT_LIMITS['free'])
    can_create = current_count < project_limit
    
    result = {
        'can_create': can_create,
        'current_count': current_count,
        'limit': project_limit,
        'tier_name': tier_name
    }
    
    # Cache result for 5 minutes
    await Cache.set(f"project_count_limit:{account_id}", result, ttl=300)
    
    return result
```

### Default Project Limits by Tier

```python
PROJECT_LIMITS = {
    'free': 3,
    'starter': 10,
    'pro': 50,
    'enterprise': 500,
    'local': 999999  # Development mode
}
```

---

## Project-Thread-Message Hierarchy

Projects organize content in a **three-level hierarchy**:

```
Project (Workspace)
└── Thread (Conversation)
    └── Message (Individual chat message)
```

### Hierarchy Details

**Project Level:**
- Contains multiple threads
- Has one sandbox environment
- Owned by one account
- Aggregates thread/message counts

**Thread Level:**
- Belongs to one project
- Represents a single conversation
- Has a title (auto-generated or user-defined)
- Contains sequential messages
- Tracks creation and update times

**Message Level:**
- Belongs to one thread (and indirectly to a project)
- Contains actual content (user prompt or AI response)
- Has role (user/assistant/system)
- May include tool calls and results

### Database Relationships

```sql
-- Projects table
CREATE TABLE projects (
    project_id UUID PRIMARY KEY,
    account_id UUID REFERENCES auth.users(id),
    name TEXT NOT NULL,
    description TEXT,
    ...
);

-- Threads table
CREATE TABLE threads (
    thread_id UUID PRIMARY KEY,
    project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
    title TEXT,
    ...
);

-- Messages table
CREATE TABLE messages (
    message_id UUID PRIMARY KEY,
    thread_id UUID REFERENCES threads(thread_id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(project_id),  -- Denormalized for performance
    content TEXT,
    role TEXT,
    ...
);
```

---

## Sandbox Integration

Every project can have an **associated sandbox environment** for code execution.

### Sandbox Creation Strategies

**1. Lazy Creation (Default)**

Sandboxes are NOT created when the project is created. Instead, they're created "on-demand" when:
- A tool requires sandbox execution
- User uploads files that need processing
- Agent needs to run code

**File**: `backend/agent/run.py` (Line 466)

```python
async def setup(self):
    # ... load project ...
    
    project_data = project.data[0]
    sandbox_info = project_data.get('sandbox', {})
    
    if not sandbox_info.get('id'):
        logger.debug(f"No sandbox found for project {self.config.project_id}")
        logger.debug("Will create lazily when needed")
        # Sandbox creation happens in _ensure_sandbox() when tools need it
```

**2. Immediate Creation (File Upload)**

If files are uploaded during project creation:

```python
# If files were uploaded, create sandbox immediately
if files:
    sandbox = await create_sandbox(project_id, account_id)
    sandbox_id = sandbox['id']
    
    # Upload files to sandbox
    for file in files:
        await upload_file_to_sandbox(sandbox_id, file)
```

### Sandbox Connection Info

Stored in project's `sandbox` JSONB field:

```json
{
  "id": "sb_abc123",
  "pass": "secure_password",
  "vnc_preview": "https://sandbox.example.com/vnc",
  "sandbox_url": "https://sb_abc123.sandbox.example.com"
}
```

---

## API Endpoints

### List Projects

**GET** `/projects`

Query parameters:
- `q` (string): Search text for name/description
- `limit` (int): Max results (1-500, default 100)
- `offset` (int): Pagination offset
- `include_counts` (bool): Include thread/message counts

**Response:**

```json
{
  "projects": [
    {
      "project_id": "uuid",
      "name": "My Project",
      "description": "Description",
      "account_id": "user-uuid",
      "created_at": "2025-10-04T12:00:00Z",
      "updated_at": "2025-10-04T15:30:00Z",
      "thread_count": 5,
      "message_count": 42,
      "latest_thread_id": "thread-uuid"
    }
  ],
  "pagination": {
    "total": 12,
    "limit": 100,
    "offset": 0
  }
}
```

**Implementation**: `backend/core/projects.py` (Line 50)

---

### Get Single Project

**GET** `/projects/{project_id}`

Returns single project with sandbox info.

**Implementation**: `frontend/src/lib/api.ts` (Line 294)

```typescript
export const getProject = async (projectId: string): Promise<Project> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('project_id', projectId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error(`Project not found: ${projectId}`);
    }
    throw error;
  }

  // If project has sandbox, ensure it's started
  if (data.sandbox?.id) {
    ensureSandboxActive(data.sandbox.id);
  }

  return {
    id: data.project_id,
    name: data.name || '',
    description: data.description || '',
    is_public: data.is_public || false,
    created_at: data.created_at,
    sandbox: data.sandbox || { id: '', pass: '', vnc_preview: '', sandbox_url: '' },
  };
};
```

---

### Create Project

**POST** `/projects`

Request body:
```json
{
  "name": "Project Name",
  "description": "Optional description"
}
```

**Implementation**: `frontend/src/lib/api.ts` (Line 404)

---

### Update Project

**PATCH** `/projects/{project_id}`

Request body (partial):
```json
{
  "name": "Updated Name",
  "description": "Updated description"
}
```

---

### Delete Project

**DELETE** `/projects/{project_id}`

Cascades to delete:
- All threads in the project
- All messages in those threads
- Associated sandbox (if exists)

**Implementation**: `frontend/src/lib/api.ts` (Line 580)

```typescript
export const deleteProject = async (projectId: string): Promise<void> => {
  const supabase = createClient();

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('project_id', projectId);

  if (error) {
    handleApiError(error, { operation: 'delete project', resource: 'project' });
    throw error;
  }
};
```

---

## Frontend Hooks & Components

### React Query Hooks

**File**: `frontend/src/hooks/react-query/threads/use-project.ts`

```typescript
// Fetch single project
export const useProjectQuery = (projectId: string | undefined) =>
  createQueryHook(
    threadKeys.project(projectId || ""),
    () => projectId ? getProject(projectId) : Promise.reject("No project ID"),
    {
      enabled: !!projectId,
      retry: 1,
    }
  )();

// Fetch project detail with extra info
export const useProjectDetailQuery = (projectId: string | undefined) =>
  createQueryHook(
    threadKeys.project(projectId || ""),
    () => projectId ? getProjectDetail(projectId) : Promise.reject("No project ID"),
    {
      enabled: !!projectId,
      retry: 1,
    }
  )();

// Update project
export const useUpdateProjectMutation = () =>
  createMutationHook(
    ({ projectId, data }: { projectId: string; data: Partial<Project> }) => 
      updateProject(projectId, data),
    {
      onSuccess: () => {
        // toast.success('Project updated successfully');
      },
      errorContext: { operation: 'update project', resource: 'project' }
    }
  );
```

---

### Mutation Hooks

**File**: `frontend/src/hooks/react-query/sidebar/use-project-mutations.ts`

```typescript
// Create project
export const useCreateProject = createMutationHook(
  (data: { name: string; description: string; accountId?: string }) => 
    createProject(data, data.accountId),
  {
    onSuccess: () => {
      toast.success('Project created successfully');
    },
    errorContext: {
      operation: 'create project',
      resource: 'project'
    }
  }
);

// Update project
export const useUpdateProject = createMutationHook(
  ({ projectId, data }: { projectId: string; data: Partial<Project> }) => 
    updateProject(projectId, data),
  {
    onSuccess: () => {
      // Success handled silently for auto-updates
    },
    errorContext: {
      operation: 'update project',
      resource: 'project'
    }
  }
);

// Delete project
export const useDeleteProject = createMutationHook(
  (projectId: string) => deleteProject(projectId),
  {
    onSuccess: () => {
      toast.success('Project deleted successfully');
    },
    invalidates: [projectKeys.all],
    errorContext: {
      operation: 'delete project',
      resource: 'project'
    }
  }
);
```

---

### UI Components

**Projects Widget** (Dashboard)

**File**: `frontend/src/components/dashboard/widgets/ProjectsWidget.tsx`

Shows:
- Total project count
- Link to projects page
- "Create first project" CTA if no projects exist

```tsx
<CardContent>
  {projectsLoading ? (
    <Skeleton className="h-8 w-16" />
  ) : (projects?.length ?? 0) > 0 ? (
    <div className="space-y-2">
      <div className="flex items-baseline gap-3">
        <div className="text-2xl font-semibold">{projects?.length ?? 0}</div>
        <Link href="/projects" className="text-xs text-primary underline">
          Open projects
        </Link>
      </div>
    </div>
  ) : (
    <div className="space-y-3">
      <div className="text-sm text-muted-foreground">No projects yet.</div>
      <Link href="/projects">
        <Button size="sm">Create your first project</Button>
      </Link>
    </div>
  )}
</CardContent>
```

---

**Projects Page** (Full List)

**File**: `frontend/src/app/(dashboard)/projects/page.tsx`

Actually displays **threads** (conversation history), not projects!

This page:
- Shows all user's threads grouped by project
- Displays thread title, description, agent name
- Shows project name as a chip
- Includes search/filter functionality
- **Now includes delete functionality** (as of latest update)

---

## Database Schema

### Projects Table

```sql
CREATE TABLE public.projects (
    project_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_public BOOLEAN DEFAULT FALSE,
    sandbox JSONB DEFAULT '{}'::jsonb,
    
    -- Indexes
    INDEX idx_projects_account_id (account_id),
    INDEX idx_projects_created_at (created_at DESC)
);

-- Row Level Security
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Users can only see their own projects
CREATE POLICY "Users can view their own projects"
    ON public.projects FOR SELECT
    USING (account_id = auth.uid());

-- Users can create projects for their account
CREATE POLICY "Users can create their own projects"
    ON public.projects FOR INSERT
    WITH CHECK (account_id = auth.uid());

-- Users can update their own projects
CREATE POLICY "Users can update their own projects"
    ON public.projects FOR UPDATE
    USING (account_id = auth.uid());

-- Users can delete their own projects
CREATE POLICY "Users can delete their own projects"
    ON public.projects FOR DELETE
    USING (account_id = auth.uid());
```

---

### Related Tables

**Threads Table:**

```sql
CREATE TABLE public.threads (
    thread_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(project_id) ON DELETE CASCADE,
    title TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_threads_project_id (project_id),
    INDEX idx_threads_updated_at (updated_at DESC)
);
```

**Messages Table:**

```sql
CREATE TABLE public.messages (
    message_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    thread_id UUID NOT NULL REFERENCES public.threads(thread_id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES public.projects(project_id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_messages_thread_id (thread_id),
    INDEX idx_messages_project_id (project_id),
    INDEX idx_messages_created_at (created_at)
);
```

---

## Common Use Cases

### 1. Creating a Project for a Specific Task

```typescript
// User wants to build a website
const project = await createProject({
  name: "Landing Page Website",
  description: "Building a product landing page with React"
});

// Start a conversation in this project
const response = await initiateAgent({
  projectId: project.id,
  prompt: "Create a React landing page with hero section",
  files: []
});
```

---

### 2. Listing User's Projects with Statistics

```typescript
// Fetch with counts
const { projects, pagination } = await fetch('/projects?include_counts=true&limit=50');

projects.forEach(project => {
  console.log(`${project.name}:`);
  console.log(`  - ${project.thread_count} conversations`);
  console.log(`  - ${project.message_count} total messages`);
  console.log(`  - Last active: ${project.updated_at}`);
});
```

---

### 3. Searching Projects

```typescript
// Search for projects about "website"
const results = await fetch('/projects?q=website&limit=10');

// Returns projects where name or description contains "website"
```

---

### 4. Auto-Creating Projects from Agent Conversations

```typescript
// User sends message without selecting a project
const formData = new FormData();
formData.append('prompt', 'Help me build a Python web scraper');
// No project_id specified

const response = await fetch('/agent/initiate', {
  method: 'POST',
  body: formData
});

// Backend automatically:
// 1. Creates project named "Help me build a Python web..."
// 2. Creates thread in that project
// 3. Starts agent conversation
```

---

### 5. Managing Project Sandboxes

```typescript
// Get project with sandbox info
const project = await getProject(projectId);

if (project.sandbox?.sandbox_url) {
  // Open sandbox in browser
  window.open(project.sandbox.sandbox_url, '_blank');
  
  // Access VNC preview
  const vncUrl = project.sandbox.vnc_preview;
}

// Sandbox is automatically created when agent needs to run code
```

---

### 6. Deleting a Project (Cascading Delete)

```typescript
// Delete project and all associated data
await deleteProject(projectId);

// This automatically deletes:
// - All threads in the project
// - All messages in those threads  
// - The project's sandbox (if it exists)
// - Any uploaded files in the sandbox
```

---

## Best Practices

### 1. **Always Check Limits Before Creating**

```typescript
// Check if user can create more projects
const limitCheck = await checkProjectCountLimit(accountId);

if (!limitCheck.can_create) {
  showUpgradeDialog({
    current: limitCheck.current_count,
    limit: limitCheck.limit,
    tier: limitCheck.tier_name
  });
  return;
}

// Safe to create
const project = await createProject(data);
```

---

### 2. **Use Descriptive Project Names**

```typescript
// ❌ Bad
await createProject({ name: "Project 1", description: "" });

// ✅ Good
await createProject({
  name: "E-commerce Checkout Flow",
  description: "Implementing stripe payment integration and cart management"
});
```

---

### 3. **Lazy Load Sandbox Resources**

Don't create sandboxes until absolutely necessary:

```typescript
// ❌ Bad: Creating sandbox immediately
const project = await createProject(data);
await createSandboxForProject(project.id);  // Wastes resources

// ✅ Good: Let system create sandbox when needed
const project = await createProject(data);
// Sandbox created automatically when agent runs code
```

---

### 4. **Clean Up Unused Projects**

```typescript
// Implement project cleanup logic
const inactiveProjects = projects.filter(p => {
  const lastUpdate = new Date(p.updated_at || p.created_at);
  const daysSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
  return daysSinceUpdate > 90; // 90 days inactive
});

// Prompt user to delete or archive
```

---

### 5. **Handle Project Not Found Gracefully**

```typescript
try {
  const project = await getProject(projectId);
} catch (error) {
  if (error.message.includes('not found')) {
    // Redirect to projects list
    router.push('/projects');
    toast.error('Project not found or deleted');
  } else {
    // Handle other errors
    toast.error('Failed to load project');
  }
}
```

---

## Troubleshooting

### "Project limit exceeded" Error

**Cause**: User has reached their tier's project limit

**Solution**:
```typescript
// Check current usage
const limitInfo = await checkProjectCountLimit(accountId);
console.log(`${limitInfo.current_count}/${limitInfo.limit} projects used`);

// Options:
// 1. Delete unused projects
// 2. Upgrade subscription tier
// 3. Contact support for enterprise limits
```

---

### Projects Not Loading

**Possible causes**:
1. RLS (Row Level Security) policy blocking access
2. User not authenticated
3. Database connection issue

**Debug**:
```typescript
// Check auth status
const { data: { session } } = await supabase.auth.getSession();
console.log('Authenticated:', !!session);

// Check database connection
const { data, error } = await supabase.from('projects').select('count');
console.log('DB Error:', error);
```

---

### Sandbox Not Starting

**Cause**: Sandbox creation failed or sandbox is stopped

**Solution**:
```typescript
// Check sandbox status
const project = await getProject(projectId);
if (!project.sandbox?.id) {
  console.log('No sandbox exists - will be created on demand');
}

// Manually trigger sandbox creation
await ensureSandboxActive(project.sandbox.id);
```

---

## Summary

Projects are the core organizational unit in the system:

✅ **Created** either manually by users or automatically by the agent  
✅ **Limited** by subscription tier quotas  
✅ **Organized** into a Project → Thread → Message hierarchy  
✅ **Connected** to dedicated sandbox environments  
✅ **Managed** through REST API and React Query hooks  
✅ **Secured** by Row Level Security policies  
✅ **Deletable** with cascading cleanup of all related data

For more information:
- Thread Management: See conversation history documentation
- Sandbox System: See sandbox integration docs  
- Billing & Limits: See billing architecture documentation
- API Reference: See OpenAPI specification at `/docs`

---

**Last Updated**: October 4, 2025
