'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Clock,
  X,
  Trash2,
  ExternalLink,
  Edit2,
  Activity,
  Sparkles,
  Calendar as CalendarIcon,
  Zap,
  Timer,
  Target,
  Repeat,
  Play,
  Pause
} from 'lucide-react';
import Link from 'next/link';
import { TriggerWithAgent } from '@/hooks/react-query/triggers/use-all-triggers';
import { useDeleteTrigger, useToggleTrigger, useUpdateTrigger } from '@/hooks/react-query/triggers';
import { TriggerCreationDialog } from './trigger-creation-dialog';
import { useAgentWorkflows } from '@/hooks/react-query/agents/use-agent-workflows';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { AgentAvatar } from '@/components/thread/content/agent-avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface SimplifiedTriggerDetailPanelProps {
  trigger: TriggerWithAgent;
  onClose: () => void;
}

const SCHEDULE_PRESETS = [
  { cron: '*/15 * * * *', name: 'Every 15 minutes', icon: <Zap className="h-4 w-4" /> },
  { cron: '*/30 * * * *', name: 'Every 30 minutes', icon: <Timer className="h-4 w-4" /> },
  { cron: '0 * * * *', name: 'Every hour', icon: <Timer className="h-4 w-4" /> },
  { cron: '0 9 * * *', name: 'Daily at 9 AM', icon: <Target className="h-4 w-4" /> },
  { cron: '0 9 * * 1-5', name: 'Weekdays at 9 AM', icon: <CalendarIcon className="h-4 w-4" /> },
  { cron: '0 9 * * 1', name: 'Weekly on Monday', icon: <Repeat className="h-4 w-4" /> },
  { cron: '0 9 1 * *', name: 'Monthly on 1st', icon: <CalendarIcon className="h-4 w-4" /> },
];

const SECTION_CLASS = 'rounded-2xl border border-border/40 bg-background/60 px-5 py-5 shadow-[0_22px_48px_-32px_rgba(15,23,42,0.55)] backdrop-blur-lg';

const getScheduleDisplay = (cron?: string) => {
  if (!cron) return { name: 'Not configured', icon: <Clock className="h-4 w-4" /> };

  const preset = SCHEDULE_PRESETS.find(p => p.cron === cron);
  if (preset) return preset;

  return { name: cron, icon: <Clock className="h-4 w-4" /> };
};

