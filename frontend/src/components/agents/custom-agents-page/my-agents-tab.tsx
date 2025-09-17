'use client';

import React, { useState, useMemo } from 'react';
import { Globe } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DiscoverHeader } from '@/components/agents/discover/DiscoverHeader';
import { TabsNavigation } from './tabs-navigation';
import { SearchBar } from './search-bar';
import { EmptyState } from '../empty-state';
import { AgentsGrid } from '../agents-grid';
import { LoadingState } from '../loading-state';
import { Pagination } from '../pagination';
import { AgentCard } from './agent-card';

type AgentFilter = 'all' | 'templates';

interface MyAgentsTabProps {
  agentsSearchQuery: string;
  setAgentsSearchQuery: (value: string) => void;
  agentsLoading: boolean;
  agents: any[];
  agentsPagination: any;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  onCreateAgent: () => void;
  onEditAgent: (agentId: string) => void;
  onDeleteAgent: (agentId: string) => void;
  onToggleDefault: (agentId: string, currentDefault: boolean) => void;
  onClearFilters: () => void;
  deleteAgentMutation?: any;
  isDeletingAgent?: (agentId: string) => boolean;
  setAgentsPage: (page: number) => void;
  agentsPageSize: number;
  onAgentsPageSizeChange: (pageSize: number) => void;

  myTemplates: any[];
  templatesLoading: boolean;
  templatesError: any;
  templatesActioningId: string | null;
  templatesPagination?: {
    current_page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
  };
  templatesPage: number;
  setTemplatesPage: (page: number) => void;
  templatesPageSize: number;
  onTemplatesPageSizeChange: (pageSize: number) => void;
  templatesSearchQuery: string;
  setTemplatesSearchQuery: (value: string) => void;
  onPublish: (template: any) => void;
  onUnpublish: (templateId: string, templateName: string) => void;
  getTemplateStyling: (template: any) => { avatar: string; color: string };

  onPublishAgent?: (agent: any) => void;
  publishingAgentId?: string | null;
  onTabChange?: (tab: string) => void;
}

const filterOptions = [
  { value: 'all', label: 'All Agents' },
  { value: 'templates', label: 'Templates' },
];

