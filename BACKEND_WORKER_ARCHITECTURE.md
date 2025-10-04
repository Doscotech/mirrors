# Xera Backend & Worker System Architecture

## Overview

The Xera backend uses a **distributed task queue architecture** with FastAPI for the API server and Dramatiq for background workers, communicating via Redis for pub/sub messaging and state management.

```
┌─────────────┐          ┌──────────────┐         ┌─────────────────┐
│   Frontend  │          │   FastAPI    │         │ Dramatiq Worker │
│  (Next.js)  │ ◄──HTTP──│   API Server │ ◄─Redis─│   (Background)  │
└─────────────┘          └──────────────┘         └─────────────────┘
                                │                          │
                                │                          │
                         ┌──────▼──────────────────────────▼─────┐
                         │         Redis (Broker + Cache)         │
                         │  • Task Queue (Dramatiq)               │
                         │  • Pub/Sub (Streaming)                 │
                         │  • State Management                     │
                         └────────────────────────────────────────┘
                                         │
                                         ▼
                              ┌────────────────────┐
                              │  Supabase PostgreSQL│
                              │  • Threads          │
                              │  • Agent Runs       │
                              │  • Messages         │
                              │  • Projects         │
                              └────────────────────┘
```

---

## Core Components

### 1. FastAPI Server (`backend/api.py`)

**Purpose:** Synchronous HTTP API for client requests

**Responsibilities:**
- Handle HTTP requests from frontend
- Create database records (threads, agent_runs, messages)
- Enqueue background tasks via Dramatiq
- Stream agent responses to clients via Server-Sent Events (SSE)
- Manage authentication and authorization

**Key Features:**
```python
# Lifespan management
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await db.initialize()
    await redis.initialize_async()
    core_api.initialize(db, instance_id)
    
    yield
    
    # Shutdown
    await core_api.cleanup()
    await redis.close()
    await db.disconnect()
```

**Instance ID:** Each API server instance has a unique ID (`instance_id = "single"` in local dev)

---

### 2. Dramatiq Worker (`backend/run_agent_background.py`)

**Purpose:** Asynchronous background task execution

**How to Start:**
```bash
uv run dramatiq --processes 4 --threads 4 run_agent_background
```
- **4 processes** = 4 separate Python processes
- **4 threads per process** = 16 total concurrent workers

**Broker Configuration:**
```python
redis_broker = RedisBroker(
    host=redis_host, 
    port=redis_port, 
    middleware=[dramatiq.middleware.AsyncIO()]
)
dramatiq.set_broker(redis_broker)
```

**Worker Initialization:**
```python
async def initialize():
    global db, instance_id, _initialized
    
    if not instance_id:
        instance_id = str(uuid.uuid4())[:8]  # Unique worker instance
    
    await redis.initialize_async()
    await db.initialize()
    _initialized = True
```

---

### 3. Redis (`backend/core/services/redis.py`)

**Purpose:** Message broker, pub/sub, and distributed state

**Connection Pool:**
```python
max_connections = 256  # Handles 16 workers
socket_timeout = 15.0
connect_timeout = 10.0
health_check_interval = 30
```

**Redis Keys Used:**

| Key Pattern | Purpose | TTL |
|------------|---------|-----|
| `agent_run:{run_id}:responses` | List of agent responses | 24h |
| `agent_run:{run_id}:new_response` | Pub/Sub channel for new responses | N/A |
| `agent_run:{run_id}:control` | Pub/Sub channel for control signals | N/A |
| `agent_run_lock:{run_id}` | Idempotency lock | 24h |
| `active_run:{instance_id}:{run_id}` | Instance tracking | 24h |
| `stop_signal:{run_id}` | Stop request flag | 1h |

**Pub/Sub Channels:**
- **Response Channel:** Worker publishes agent responses → Frontend receives via SSE
- **Control Channel:** System publishes control signals (`END_STREAM`, `ERROR`, `STOP`)

---

## Request Flow: User Sends Message

### Step 1: Frontend → API Server

```typescript
// Frontend sends POST request
fetch('/api/agent-run', {
  method: 'POST',
  body: JSON.stringify({
    thread_id: "thread-123",
    model_name: "openai/gpt-4o",
    message: "Hello!"
  })
})
```

### Step 2: API Server Creates Agent Run

