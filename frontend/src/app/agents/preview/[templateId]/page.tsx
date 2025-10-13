"use client";

import React, { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, Share2, Download, Wrench, PlugZap, Clipboard, ClipboardCheck } from 'lucide-react';
import { UnifiedAgentCard } from '@/components/ui/unified-agent-card';
import { StreamlinedInstallDialog } from '@/components/agents/installation/streamlined-install-dialog';
import type { MarketplaceTemplate } from '@/components/agents/installation/types';
import { useTemplateDetails, useMarketplaceTemplates, useInstallTemplate, type AgentTemplate } from '@/hooks/react-query/secure-mcp/use-secure-mcp';
import { AGENTPRESS_TOOL_DEFINITIONS, getToolDisplayName } from '@/components/agents/tools';
import UnicornLightning from '@/components/visuals/unicorn-lightning';
import { icons } from 'lucide-react';

export default function AgentPreviewPage() {
    const params = useParams();
    const router = useRouter();
    const templateId = params.templateId as string;

        const { data: templateDetail, isLoading, error } = useTemplateDetails(templateId);

    const template: MarketplaceTemplate | null = useMemo(() => {
            if (!templateDetail) return null;
            const t = templateDetail as any;
            return {
                id: t.template_id,
                creator_id: t.creator_id,
                name: t.name,
                // Prefer explicit description, then metadata fallbacks
                description: t.description || t.metadata?.summary || t.metadata?.description || t.metadata?.short_description || '',
                // Surface system prompt / instructions when present (may be stored in several places)
                system_prompt: t.system_prompt || t.instructions || t.metadata?.system_prompt || '',
                tags: t.tags || [],
                download_count: t.download_count || 0,
                creator_name: t.creator_name || 'Anonymous',
                created_at: t.created_at,
                marketplace_published_at: t.marketplace_published_at,
                profile_image_url: t.profile_image_url,
                avatar: t.avatar,
                avatar_color: t.avatar_color,
                icon_name: t.icon_name,
                icon_color: t.icon_color,
                icon_background: t.icon_background,
                template_id: t.template_id,
                is_kortix_team: t.is_kortix_team,
                mcp_requirements: t.mcp_requirements,
        metadata: t.metadata,
        // Prefer top-level model if provided by API; fallback to metadata.model
        model: t.model || t.metadata?.model,
        // Include built-in agent tools if present
        agentpress_tools: t.agentpress_tools as any,
            } as MarketplaceTemplate;
        }, [templateDetail]);

    // Similar items: fetch by shared tags (best-effort)
        const tagsParam = useMemo(() => (template?.tags?.slice(0, 3).join(',') || undefined), [template?.tags]);
        const { data: similarResp, isLoading: similarLoading } = useMarketplaceTemplates({
            tags: tagsParam,
            limit: 8,
            sort_by: 'download_count',
            sort_order: 'desc'
        });
        const similar: MarketplaceTemplate[] = useMemo(() => {
            const list = similarResp?.templates || [];
            return list
                .filter((t) => t.template_id !== template?.template_id)
                .map((t) => {
                    const item = t as any;
                    return {
                        id: item.template_id,
                        creator_id: item.creator_id,
                        name: item.name,
                        description: item.description || '',
                        tags: item.tags || [],
                        download_count: item.download_count || 0,
                        creator_name: item.creator_name || 'Anonymous',
                        created_at: item.created_at,
                        marketplace_published_at: item.marketplace_published_at,
                        profile_image_url: item.profile_image_url,
                        avatar: item.avatar,
                        avatar_color: item.avatar_color,
                        icon_name: item.icon_name,
                        icon_color: item.icon_color,
                        icon_background: item.icon_background,
                        template_id: item.template_id,
                        is_kortix_team: item.is_kortix_team,
                        mcp_requirements: item.mcp_requirements,
                        metadata: item.metadata,
                    } as MarketplaceTemplate;
                });
        }, [similarResp, template?.template_id]);

    const [showInstallDialog, setShowInstallDialog] = useState(false);
    const [selectedItem, setSelectedItem] = useState<MarketplaceTemplate | null>(null);
    const installMutation = useInstallTemplate();

    const handleInstall = async (
        item: MarketplaceTemplate,
        instanceName?: string,
        profileMappings?: Record<string, string>,
        customMcpConfigs?: Record<string, Record<string, any>>
    ) => {
        try {
            await installMutation.mutateAsync({
                template_id: item.template_id,
                instance_name: instanceName!,
                profile_mappings: profileMappings,
                custom_mcp_configs: customMcpConfigs,
            });
            setShowInstallDialog(false);
            router.push('/agents?tab=my-agents');
        } catch (e) {
            // handled by hook/toasts upstream
        }
    };

    const pageUrl = typeof window !== 'undefined' ? window.location.href : '';
    const [copied, setCopied] = useState<'prompt' | null>(null);
    const copyShare = async () => {
        try {
            await navigator.clipboard.writeText(pageUrl);
        } catch {}
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-background via-background/98 to-background/95">
                <div className="text-center space-y-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
                    <p className="text-sm text-muted-foreground">Loading agent details...</p>
                </div>
            </div>
        );
    }

        if (error || !template) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-background via-background/98 to-background/95">
                <div className="text-center space-y-4">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-destructive/20 to-destructive/10 rounded-3xl flex items-center justify-center mb-4">
                        <span className="text-3xl">⚠️</span>
                    </div>
                    <h2 className="text-2xl font-bold">Template not found</h2>
                    <p className="text-muted-foreground max-w-md mx-auto">The template you're looking for doesn't exist or has been removed.</p>
                    <button 
                        onClick={() => router.push('/agents?tab=explore')}
                        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-sm hover:shadow-md transition-all"
                    >
                        Browse Agents
                    </button>
                </div>
            </div>
        );
    }

    const accent = template.icon_background || 'linear-gradient(135deg,#06b6d4,#8b5cf6,#f43f5e)';
    const systemPrompt = (template as any).system_prompt || '';

    // Derive tool/integration lists from template data
    const tools = template.mcp_requirements || [];
    const toolRequirements = tools.filter((req: any) => req.source === 'tool');
    const triggerRequirements = tools.filter((req: any) => req.source === 'trigger');
    const integrations = toolRequirements.filter((tool: any) => !tool.custom_type || tool.custom_type !== 'sse');
    const customTools = toolRequirements.filter((tool: any) => tool.custom_type === 'sse');
    // AgentPress tools explicitly enabled on the template
    const agentpressTools = Object.entries(template.agentpress_tools || {})
        .filter(([_, enabled]) => enabled)
        .map(([name]) => name);

    // If no explicit agentpress tools are enabled, fall back to core tools so the UI shows something useful
    const displayedAgentpressTools = agentpressTools.length > 0
        ? agentpressTools
        : Object.entries(AGENTPRESS_TOOL_DEFINITIONS).filter(([, info]) => info.isCore).map(([name]) => name);

    return (
        <div className="min-h-screen bg-gradient-to-b from-background via-background/98 to-background/95">
            <div className="mx-6 mt-6 relative">
                {/* Lightning visual behind header (dark-mode only) */}
                <UnicornLightning projectId="Gr1LmwbKSeJOXhpYEdit" />
                <header className="sticky top-4 z-40 mx-6">
                    <div className="rounded-2xl bg-card/60 backdrop-blur-sm border border-border/40 p-4 flex items-center justify-between gap-4 relative">
                            <div className="flex items-center gap-4 min-w-0">
                                <button
                                    onClick={() => router.back()}
                                    className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-border/40 bg-card/50 hover:bg-card transition-colors mr-2"
                                    aria-label="Go back"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <div className="flex flex-col min-w-0">
                                    <h1 className="text-lg font-semibold truncate">{template.name}</h1>
                                    <div className="text-xs text-muted-foreground truncate">{template.is_kortix_team ? 'Verified by Xera' : `by ${template.creator_name || 'Unknown'}`}</div>
                                    {template.description && (
                                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2 max-w-3xl">{template.description}</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => { setSelectedItem(template); setShowInstallDialog(true); }}
                                    className="rounded-xl bg-gradient-to-r from-primary to-primary/90 px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:shadow-md transition-all flex items-center gap-2"
                                >
                                    <Download className="h-4 w-4" />
                                    Install
                                </button>
                                <button
                                    onClick={copyShare}
                                    className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm px-3 py-1 text-sm font-medium shadow-sm hover:shadow-md hover:bg-card transition-all flex items-center gap-2"
                                >
                                    <Share2 className="h-4 w-4" />
                                    <span className="hidden sm:inline">Share</span>
                                </button>
                            </div>
                        </div>
                </header>
            </div>

            <div className="container mx-auto max-w-6xl px-6 py-12 space-y-12">
                {/* Compact description card (prominent, below header) */}
                {template.description && (
                    <section>
                        <div className="rounded-2xl bg-card/60 border border-border/40 p-4 shadow-sm">
                            <p className="text-sm text-muted-foreground leading-relaxed">{template.description}</p>
                        </div>
                    </section>
                )}

                {/* Technical details removed as requested */}

                                                                {/* Chat preview removed per product decision */}

                {template.mcp_requirements && template.mcp_requirements.length > 0 && (
                    <section className="space-y-4">
                        <h2 className="text-xl font-bold">
                            Requirements
                        </h2>
                        <div className="grid gap-4 sm:grid-cols-2">
                            {template.mcp_requirements.map((req, idx) => (
                                <div key={idx} className="rounded-2xl bg-gradient-to-br from-card/95 to-card/50 backdrop-blur-sm border border-border/40 p-5 shadow-sm hover:shadow-md transition-all">
                                    <div className="flex items-start gap-3 mb-3">
                                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500/15 to-purple-500/5 flex items-center justify-center flex-shrink-0">
                                            <PlugZap className="h-5 w-5 text-purple-500" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-base font-semibold">{req.display_name}</div>
                                            <div className="text-xs text-muted-foreground uppercase tracking-wide">{req.custom_type ? req.custom_type : (req.source || 'tool')}</div>
                                        </div>
                                    </div>
                                    {req.enabled_tools && req.enabled_tools.length > 0 && (
                                        <div className="space-y-2">
                                            <div className="text-xs font-semibold text-muted-foreground">Enabled Tools:</div>
                                            <div className="flex flex-wrap gap-1.5">
                                                {req.enabled_tools.map((tool) => (
                                                    <span key={tool} className="rounded-lg bg-muted/40 border border-border/30 px-2 py-1 text-[10px] font-medium">{tool}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {req.required_config && req.required_config.length > 0 && (
                                        <div className="space-y-2 mt-3">
                                            <div className="text-xs font-semibold text-muted-foreground">Configuration Required:</div>
                                            <div className="flex flex-wrap gap-1.5">
                                                {req.required_config.map((field) => (
                                                    <span key={field} className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-2 py-1 text-[10px] font-medium text-amber-700 dark:text-amber-400">{field}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Tools & Integrations (show AgentPress core tools as fallback) */}
                {displayedAgentpressTools && displayedAgentpressTools.length > 0 && (
                    <section className="space-y-4">
                        <h2 className="text-xl font-bold">Tools & Integrations</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {displayedAgentpressTools.map((toolName) => {
                                const toolInfo = AGENTPRESS_TOOL_DEFINITIONS[toolName] || { description: toolName, icon: 'Tool', color: 'bg-muted/20' } as any;
                                // Resolve icon component safely from lucide icons map
                                const IconComp = (icons as any)[toolInfo.icon] || (icons as any)['Tool'] || null;
                                return (
                                    <div key={toolName} className="rounded-xl bg-card/60 border border-border/30 p-4 flex items-start gap-3">
                                        <div className={`p-3 rounded-xl flex items-center justify-center ${toolInfo.color}`}>
                                            {IconComp ? <IconComp className="h-5 w-5 text-foreground/90" /> : null}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-semibold truncate">{getToolDisplayName(toolName)}</div>
                                            <div className="text-xs text-muted-foreground mt-1">{toolInfo.description}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {systemPrompt && systemPrompt.length > 0 && (
                    <section>
                        <h3 className="text-sm font-semibold mb-2">System Prompt</h3>
                        <div className="rounded-2xl bg-card/60 border border-border/40 p-4 shadow-sm">
                            <pre className="whitespace-pre-wrap text-sm text-muted-foreground m-0">{systemPrompt}</pre>
                        </div>
                    </section>
                )}

                {similar && similar.length > 0 && (
                    <section className="space-y-4">
                        <h2 className="text-xl font-bold">
                            You might also like
                        </h2>
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {similar.slice(0, 6).map((s) => (
                                <UnifiedAgentCard
                                    key={s.id}
                                    variant="compact"
                                    size="sm"
                                    data={{
                                        id: s.id,
                                        name: s.name,
                                        description: s.description,
                                        tags: s.tags,
                                        created_at: s.created_at,
                                        icon_name: s.icon_name,
                                        icon_color: s.icon_color,
                                        icon_background: s.icon_background,
                                        creator_name: s.creator_name,
                                        download_count: s.download_count,
                                        is_kortix_team: s.is_kortix_team,
                                        template_id: s.template_id,
                                    }}
                                    actions={{
                                        onPrimaryAction: (d) => { setSelectedItem(s); setShowInstallDialog(true); },
                                        onClick: () => router.push(`/agents/preview/${s.id}`)
                                    }}
                                />
                            ))}
                        </div>
                    </section>
                )}
            </div>

            <StreamlinedInstallDialog
                item={selectedItem}
                open={showInstallDialog}
                onOpenChange={setShowInstallDialog}
                onInstall={(item, name, prof, custom) => handleInstall(item!, name, prof, custom)}
                isInstalling={installMutation.isPending}
            />

            {/* TODO(Option B): Remove dialog-based try flow and keep in-page ephemeral chat */}
        </div>
    );
}