export const MyAgentsTab = ({
  agentsSearchQuery,
  setAgentsSearchQuery,
  agentsLoading,
  agents,
  agentsPagination,
  viewMode,
  setViewMode,
  onCreateAgent,
  onEditAgent,
  onDeleteAgent,
  onToggleDefault,
  onClearFilters,
  deleteAgentMutation,
  isDeletingAgent,
  setAgentsPage,
  agentsPageSize,
  onAgentsPageSizeChange,
  myTemplates,
  templatesLoading,
  templatesError,
  templatesActioningId,
  templatesPagination,
  templatesPage,
  setTemplatesPage,
  templatesPageSize,
  onTemplatesPageSizeChange,
  templatesSearchQuery,
  setTemplatesSearchQuery,
  onPublish,
  onUnpublish,
  getTemplateStyling,
  onPublishAgent,
  publishingAgentId,
  onTabChange
}: MyAgentsTabProps) => {
  const [agentFilter, setAgentFilter] = useState<AgentFilter>('all');

  const templateAgentsCount = useMemo(() => {
    return myTemplates?.length || 0;
  }, [myTemplates]);

  const handleClearFilters = () => {
    setAgentFilter('all');
    onClearFilters();
  };

  const renderTemplates = () => {
    return (
      <>
        {templatesLoading ? (
          <LoadingState viewMode={viewMode} />
        ) : templatesError ? (
          <div className="text-center py-16">
            <p className="text-destructive">Failed to load templates</p>
          </div>
        ) : !myTemplates || myTemplates.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-3xl flex items-center justify-center mb-6">
              <Globe className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">No published templates yet</h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Publish your agents to the marketplace to share them with the community and track their usage.
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {myTemplates.map((template) => {
                const isActioning = templatesActioningId === template.template_id;
                return (
                  <AgentCard
                    key={template.template_id}
                    mode="template"
                    data={template}
                    styling={getTemplateStyling(template)}
                    isActioning={isActioning}
                    onPrimaryAction={
                      template.is_public 
                        ? () => onUnpublish(template.template_id, template.name)
                        : () => onPublish(template)
                    }
                    onSecondaryAction={template.is_public ? () => {} : undefined}
                  />
                );
              })}
            </div>
            {templatesPagination && (
              <Pagination
                currentPage={templatesPagination.current_page}
                totalPages={templatesPagination.total_pages}
                totalItems={templatesPagination.total_items}
                pageSize={templatesPageSize}
                onPageChange={setTemplatesPage}
                onPageSizeChange={onTemplatesPageSizeChange}
                isLoading={templatesLoading}
                showPageSizeSelector={true}
                showJumpToPage={true}
                showResultsInfo={true}
              />
            )}
          </>
        )}
      </>
    );
  };

  return (
    <div className="space-y-6 flex flex-col min-h-full">
      <DiscoverHeader
        value={agentsSearchQuery}
        onChange={setAgentsSearchQuery}
        onSubmit={() => { /* pagination reset handled upstream */ }}
        nav={<TabsNavigation activeTab={'my-agents'} onTabChange={(tab) => onTabChange?.(tab)} />}
        right={(
          <button
            onClick={onCreateAgent}
            className="inline-flex items-center gap-2 rounded-xl border bg-background/70 px-3.5 py-2.5 text-sm hover:bg-background/90 transition"
            title="Create agent"
            aria-label="Create agent"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span className="hidden sm:inline">New Agent</span>
          </button>
        )}
        title="My Agents"
        subtitle="Manage your personal and team agents. Create, edit, and publish templates."
        placeholder="Search my agents"
      />
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="hidden" />
        <div className="flex items-center gap-3">
          <Select value={agentFilter} onValueChange={(value: AgentFilter) => setAgentFilter(value)}>
            <SelectTrigger className="w-[180px] h-12 rounded-xl">
              <SelectValue placeholder="Filter agents" />
            </SelectTrigger>
            <SelectContent className='rounded-xl'>
              {filterOptions.map((filter) => (
                <SelectItem key={filter.value} className='rounded-xl' value={filter.value}>
                  {filter.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="ml-1 inline-flex items-center rounded-xl border bg-background/70">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 text-sm rounded-l-xl ${viewMode === 'grid' ? 'bg-primary/10 text-primary border-r border-primary/20' : 'text-muted-foreground'}`}
              title="Grid view"
            >Grid</button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 text-sm rounded-r-xl ${viewMode === 'list' ? 'bg-primary/10 text-primary border-l border-primary/20' : 'text-muted-foreground'}`}
              title="List view"
            >List</button>
          </div>
        </div>
      </div>
      <div className="flex-1">
        {agentFilter === 'templates' ? (
          renderTemplates()
        ) : (
          <>
            {agentsLoading ? (
              <LoadingState viewMode={viewMode} />
            ) : agents.length === 0 ? (
              <EmptyState
                hasAgents={(agentsPagination?.total_items || 0) > 0}
                onCreateAgent={onCreateAgent}
                onClearFilters={handleClearFilters}
              />
            ) : (
              <AgentsGrid
                agents={agents}
                onEditAgent={onEditAgent}
                onDeleteAgent={onDeleteAgent}
                onToggleDefault={onToggleDefault}
                deleteAgentMutation={deleteAgentMutation}
                isDeletingAgent={isDeletingAgent}
                onPublish={onPublishAgent}
                publishingId={publishingAgentId}
                viewMode={viewMode}
              />
            )}
            
            {agentsPagination && (
              <Pagination
                currentPage={agentsPagination.current_page}
                totalPages={agentsPagination.total_pages}
                totalItems={agentsPagination.total_items}
                pageSize={agentsPageSize}
                onPageChange={setAgentsPage}
                onPageSizeChange={onAgentsPageSizeChange}
                isLoading={agentsLoading}
                showPageSizeSelector={true}
                showJumpToPage={true}
                showResultsInfo={true}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}; 