**File:** `backend/core/agent_runs.py`

```python
@router.post("/agent-run")
async def create_agent_run(
    thread_id: str,
    model_name: str,
    user_id: str = Depends(verify_and_get_user_id_from_jwt)
):
    # 1. Create agent_run record in database
    agent_run = await client.table('agent_runs').insert({
        "thread_id": thread_id,
        "status": "running",
        "started_at": datetime.now(timezone.utc).isoformat(),
        "metadata": {"model_name": model_name}
    }).execute()
    
    agent_run_id = agent_run.data[0]['id']
    
    # 2. Register in Redis (instance tracking)
    instance_key = f"active_run:{instance_id}:{agent_run_id}"
    await redis.set(instance_key, "running", ex=redis.REDIS_KEY_TTL)
    
    # 3. Enqueue background task
    run_agent_background.send(
        agent_run_id=agent_run_id,
        thread_id=thread_id,
        instance_id=instance_id,
        project_id=project_id,
        model_name=model_name,
        agent_config=agent_config
    )
    
    return {"agent_run_id": agent_run_id, "status": "running"}
```

**What Happens:**
1. ✅ Database record created (status: `running`)
2. ✅ Redis key set to track instance
3. ✅ Task enqueued in Redis (Dramatiq broker)
4. ✅ Response returned to frontend (immediately, not waiting for completion)

### Step 3: Dramatiq Worker Picks Up Task

**File:** `backend/run_agent_background.py`

```python
@dramatiq.actor
async def run_agent_background(
    agent_run_id: str,
    thread_id: str,
    instance_id: str,
    project_id: str,
    model_name: str = "openai/gpt-4o",
    agent_config: Optional[dict] = None
):
    # 1. Acquire idempotency lock
    run_lock_key = f"agent_run_lock:{agent_run_id}"
    lock_acquired = await redis.set(
        run_lock_key, 
        instance_id, 
        nx=True,  # Only set if doesn't exist
        ex=redis.REDIS_KEY_TTL
    )
    
    if not lock_acquired:
        logger.info(f"Agent run {agent_run_id} already being processed. Skipping.")
        return
    
    # 2. Set up Redis keys
    response_list_key = f"agent_run:{agent_run_id}:responses"
    response_channel = f"agent_run:{agent_run_id}:new_response"
    global_control_channel = f"agent_run:{agent_run_id}:control"
    
    # 3. Run the agent
    async for response in run_agent(config):
        # Store response in Redis list
        await redis.rpush(response_list_key, json.dumps(response))
        
        # Publish notification
        await redis.publish(response_channel, "new")
        
        # Batch flush every 50 messages (prevent connection pool exhaustion)
        if len(pending_redis_operations) >= 50:
            await asyncio.gather(*pending_redis_operations)
            pending_redis_operations = []
    
    # 4. Update database status
    await update_agent_run_status(client, agent_run_id, "completed")
    
    # 5. Publish completion signal
    await redis.publish(global_control_channel, "END_STREAM")
    
    # 6. Cleanup
    await redis.delete(run_lock_key)
    await redis.expire(response_list_key, 86400)  # 24h TTL
```

**Idempotency Protection:**
- If same task enqueued twice (e.g., network retry), only one worker processes it
- Lock prevents duplicate execution

**Batched Redis Operations:**
- Responses accumulated in batches of 50
- Prevents Redis connection pool exhaustion (256 max connections / 16 workers = ~16 ops/worker)

### Step 4: Frontend Streams Responses

**File:** `backend/core/agent_runs.py`

```python
@router.get("/agent-run/{agent_run_id}/stream")
async def stream_agent_run(agent_run_id: str):
    response_list_key = f"agent_run:{agent_run_id}:responses"
    response_channel = f"agent_run:{agent_run_id}:new_response"
    control_channel = f"agent_run:{agent_run_id}:control"
    
    async def stream_generator():
        # 1. Fetch existing responses from Redis list
        initial_responses = await redis.lrange(response_list_key, 0, -1)
        for response in initial_responses:
            yield f"data: {json.dumps(response)}\n\n"
        
        # 2. Subscribe to pub/sub for new responses
        pubsub = await redis.create_pubsub()
        await pubsub.subscribe(response_channel, control_channel)
        
        # 3. Listen for new messages
        async for message in pubsub.listen():
            if message['channel'] == response_channel:
                # Fetch new responses from list
                new_responses = await redis.lrange(
                    response_list_key, 
                    last_index + 1, 
                    -1
                )
                for response in new_responses:
                    yield f"data: {json.dumps(response)}\n\n"
            
            elif message['channel'] == control_channel:
                control_signal = message['data']
                if control_signal == "END_STREAM":
                    yield f"data: {json.dumps({'type': 'status', 'status': 'completed'})}\n\n"
                    break
    
    return StreamingResponse(
        stream_generator(), 
        media_type="text/event-stream"
    )
```

