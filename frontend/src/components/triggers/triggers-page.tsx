"use client";

import React, { useMemo, useState, useEffect } from 'react';
import MobileSidebarToggle from '@/components/layout/MobileSidebarToggle';
import { useAllTriggers, type TriggerWithAgent } from '@/hooks/react-query/triggers/use-all-triggers';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MessageSquare,
  Github,
  Slack,
  Clock,
  AlertCircle,
  Zap,
  Hash,
  Globe,
  Sparkles,
  Plus,
  PlugZap,
  Webhook,
  Repeat,
  Search,
  FilterX,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TriggerCreationDialog } from './trigger-creation-dialog';
import { SimplifiedTriggerDetailPanel } from './simplified-trigger-detail-panel';
import { TriggersPageHeader } from './triggers-page-header';

const PANEL_CLASS = 'rounded-3xl border border-border/60 bg-card/80 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.65)] backdrop-blur-xl';
const METRIC_CARD_CLASS = 'rounded-2xl border border-border/30 bg-background/60 px-4 py-3 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.55)] backdrop-blur-sm';

const getTriggerIcon = (triggerType: string) => {
  switch (triggerType.toLowerCase()) {
    case 'schedule':
    case 'scheduled':
      return Repeat;
    case 'telegram':
      return MessageSquare;
    case 'github':
      return Github;
    case 'slack':
      return Slack;
    case 'webhook':
      return Webhook;
    case 'discord':
      return Hash;
    case 'event':
      return Sparkles;
    default:
      return Globe;
  }
};

const getTriggerCategory = (triggerType: string): 'scheduled' | 'app' => {
  const scheduledTypes = ['schedule', 'scheduled'];
  return scheduledTypes.includes(triggerType.toLowerCase()) ? 'scheduled' : 'app';
};

const formatCronExpression = (cron?: string) => {
  if (!cron) return 'Not configured';

  const parts = cron.split(' ');
  if (parts.length !== 5) return cron;

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

  if (minute === '0' && hour === '0' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
    return 'Daily at midnight';
  }
  if (minute === '0' && hour === '*/1' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
    return 'Every hour';
  }
  if (minute === '*/15' && hour === '*' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
    return 'Every 15 minutes';
  }
  if (minute === '*/30' && hour === '*' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
    return 'Every 30 minutes';
  }
  if (minute === '0' && hour === '9' && dayOfMonth === '*' && month === '*' && dayOfWeek === '1-5') {
    return 'Weekdays at 9 AM';
  }
  if (minute === '0' && hour === String(hour) && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
    return `Daily at ${hour}:${minute.padStart(2, '0')}`;
  }

  return cron;
};

