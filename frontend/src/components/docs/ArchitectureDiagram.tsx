'use client'

import React, { useMemo } from 'react'
import ReactFlow, { Background, Controls, MiniMap, Node, Edge, MarkerType, NodeProps, Handle, Position } from 'reactflow'
import 'reactflow/dist/style.css'

type Props = { className?: string }

const BoxNode = ({ id, data }: NodeProps<{ label: string }>) => {
  return (
    <div
      className="rounded-2xl border bg-card text-foreground text-sm px-5 py-4 shadow-md min-w-[300px] min-h-[84px] flex items-center justify-center text-center select-none"
      style={{
        border: '1.5px solid hsl(var(--border))',
        background: 'hsl(var(--card))',
        color: 'hsl(var(--foreground))',
        boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
      }}
    >
      {/* Positioned handles to separate parallel flows */}
      {id === 'ui' && (
        <>
          <Handle id="ui-http-out" type="source" position={Position.Right} style={{ top: '40%', width: 10, height: 10 }} isConnectable={false} />
          <Handle id="ui-sse-in" type="target" position={Position.Left} style={{ top: '60%', width: 10, height: 10 }} isConnectable={false} />
        </>
      )}
      {id === 'api' && (
        <>
          <Handle id="api-http-in" type="target" position={Position.Left} style={{ top: '40%', width: 10, height: 10 }} isConnectable={false} />
          <Handle id="api-sse-out" type="source" position={Position.Left} style={{ top: '60%', width: 10, height: 10 }} isConnectable={false} />
          <Handle id="api-to-supabase" type="source" position={Position.Right} style={{ top: '50%', width: 10, height: 10 }} isConnectable={false} />
          <Handle id="api-enqueue" type="source" position={Position.Bottom} style={{ left: '50%', width: 10, height: 10 }} isConnectable={false} />
          <Handle id="api-top-in-left" type="target" position={Position.Top} style={{ left: '35%', width: 10, height: 10 }} isConnectable={false} />
          <Handle id="api-top-in-right" type="target" position={Position.Top} style={{ left: '65%', width: 10, height: 10 }} isConnectable={false} />
        </>
      )}
      {id === 'supabase' && (
        <Handle id="supabase-in" type="target" position={Position.Left} style={{ top: '50%', width: 10, height: 10 }} isConnectable={false} />
      )}
      {id === 'redis' && (
        <>
          <Handle id="redis-enqueue" type="target" position={Position.Top} style={{ left: '50%', width: 10, height: 10 }} isConnectable={false} />
          <Handle id="redis-consume-left" type="source" position={Position.Bottom} style={{ left: '35%', width: 10, height: 10 }} isConnectable={false} />
          <Handle id="redis-consume-right" type="source" position={Position.Bottom} style={{ left: '65%', width: 10, height: 10 }} isConnectable={false} />
        </>
      )}
      {id === 'worker1' && (
        <>
          <Handle id="w1-from-redis" type="target" position={Position.Top} style={{ left: '50%', width: 10, height: 10 }} isConnectable={false} />
          <Handle id="w1-to-tools" type="source" position={Position.Right} style={{ top: '50%', width: 10, height: 10 }} isConnectable={false} />
          <Handle id="w1-to-api" type="source" position={Position.Top} style={{ left: '35%', width: 10, height: 10 }} isConnectable={false} />
        </>
      )}
      {id === 'workerN' && (
        <>
          <Handle id="wn-from-redis" type="target" position={Position.Top} style={{ left: '50%', width: 10, height: 10 }} isConnectable={false} />
          <Handle id="wn-to-daytona" type="source" position={Position.Right} style={{ top: '50%', width: 10, height: 10 }} isConnectable={false} />
          <Handle id="wn-to-api" type="source" position={Position.Top} style={{ left: '65%', width: 10, height: 10 }} isConnectable={false} />
        </>
      )}
      {id === 'tools' && (
        <Handle id="tools-in" type="target" position={Position.Left} style={{ top: '50%', width: 10, height: 10 }} isConnectable={false} />
      )}
      {id === 'daytona' && (
        <Handle id="daytona-in" type="target" position={Position.Left} style={{ top: '50%', width: 10, height: 10 }} isConnectable={false} />
      )}
      {data.label}
    </div>
  )
}