**Server-Sent Events (SSE):**
- Frontend opens single HTTP connection
- Server sends data as it becomes available
- Format: `data: {json}\n\n`

---

## Agent Execution Pipeline

### File: `backend/core/run.py`

```python
async def run_agent(config: AgentConfig) -> AsyncGenerator[Dict, None]:
    # 1. Initialize thread manager
    thread_manager = ThreadManager(
        thread_id=config.thread_id,
        project_id=config.project_id,
        trace=config.trace
    )
    
    # 2. Register tools
    tool_manager = ToolManager(thread_manager, config.project_id, config.thread_id)
    tool_manager.register_all_tools(
        agent_id=config.agent_config.get('agent_id'),
        disabled_tools=config.agent_config.get('disabled_tools', [])
    )
    
    # 3. Get system prompt
    system_prompt = get_system_prompt(
        thread_manager=thread_manager,
        agent_config=config.agent_config
    )
    
    # 4. Run agent loop
    runner = AgentRunner(
        thread_manager=thread_manager,
        model_name=config.model_name,
        system_prompt=system_prompt,
        config=config
    )
    
    async for chunk in runner.run():
        yield chunk
```

### AgentRunner Loop

```python
class AgentRunner:
    async def run(self):
        for iteration in range(self.max_iterations):
            # 1. Get conversation history
            messages = await self.thread_manager.get_messages()
            
            # 2. Call LLM
            response = await model_manager.chat_completion(
                model=self.model_name,
                messages=messages,
                tools=self.thread_manager.get_tool_schemas()
            )
            
            # 3. Process response
            if response.tool_calls:
                # Execute tool calls
                for tool_call in response.tool_calls:
                    result = await self.execute_tool(tool_call)
                    yield {"type": "tool_result", "data": result}
            else:
                # Final response
                yield {"type": "message", "content": response.content}
                break
            
            # 4. Check billing
            cost = calculate_cost(response)
            await billing_integration.deduct_credits(
                user_id=self.user_id,
                amount=cost
            )
```

---

## Tool System

### Tool Registration

```python
class ToolManager:
    def register_all_tools(self, agent_id: str, disabled_tools: List[str]):
        # Core tools (always enabled)
        self.thread_manager.add_tool(MessageTool)
        self.thread_manager.add_tool(TaskListTool)
        
        # Sandbox tools (conditionally)
        if 'sb_shell_tool' not in disabled_tools:
            self.thread_manager.add_tool(
                SandboxShellTool,
                project_id=self.project_id,
                thread_manager=self.thread_manager
            )
        
        # Agent builder tools (if agent_id provided)
        if agent_id:
            self._register_agent_builder_tools(agent_id, disabled_tools)
```

### Tool Example: Shell Tool

```python
class SandboxShellTool(SandboxToolsBase):
    @openapi_schema({
        "type": "function",
        "function": {
            "name": "execute_command",
            "description": "Execute shell command in sandbox",
            "parameters": {
                "type": "object",
                "properties": {
                    "command": {"type": "string"}
                },
                "required": ["command"]
            }
        }
    })
    async def execute_command(self, command: str) -> ToolResult:
        # Get or create sandbox
        sandbox = await self.get_or_create_sandbox()
        
        # Execute command
        result = await sandbox.execute(command)
        
        return self.success_response({
            "stdout": result.stdout,
            "stderr": result.stderr,
            "exit_code": result.exit_code
        })
```

---

## State Management

### Database (Supabase PostgreSQL)

**Tables:**