export function SimplifiedTriggerDetailPanel({ trigger, onClose }: SimplifiedTriggerDetailPanelProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const deleteMutation = useDeleteTrigger();
  const toggleMutation = useToggleTrigger();
  const updateMutation = useUpdateTrigger();

  const { data: workflows = [] } = useAgentWorkflows(trigger.agent_id);
  const workflowName = workflows.find(w => w.id === trigger.config?.workflow_id)?.name;

  const isScheduled = trigger.trigger_type.toLowerCase() === 'schedule' || trigger.trigger_type.toLowerCase() === 'scheduled';
  const scheduleDisplay = getScheduleDisplay(trigger.config?.cron_expression);

  const handleToggle = async () => {
    try {
      await toggleMutation.mutateAsync({
        triggerId: trigger.trigger_id,
        isActive: !trigger.is_active,
      });
      toast.success(`Task ${!trigger.is_active ? 'enabled' : 'disabled'}`);
    } catch (error) {
      toast.error('Failed to toggle task');
      console.error('Error toggling task:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync({
        triggerId: trigger.trigger_id,
        agentId: trigger.agent_id
      });
      toast.success('Task deleted successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to delete task');
      console.error('Error deleting task:', error);
    }
  };

  const handleEditSave = async (config: any) => {
    try {
      await updateMutation.mutateAsync({
        triggerId: trigger.trigger_id,
        name: config.name,
        description: config.description,
        config: config.config,
        is_active: config.is_active,
      });
      toast.success('Task updated successfully');
      setShowEditDialog(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update task');
      console.error('Error updating task:', error);
    }
  };

  const isLoading = deleteMutation.isPending || toggleMutation.isPending || updateMutation.isPending;

  const provider = {
    provider_id: isScheduled ? 'schedule' : trigger.provider_id,
    name: trigger.name,
    description: trigger.description || '',
    trigger_type: trigger.trigger_type,
    webhook_enabled: !!trigger.webhook_url,
    config_schema: {}
  };

  const triggerConfig = {
    trigger_id: trigger.trigger_id,
    agent_id: trigger.agent_id,
    trigger_type: trigger.trigger_type,
    provider_id: trigger.provider_id,
    name: trigger.name,
    description: trigger.description,
    is_active: trigger.is_active,
    webhook_url: trigger.webhook_url,
    created_at: trigger.created_at,
    updated_at: trigger.updated_at,
    config: trigger.config
  };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden p-6">
      <div className="relative overflow-hidden rounded-[28px] border border-border/50 bg-gradient-to-br from-background/95 via-background/80 to-background/60 p-6 shadow-[0_30px_70px_-32px_rgba(15,23,42,0.6)]">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-transparent opacity-70" />
        <div className="relative flex flex-col gap-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  {trigger.name}
                </h1>
                <Badge
                  variant={trigger.is_active ? 'highlight' : 'secondary'}
                  className="text-[11px]"
                >
                  {trigger.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              {trigger.description && (
                <p className="max-w-xl text-sm text-muted-foreground/90 leading-relaxed">
                  {trigger.description}
                </p>
              )}
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground/70">
                <span className="rounded-full border border-border/40 bg-background/70 px-3 py-1 font-medium uppercase tracking-wide">
                  {trigger.trigger_type}
                </span>
                {trigger.provider_id && (
                  <span className="rounded-full border border-border/40 bg-background/70 px-3 py-1 font-medium uppercase tracking-wide">
                    {trigger.provider_id}
                  </span>
                )}
                {isScheduled && scheduleDisplay?.name && (
                  <span className="rounded-full border border-border/40 bg-primary/10 px-3 py-1 font-medium uppercase tracking-wide text-primary">
                    {scheduleDisplay.name}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowEditDialog(true)}
                className="rounded-xl border-border/40 bg-background/60 px-4 py-2 text-sm font-medium transition-colors hover:border-border/60 hover:bg-muted/40"
              >
                <Edit2 className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowDeleteDialog(true)}
                disabled={isLoading}
                className="rounded-xl border-border/40 bg-background/60 px-3 py-2 text-sm font-medium transition-colors hover:border-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-xl border border-transparent text-muted-foreground transition-colors hover:border-border/60 hover:bg-muted/30"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              size="sm"
              variant={trigger.is_active ? 'outline' : 'default'}
              onClick={handleToggle}
              disabled={isLoading}
              className={cn(
                'flex-1 rounded-xl border-border/40 px-4 py-2 text-sm font-medium shadow-[0_16px_32px_-28px_rgba(15,23,42,0.45)] transition-all',
                trigger.is_active
                  ? 'bg-background/70 text-foreground hover:bg-muted/40'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
              )}
            >
              {trigger.is_active ? (
                <>
                  <Pause className="mr-2 h-4 w-4" />
                  Disable trigger
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Enable trigger
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="flex h-full flex-col gap-5 overflow-y-auto pr-2">
          {isScheduled && (
            <section className={SECTION_CLASS}>
              <div className="flex items-start gap-4">
                <div className="rounded-xl border border-border/30 bg-primary/10 p-3 text-primary shadow-[0_12px_24px_-22px_rgba(14,116,144,0.55)]">
                  <Clock className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground/80">Schedule</h3>
                  <p className="mt-1 text-base font-medium text-foreground">{scheduleDisplay.name}</p>
                  <p className="mt-2 text-xs text-muted-foreground/80">
                    Configure cadence in the trigger settings to adjust frequency or timing.
                  </p>
                </div>
              </div>
            </section>
          )}

          <section className={SECTION_CLASS}>
            <div className="flex items-start gap-4">
              <div className="rounded-xl border border-border/30 bg-muted/40 p-3 text-muted-foreground">
                {trigger.config?.execution_type === 'agent' ? (
                  <Sparkles className="h-5 w-5" />
                ) : (
                  <Activity className="h-5 w-5" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground/80">
                  {trigger.config?.execution_type === 'agent' ? 'Agent instructions' : 'Workflow execution'}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground/90">
                  {trigger.config?.execution_type === 'agent'
                    ? 'Custom prompt sent to the assigned agent whenever this trigger runs.'
                    : `Runs workflow: ${workflowName || 'Unknown workflow'}`}
                </p>

                {trigger.config?.execution_type === 'agent' && trigger.config.agent_prompt && (
                  <div className="mt-4 rounded-2xl border border-border/30 bg-background/70 p-4 shadow-inner">
                    <p className="whitespace-pre-wrap text-sm font-mono leading-relaxed text-foreground/90">
                      {trigger.config.agent_prompt}
                    </p>
                  </div>
                )}

                {trigger.config?.execution_type === 'workflow' && trigger.config.workflow_input && (
                  <div className="mt-4 rounded-2xl border border-border/30 bg-background/70 p-4 shadow-inner">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground/80">
                      Workflow input
                    </p>
                    <pre className="max-h-48 overflow-auto text-xs font-mono text-foreground/90">
                      {JSON.stringify(trigger.config.workflow_input, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className={SECTION_CLASS}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <AgentAvatar
                  agentId={trigger.agent_id}
                  size={44}
                  fallbackName={trigger.agent_name}
                />
                <div>
                  <h3 className="text-base font-semibold text-foreground">{trigger.agent_name || 'Unknown Agent'}</h3>
                  <p className="text-sm text-muted-foreground/80">Assigned agent</p>
                </div>
              </div>
              <Link
                href={`/agents/config/${trigger.agent_id}`}
                className="rounded-xl border border-border/40 bg-background/70 p-2 text-muted-foreground transition-all hover:border-border/60 hover:bg-primary/10 hover:text-primary"
              >
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          </section>

          <section className={SECTION_CLASS}>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground/80">Technical details</h3>
            <div className="mt-4 space-y-3">
              {[{
                label: 'Type',
                value: trigger.trigger_type
              }, {
                label: 'Provider',
                value: trigger.provider_id
              }, {
                label: 'Created',
                value: new Date(trigger.created_at).toLocaleDateString()
              }, {
                label: 'Last updated',
                value: new Date(trigger.updated_at).toLocaleDateString()
              }].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex items-center justify-between rounded-xl border border-border/20 bg-background/50 px-4 py-3 text-sm"
                >
                  <span className="text-muted-foreground/80">{label}</span>
                  <span className="font-mono text-foreground/90">{value || '—'}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Edit Dialog */}
      {showEditDialog && (
        <TriggerCreationDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          type={isScheduled ? 'schedule' : 'event'}
          isEditMode={true}
          existingTrigger={triggerConfig}
          onTriggerUpdated={handleEditSave}
        />
      )}

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="border border-border/60 bg-background/95 backdrop-blur">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground font-medium">Delete Task</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete "{trigger.name}"? This action cannot be undone and will stop all automated runs from this task.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="hover:bg-muted">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Delete Task
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