const nodeTypes = { box: BoxNode }

export default function ArchitectureDiagram({ className }: Props) {
  const nodes: Node[] = useMemo(
    () => [
      n('ui', 50, 40, 'Web / UI (Next.js)'),
      n('api', 320, 40, 'Backend API (FastAPI)'),
      n('supabase', 590, 40, 'Supabase (DB/Auth)'),
      n('redis', 320, 180, 'Redis (Queue + Pub/Sub)'),
      n('worker1', 130, 320, 'Worker #1 (Agent Run)'),
      n('workerN', 510, 320, 'Worker #N (Agent Run)'),
      n('tools', 130, 460, 'Tools / Integrations'),
      n('daytona', 510, 460, 'Daytona Sandbox'),
    ],
    []
  )

  const edges: Edge[] = useMemo(
    () => [
      // UI ⇨ API (HTTP)
      e('ui', 'api', 'HTTP', true, '#3b82f6', 'ui-http-out', 'api-http-in'),
      // API ⇨ UI (SSE/WebSocket)
      e('api', 'ui', 'SSE/WebSocket', true, '#3b82f6', 'api-sse-out', 'ui-sse-in'),

      // API ⇨ Supabase (Data)
      e('api', 'supabase', 'Data', false, '#6b7280', 'api-to-supabase', 'supabase-in'),

      // API ⇨ Redis (Enqueue) and Redis ⇨ Workers (Consume)
      e('api', 'redis', 'Enqueue', true, '#22c55e', 'api-enqueue', 'redis-enqueue'),
      e('redis', 'worker1', 'Consume', true, '#22c55e', 'redis-consume-left', 'w1-from-redis'),
      e('redis', 'workerN', 'Consume', true, '#22c55e', 'redis-consume-right', 'wn-from-redis'),

      // Workers ⇨ API (status stream)
      e('worker1', 'api', 'Stream/Status', false, '#3b82f6', 'w1-to-api', 'api-top-in-left'),
      e('workerN', 'api', 'Stream/Status', false, '#3b82f6', 'wn-to-api', 'api-top-in-right'),

      // Workers ⇨ Tools/Sandbox
      e('worker1', 'tools', 'Tool Calls', false, '#f59e0b', 'w1-to-tools', 'tools-in'),
      e('workerN', 'daytona', 'Isolated Exec', false, '#a78bfa', 'wn-to-daytona', 'daytona-in'),
    ],
    []
  )

  return (
    <div className={className} style={{ height: 520 }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={{
          type: 'smoothstep',
          markerEnd: { type: MarkerType.ArrowClosed, width: 18, height: 18, color: 'hsl(var(--muted-foreground))' },
          style: { stroke: 'hsl(var(--muted-foreground))', strokeWidth: 2 },
        }}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.5}
        maxZoom={1.75}
      >
        <MiniMap pannable zoomable />
        <Controls showInteractive={false} />
        <Background gap={16} size={1} />
      </ReactFlow>
    </div>
  )
}

function n(id: string, x: number, y: number, label: string): Node {
  return {
    id,
  type: 'box',
  data: { label },
    position: { x, y },
  draggable: false,
  selectable: false,
  connectable: false,
  }
}

function e(
  source: string,
  target: string,
  label?: string,
  animated?: boolean,
  color: string = '#6b7280',
  sourceHandle?: string,
  targetHandle?: string
): Edge {
  return {
    id: `${source}-${target}`,
    source,
    target,
    label,
  animated,
    type: 'smoothstep',
    markerEnd: { type: MarkerType.ArrowClosed, width: 18, height: 18, color },
    style: { stroke: color, strokeWidth: 2 },
    labelStyle: { fill: color, fontSize: 12, fontWeight: 500 },
    labelBgStyle: { fill: 'rgba(255,255,255,0.9)', stroke: 'rgba(0,0,0,0.05)' },
    labelBgPadding: [6, 6],
    labelBgBorderRadius: 6,
    sourceHandle,
    targetHandle,
  }}