```sql
-- Threads (conversations)
CREATE TABLE threads (
    id UUID PRIMARY KEY,
    project_id UUID REFERENCES projects(id),
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);

-- Agent Runs (execution sessions)
CREATE TABLE agent_runs (
    id UUID PRIMARY KEY,
    thread_id UUID REFERENCES threads(id),
    status VARCHAR,  -- 'running', 'completed', 'failed', 'stopped'
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    agent_id UUID,
    agent_version_id UUID,
    metadata JSONB
);

-- Messages (conversation history)
CREATE TABLE messages (
    id UUID PRIMARY KEY,
    thread_id UUID REFERENCES threads(id),
    role VARCHAR,  -- 'user', 'assistant', 'system', 'tool'
    content TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ
);
```

### Redis (Ephemeral State)

**Response Storage Pattern:**
```python
# Worker writes responses incrementally
await redis.rpush(f"agent_run:{run_id}:responses", json.dumps(response))

# Frontend reads all responses
responses = await redis.lrange(f"agent_run:{run_id}:responses", 0, -1)

# Set TTL after completion (24 hours)
await redis.expire(f"agent_run:{run_id}:responses", 86400)
```

**Why Redis Lists?**
- ✅ Append-only (rpush is O(1))
- ✅ Range queries (lrange for pagination)
- ✅ Atomic operations
- ✅ Ephemeral (auto-cleanup with TTL)

---

## Error Handling & Recovery

### Worker Crashes

**Problem:** Worker dies mid-execution

**Solution:** Status in database
```python
# On startup, find orphaned runs
orphaned_runs = await client.table('agent_runs')\
    .select('*')\
    .eq('status', 'running')\
    .lt('started_at', cutoff_time)\
    .execute()

for run in orphaned_runs:
    await update_agent_run_status(client, run['id'], 'failed', 
                                   error='Worker crashed')
```

### Redis Connection Pool Exhaustion

**Problem:** 16 workers × 1000 operations = 16,000 concurrent Redis ops

**Solution:** Batched operations
```python
REDIS_BATCH_SIZE = 50

pending_operations = []
async for response in agent_gen:
    pending_operations.append(redis.rpush(...))
    pending_operations.append(redis.publish(...))
    
    # Flush every 50 operations
    if len(pending_operations) >= REDIS_BATCH_SIZE:
        await asyncio.gather(*pending_operations, return_exceptions=True)
        pending_operations = []
```

### Idempotency

**Problem:** Network retry causes duplicate task execution

**Solution:** Lock-based idempotency
```python
# Try to acquire lock
lock_key = f"agent_run_lock:{agent_run_id}"
acquired = await redis.set(lock_key, instance_id, nx=True, ex=3600)

if not acquired:
    logger.info("Task already being processed")
    return  # Skip execution
```

---

## Performance Optimization

### Connection Pooling

```python
# Redis connection pool
max_connections = 256
socket_timeout = 15.0
health_check_interval = 30

# Database connection pool
DBConnection.client  # Reuses single Supabase client
```

### Batching Strategy

| Operation | Batch Size | Flush Trigger |
|-----------|-----------|---------------|
| Redis publish | 50 | Every 50 messages |
| Redis rpush | 50 | Every 50 messages |
| Database inserts | 100 | Every 100 messages or 5 seconds |

### Streaming Optimization

**Problem:** Fetching all responses on every new message is wasteful

**Solution:** Track last index
```python
last_processed_index = -1

async for message in pubsub.listen():
    # Only fetch new responses since last index
    new_responses = await redis.lrange(
        response_list_key,
        last_processed_index + 1,
        -1
    )
    last_processed_index += len(new_responses)
```

---

## Monitoring & Observability

### Logging

```python
from core.utils.logger import logger, structlog

# Bind context variables
structlog.contextvars.bind_contextvars(
    agent_run_id=agent_run_id,
    thread_id=thread_id,
    user_id=user_id
)

# All subsequent logs include context
logger.info("Agent run started")
# Output: {"message": "Agent run started", "agent_run_id": "...", "thread_id": "..."}
```

### Tracing (Langfuse)

```python
# Create trace
trace = langfuse.trace(
    name="agent_run",
    metadata={"agent_run_id": agent_run_id}
)

# Span for each step
span = trace.span(name="tool_execution")
span.end(status_message="Tool executed successfully")

# Generation for LLM calls
generation = trace.generation(
    model=model_name,
    input=messages,
    output=response
)
```