const TriggerListItem = ({
  trigger,
  onClick,
  isSelected,
}: {
  trigger: TriggerWithAgent;
  onClick: () => void;
  isSelected: boolean;
}) => {
  const Icon = getTriggerIcon(trigger.trigger_type);
  const isScheduled = getTriggerCategory(trigger.trigger_type) === 'scheduled';

  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative flex items-center justify-between gap-4 rounded-2xl border border-border/40 bg-background/60 px-5 py-4 text-sm transition-all duration-200 backdrop-blur-md shadow-[0_18px_44px_-32px_rgba(15,23,42,0.55)]',
        isSelected
          ? 'border-primary/40 bg-primary/10 shadow-[0_26px_52px_-30px_rgba(14,116,144,0.5)]'
          : 'hover:-translate-y-0.5 hover:border-border/60 hover:shadow-[0_28px_60px_-32px_rgba(15,23,42,0.6)]'
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-gradient-to-br from-muted/40 via-muted/20 to-background text-foreground/70 shadow-[0_14px_28px_-30px_rgba(15,23,42,0.65)]">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold text-foreground">{trigger.name}</span>
            <Badge
              variant={trigger.is_active ? 'highlight' : 'secondary'}
              className="text-[11px]"
            >
              {trigger.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          {trigger.description && (
            <p className="mt-0.5 truncate text-xs text-muted-foreground/80">
              {trigger.description}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 text-xs text-muted-foreground/80">
        {isScheduled && trigger.config?.cron_expression && (
          <span className="hidden sm:block">
            {formatCronExpression(trigger.config.cron_expression)}
          </span>
        )}
        <Repeat className="h-3.5 w-3.5 text-muted-foreground/70" />
      </div>
    </div>
  );
};

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/40 bg-muted/10 px-8 py-16 text-center backdrop-blur">
    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-border/40 bg-muted/40 text-muted-foreground">
      <Zap className="h-6 w-6" />
    </div>
    <h3 className="mb-2 text-base font-semibold text-foreground">Get started by adding a trigger</h3>
    <p className="max-w-sm text-sm text-muted-foreground/90">
      Schedule automations or connect events to keep your agents running on autopilot.
    </p>
  </div>
);

const FilteredEmptyState = ({ onReset }: { onReset: () => void }) => (
  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/40 bg-muted/10 px-8 py-14 text-center backdrop-blur">
    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-border/40 bg-muted/40 text-muted-foreground">
      <FilterX className="h-6 w-6" />
    </div>
    <h3 className="mb-2 text-base font-semibold text-foreground">No triggers match your filters</h3>
    <p className="mb-5 max-w-sm text-sm text-muted-foreground/90">
      Adjust your search or switch the category filter to continue exploring triggers.
    </p>
    <Button
      variant="outline"
      size="sm"
      onClick={onReset}
      className="rounded-xl border-border/60 bg-background/80 px-4 py-2 text-sm font-medium shadow-[0_14px_32px_-24px_rgba(15,23,42,0.35)] transition-all hover:border-border/70 hover:bg-primary/10 hover:text-primary"
    >
      Clear filters
    </Button>
  </div>
);

const LoadingSkeleton = () => (
  <div className="space-y-3">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="rounded-2xl border border-border/40 bg-muted/10 px-5 py-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    ))}
  </div>
);

export function TriggersPage() {
  const { data: triggers = [], isLoading, error } = useAllTriggers();
  const [selectedTrigger, setSelectedTrigger] = useState<TriggerWithAgent | null>(null);
  const [triggerDialogType, setTriggerDialogType] = useState<'schedule' | 'event' | null>(null);
  const [pendingTriggerId, setPendingTriggerId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'scheduled' | 'app'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filterCounts = useMemo(() => {
    const scheduledCount = triggers.filter((trigger) => getTriggerCategory(trigger.trigger_type) === 'scheduled').length;
    return {
      all: triggers.length,
      scheduled: scheduledCount,
      app: triggers.length - scheduledCount,
    } as const;
  }, [triggers]);

  const activeCount = useMemo(() => triggers.filter((trigger) => trigger.is_active).length, [triggers]);

  const displayedTriggers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const filtered = triggers.filter((trigger) => {
      if (filterType !== 'all' && getTriggerCategory(trigger.trigger_type) !== filterType) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const haystack = [trigger.name, trigger.description, trigger.agent_name, trigger.trigger_type]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(normalizedSearch);
    });

    return filtered.sort((a, b) => {
      if (a.is_active !== b.is_active) {
        return a.is_active ? -1 : 1;
      }
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });
  }, [triggers, filterType, searchTerm]);

  const groupedTriggers = useMemo(() => {
    const groups = {
      scheduled: {
        key: 'scheduled',
        label: 'Scheduled automations',
        description: 'Recurring runs that keep your agents active on a timetable.',
        triggers: [] as TriggerWithAgent[],
      },
      app: {
        key: 'app',
        label: 'App & event-based triggers',
        description: 'External signals and webhooks that launch tailored workflows.',
        triggers: [] as TriggerWithAgent[],
      },
    } as const;

    displayedTriggers.forEach((trigger) => {
      const category = getTriggerCategory(trigger.trigger_type);
      groups[category].triggers.push(trigger);
    });

    if (filterType === 'scheduled') {
      return groups.scheduled.triggers.length ? [groups.scheduled] : [];
    }

    if (filterType === 'app') {
      return groups.app.triggers.length ? [groups.app] : [];
    }

    return [groups.scheduled, groups.app].filter((group) => group.triggers.length > 0);
  }, [displayedTriggers, filterType]);

  useEffect(() => {
    if (pendingTriggerId) {
      const newTrigger = triggers.find((t) => t.trigger_id === pendingTriggerId);
      if (newTrigger) {
        setSelectedTrigger(newTrigger);
        setPendingTriggerId(null);
      }
    }
  }, [triggers, pendingTriggerId]);

  useEffect(() => {
    if (selectedTrigger) {
      const updatedTrigger = triggers.find((t) => t.trigger_id === selectedTrigger.trigger_id);
      if (updatedTrigger) {
        setSelectedTrigger(updatedTrigger);
      } else {
        setSelectedTrigger(null);
      }
    }
  }, [triggers, selectedTrigger]);

  useEffect(() => {
    if (selectedTrigger && !displayedTriggers.some((trigger) => trigger.trigger_id === selectedTrigger.trigger_id)) {
      setSelectedTrigger(null);
    }
  }, [displayedTriggers, selectedTrigger]);

  const handleClosePanel = () => {
    setSelectedTrigger(null);
  };

  const handleTriggerCreated = (triggerId: string) => {
    setTriggerDialogType(null);
    setPendingTriggerId(triggerId);
  };

  if (error) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-background via-background/95 to-background">
        <div className="pointer-events-none absolute inset-x-0 top-[-220px] h-[360px] bg-gradient-to-b from-destructive/15 via-destructive/8 to-transparent blur-3xl" />
        <div className="relative mx-auto flex min-h-screen w-full max-w-4xl flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load triggers. Please try refreshing the page.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-background via-background/95 to-background">
      <div className="pointer-events-none absolute inset-x-0 top-[-220px] h-[360px] bg-gradient-to-b from-primary/15 via-primary/5 to-transparent blur-3xl" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-10 px-4 pb-20 pt-12 sm:px-6 lg:px-8">
        <TriggersPageHeader />

        <div className="flex flex-1 flex-col gap-6 lg:flex-row">
          <div className="flex-1 space-y-6">
            <div className={cn(PANEL_CLASS, 'p-6')}>
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-3">
                  <div className="-ml-1 md:hidden">
                    <MobileSidebarToggle />
                  </div>
                  <div className="text-left">
                    <h2 className="text-base font-semibold text-foreground sm:text-lg">Automation overview</h2>
                    <p className="text-sm text-muted-foreground/80">
                      Monitor recent activity and manage trigger schedules for your agents.
                    </p>
                  </div>
                </div>
                <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                  <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
                    <div className="relative w-full sm:w-64">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                      <Input
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        placeholder="Search triggers"
                        className="h-10 rounded-xl border-border/60 bg-background/80 pl-9 text-sm shadow-[0_14px_32px_-24px_rgba(15,23,42,0.35)] backdrop-blur-sm focus-visible:border-border/70"
                        aria-label="Search triggers"
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {[
                        { label: 'All', value: 'all' as const },
                        { label: 'Scheduled', value: 'scheduled' as const },
                        { label: 'App & event', value: 'app' as const },
                      ].map((option) => (
                        <Button
                          key={option.value}
                          size="sm"
                          variant={filterType === option.value ? 'secondary' : 'ghost'}
                          onClick={() => setFilterType(option.value)}
                          className={cn(
                            'rounded-full border border-transparent px-4 py-2 text-sm font-medium transition-all',
                            filterType === option.value
                              ? 'border-primary/40 bg-primary/10 text-primary shadow-[0_16px_36px_-24px_rgba(14,116,144,0.45)]'
                              : 'text-muted-foreground/80 hover:border-border/50 hover:bg-primary/10 hover:text-primary'
                          )}
                        >
                          <span>{option.label}</span>
                          <span className="ml-2 rounded-full bg-muted/50 px-2 py-0.5 text-[11px] font-semibold text-muted-foreground/80">
                            {filterCounts[option.value]}
                          </span>
                        </Button>
                      ))}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 rounded-xl border-border/50 bg-background/80 px-4 py-2 text-sm font-medium shadow-[0_14px_32px_-24px_rgba(15,23,42,0.35)] transition-all hover:border-border/60 hover:bg-primary/10 hover:text-primary"
                      >
                        <Plus className="h-4 w-4" />
                        New trigger
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-72 rounded-2xl border-border/40 bg-background/95 p-2">
                      <DropdownMenuItem
                        onClick={() => setTriggerDialogType('schedule')}
                        className="rounded-xl"
                      >
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div className="flex flex-col">
                          <span>Scheduled Trigger</span>
                          <span className="text-xs text-muted-foreground">
                            Run automations on a recurring schedule
                          </span>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setTriggerDialogType('event')}
                        className="rounded-xl"
                      >
                        <PlugZap className="h-4 w-4 text-muted-foreground" />
                        <div className="flex flex-col">
                          <span>Event-based Trigger</span>
                          <span className="text-xs text-muted-foreground">
                            Launch workflows when external events fire
                          </span>
                        </div>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <div className={cn(METRIC_CARD_CLASS, 'flex items-center justify-between')}>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground/70">Active triggers</p>
                    <p className="text-xl font-semibold text-foreground">{activeCount}</p>
                  </div>
                  <Badge variant="outline" className="rounded-full border-border/50 bg-background/70 text-[11px]">
                    {filterCounts.all ? `${Math.round((activeCount / filterCounts.all) * 100)}% active` : '—'}
                  </Badge>
                </div>
                <div className={cn(METRIC_CARD_CLASS, 'flex items-center justify-between')}>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground/70">Scheduled</p>
                    <p className="text-xl font-semibold text-foreground">{filterCounts.scheduled}</p>
                  </div>
                  <Badge variant="secondary" className="rounded-full bg-primary/10 text-primary">
                    {filterCounts.all ? `${Math.round((filterCounts.scheduled / filterCounts.all) * 100)}%` : '—'}
                  </Badge>
                </div>
                <div className={cn(METRIC_CARD_CLASS, 'flex flex-col justify-between space-y-1 xl:space-y-2')}>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground/70">App & event</p>
                    <p className="text-xl font-semibold text-foreground">{filterCounts.app}</p>
                  </div>
                  <p className="text-xs text-muted-foreground/70">
                    {filterCounts.all ? `${filterCounts.app} of ${filterCounts.all} total` : 'No triggers yet'}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                {isLoading ? (
                  <LoadingSkeleton />
                ) : displayedTriggers.length === 0 ? (
                  triggers.length === 0 ? (
                    <EmptyState />
                  ) : (
                    <FilteredEmptyState
                      onReset={() => {
                        setFilterType('all');
                        setSearchTerm('');
                      }}
                    />
                  )
                ) : (
                  <div className="space-y-6">
                    {groupedTriggers.map((group) => (
                      <div key={group.key} className="space-y-3">
                        {filterType === 'all' && (
                          <div className="flex flex-col gap-1">
                            <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground/70">
                              {group.label}
                            </h4>
                            <p className="text-xs text-muted-foreground/70">{group.description}</p>
                          </div>
                        )}

                        <div className="space-y-3">
                          {group.triggers.map((trigger) => (
                            <TriggerListItem
                              key={trigger.trigger_id}
                              trigger={trigger}
                              isSelected={selectedTrigger?.trigger_id === trigger.trigger_id}
                              onClick={() => {
                                if (selectedTrigger?.trigger_id === trigger.trigger_id) {
                                  setSelectedTrigger(null);
                                } else {
                                  setSelectedTrigger(trigger);
                                }
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div
            className={cn(
              'transition-all duration-300',
              selectedTrigger ? 'block w-full lg:w-[420px] xl:w-[460px]' : 'hidden lg:block lg:w-[420px] xl:w-[460px]'
            )}
          >
            {selectedTrigger ? (
              <div className={cn(PANEL_CLASS, 'h-full overflow-hidden p-0')}>
                <SimplifiedTriggerDetailPanel
                  trigger={selectedTrigger}
                  onClose={handleClosePanel}
                />
              </div>
            ) : (
              <div className={cn(PANEL_CLASS, 'flex h-full min-h-[320px] items-center justify-center p-10 text-center text-sm text-muted-foreground/70')}>
                Select a trigger to view its schedule, assignments, and activity history.
              </div>
            )}
          </div>
        </div>
      </div>

      {triggerDialogType && (
        <TriggerCreationDialog
          open={!!triggerDialogType}
          onOpenChange={(open) => {
            if (!open) {
              setTriggerDialogType(null);
            }
          }}
          type={triggerDialogType}
          onTriggerCreated={handleTriggerCreated}
        />
      )}
    </div>
  );
}