### Health Checks

```python
@dramatiq.actor
async def check_health(key: str):
    await redis.set(key, "healthy", ex=3600)

# Monitor worker health
health_key = f"worker_health:{instance_id}"
check_health.send(health_key)
```

---

## Configuration

### Environment Variables

```bash
# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Database
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx

# API Keys
OPENAI_API_KEY=sk-xxx
ANTHROPIC_API_KEY=sk-xxx
SERPER_API_KEY=xxx  # Optional (worker starts without it)

# Langfuse (optional - uses MockTrace if missing)
LANGFUSE_PUBLIC_KEY=pk-xxx
LANGFUSE_SECRET_KEY=sk-xxx
```

### Worker Configuration

```python
# Start workers
uv run dramatiq \
  --processes 4 \      # Number of processes
  --threads 4 \        # Threads per process
  run_agent_background

# Total concurrent workers: 4 × 4 = 16
```

---

## Example: Complete Flow

### 1. User Sends Message

```bash
curl -X POST http://localhost:8000/api/agent-run \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "thread_id": "thread-123",
    "model_name": "openai/gpt-4o",
    "message": "Write a Python script"
  }'
```

**Response:**
```json
{
  "agent_run_id": "run-456",
  "status": "running"
}
```

### 2. API Server Actions

```python
# 1. Database insert
INSERT INTO agent_runs (id, thread_id, status, started_at)
VALUES ('run-456', 'thread-123', 'running', NOW())

# 2. Redis instance tracking
SET active_run:single:run-456 "running" EX 86400

# 3. Enqueue task
LPUSH "dramatiq:run_agent_background.tasks" '{
  "agent_run_id": "run-456",
  "thread_id": "thread-123",
  ...
}'
```

### 3. Worker Execution

```python
# Worker picks up task from Redis queue
task = await redis_broker.dequeue()

# Acquire lock
SET agent_run_lock:run-456 "worker-abc123" NX EX 86400

# Run agent
async for response in run_agent(config):
    # Response: {"type": "message", "content": "Here's the script:..."}
    
    # Store in Redis
    RPUSH agent_run:run-456:responses '{"type": "message", ...}'
    
    # Notify subscribers
    PUBLISH agent_run:run-456:new_response "new"

# Update database
UPDATE agent_runs SET status = 'completed', completed_at = NOW()
WHERE id = 'run-456'

# Send completion signal
PUBLISH agent_run:run-456:control "END_STREAM"

# Cleanup
DEL agent_run_lock:run-456
EXPIRE agent_run:run-456:responses 86400
```

### 4. Frontend Streams

```typescript
const eventSource = new EventSource(
  '/api/agent-run/run-456/stream?token=' + token
);

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
  // {"type": "message", "content": "Here's the script:..."}
};
```

**Server sends:**
```
data: {"type": "message", "content": "Here's the script:..."}

data: {"type": "status", "status": "completed"}

```

---

## Key Takeaways

### Architecture Principles

1. **Separation of Concerns**
   - API server: HTTP handling, streaming
   - Worker: Heavy computation, tool execution
   - Redis: Message passing, ephemeral state
   - Database: Persistent state

2. **Scalability**
   - Horizontal: Add more worker processes
   - Vertical: Increase threads per process
   - Connection pooling prevents resource exhaustion

3. **Reliability**
   - Idempotency locks prevent duplicate execution
   - Status tracking in database enables recovery
   - Graceful degradation (MockTrace, optional API keys)

4. **Performance**
   - Batched Redis operations (50 messages)
   - Incremental streaming (fetch only new responses)
   - Connection reuse (pools for Redis & DB)

### Common Pitfalls Avoided

❌ **Don't:** Execute agent in API request handler  
✅ **Do:** Enqueue task, return immediately, stream separately

❌ **Don't:** Accumulate all Redis ops then execute  
✅ **Do:** Batch flush every 50 operations

❌ **Don't:** Poll database for new responses  
✅ **Do:** Use Redis pub/sub for real-time notifications

❌ **Don't:** Re-fetch all responses on every update  
✅ **Do:** Track last index, fetch only new responses

---

**Last Updated:** October 4, 2025  
**Architecture Version:** 2.0 (Post-Redis batching optimization)
