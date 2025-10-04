"use client";

import React, { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, Share2, Download, BadgeCheck, Cpu, Wrench, PlugZap, Clipboard, ClipboardCheck } from 'lucide-react';
import { AgentCardV2 } from '@/components/agents/discover/AgentCardV2';
import { StreamlinedInstallDialog } from '@/components/agents/installation/streamlined-install-dialog';
import type { MarketplaceTemplate } from '@/components/agents/installation/types';
import { useTemplateDetails, useMarketplaceTemplates, useInstallTemplate, type AgentTemplate } from '@/hooks/react-query/secure-mcp/use-secure-mcp';
import { getToolDisplayName } from '@/components/agents/tools';

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
                description: t.description || '',
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

    return (
        <div className="min-h-screen bg-gradient-to-b from-background via-background/98 to-background/95">
                {/* Hero Header - StandardHero Style */}
                <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-white via-background to-background dark:from-[#0b1220] dark:via-background dark:to-background mx-6 mt-6">
                    {/* Glow gradients */}
                    <div
                        className="pointer-events-none absolute inset-0 opacity-20 dark:opacity-60"
                        style={{
                            background: [
                                "radial-gradient(600px 280px at 8% 0%, rgba(6,182,212,0.10), transparent 60%)",
                                "radial-gradient(520px 240px at 92% 8%, rgba(139,92,246,0.08), transparent 60%)",
                                "radial-gradient(420px 180px at 50% 100%, rgba(244,63,94,0.06), transparent 60%)"
                            ].join(',')
                        }}
                    />
                    {/* Light mode concentric accent rings */}
                    <div
                        className="pointer-events-none absolute inset-0 opacity-[0.18] dark:hidden"
                        style={{
                            backgroundImage: [
                                "repeating-radial-gradient(circle at 15% -10%, rgba(6,182,212,0.20) 0px, rgba(6,182,212,0.20) 1px, transparent 2px, transparent 24px)",
                                "repeating-radial-gradient(circle at 85% 0%, rgba(139,92,246,0.16) 0px, rgba(139,92,246,0.16) 1px, transparent 2px, transparent 22px)"
                            ].join(',')
                        }}
                    />
                    {/* Dark mode soft dot rings */}
                    <div
                        className="pointer-events-none absolute inset-0 hidden dark:block opacity-[0.14]"
                        style={{
                            backgroundImage: [
                                "repeating-radial-gradient(circle at 15% -10%, rgba(255,255,255,0.12) 0px, rgba(255,255,255,0.12) 1px, transparent 2px, transparent 26px)",
                                "repeating-radial-gradient(circle at 85% 0%, rgba(255,255,255,0.10) 0px, rgba(255,255,255,0.10) 1px, transparent 2px, transparent 22px)"
                            ].join(',')
                        }}
                    />
                    {/* Edge feather gradients */}
                    <div
                        className="pointer-events-none absolute inset-0"
                        style={{
                            background: [
                                "linear-gradient(180deg, rgba(6,182,212,0.06), transparent 22%, transparent 78%, rgba(244,63,94,0.06))",
                                "linear-gradient(90deg, rgba(6,182,212,0.05), transparent 18%, transparent 82%, rgba(139,92,246,0.05))"
                            ].join(',')
                        }}
                    />
                    
                <div className="relative p-6 md:p-8">
                    <div className="flex flex-col md:flex-row items-start gap-6">
                        {/* Agent Avatar/Icon */}
                        <div className="relative group flex-shrink-0">
                            <div className="h-20 w-20 md:h-24 md:w-24 rounded-3xl ring-2 ring-white/20 shadow-xl shadow-primary/20 transition-all group-hover:shadow-2xl group-hover:shadow-primary/30 group-hover:scale-105" style={{ background: accent }} />
                            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl" />
                        </div>
                        
                        {/* Agent Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-3 mb-2">
                                <h1 className="text-xl md:text-2xl font-semibold tracking-tight">{template.name}</h1>
                                {template.is_kortix_team && (
                                    <span className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 px-3 py-1.5 text-xs font-semibold text-primary border border-primary/20 shadow-sm">
                                        <BadgeCheck className="h-3.5 w-3.5" /> 
                                        Verified by Xera
                                    </span>
                                )}
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                                <span className="flex items-center gap-1.5">
                                    <span className="font-medium text-foreground">by {template.creator_name || 'Unknown'}</span>
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Download className="h-4 w-4" />
                                    <span className="font-semibold text-foreground">{template.download_count || 0}</span> installs
                                </span>
                            </div>
                            
                            {template.tags && template.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {template.tags.slice(0, 8).map(tag => (
                                        <span key={tag} className="rounded-xl bg-muted/50 border border-border/40 px-3 py-1 text-xs font-medium text-foreground hover:bg-muted transition-colors">
                                            {tag}
                                        </span>
                                    ))}
                                    {template.tags.length > 8 && (
                                        <span className="rounded-xl bg-muted/50 border border-border/40 px-3 py-1 text-xs font-medium text-muted-foreground">
                                            +{template.tags.length - 8} more
                                        </span>
                                    )}
                                </div>
                            )}
                            
                            {template.description && (
                                <p className="mt-4 text-sm text-muted-foreground max-w-2xl leading-relaxed">{template.description}</p>
                            )}
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex shrink-0 items-center gap-3 w-full md:w-auto">
                            <button 
                                onClick={() => { setSelectedItem(template); setShowInstallDialog(true); }} 
                                className="flex-1 md:flex-none rounded-xl bg-gradient-to-r from-primary to-primary/90 px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all hover:scale-105 flex items-center justify-center gap-2"
                            >
                                <Download className="h-4 w-4" /> 
                                Install Agent
                            </button>
                            <button 
                                onClick={copyShare} 
                                className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm px-4 py-3 text-sm font-medium shadow-sm hover:shadow-md hover:bg-card transition-all flex items-center gap-2"
                            >
                                <Share2 className="h-4 w-4" /> 
                                <span className="hidden sm:inline">Share</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

                        <div className="container mx-auto max-w-6xl px-6 py-12 space-y-12">
                    {/* Tools & Integrations */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-bold">
                            Tools & Integrations
                        </h2>
                        
                        <div className="space-y-6">
                            {/* AI Model Info */}
                            <div className="rounded-2xl bg-gradient-to-br from-card/95 to-card/50 backdrop-blur-sm border border-border/40 p-6 shadow-sm">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center">
                                        <Cpu className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-muted-foreground">AI Model</div>
                                        <div className="text-base font-bold">{template.model || 'Not specified'}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Built-in Tools */}
                            {(() => {
                                const toolsObj = template.agentpress_tools || {};
                                const entries = Object.entries(toolsObj) as Array<[string, any]>;
                                const enabled = entries
                                    .map(([name, cfg]) => ({
                                        name,
                                        enabled: typeof cfg === 'boolean' ? cfg : (cfg?.enabled ?? true)
                                    }))
                                    .filter(t => t.enabled);
                                
                                if (enabled.length === 0) return null;
                                
                                return (
                                    <div>
                                        <div className="text-sm font-semibold text-muted-foreground mb-3">Built-in Tools</div>
                                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                            {enabled.map(t => (
                                                <div key={t.name} className="group rounded-xl bg-gradient-to-br from-card/95 to-card/50 backdrop-blur-sm border border-border/40 p-4 shadow-sm hover:shadow-md hover:border-emerald-500/20 transition-all">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                            <Wrench className="h-4 w-4 text-emerald-500" />
                                                        </div>
                                                        <div className="text-sm font-semibold">{getToolDisplayName(t.name)}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* MCP Connectors */}
                            {template.mcp_requirements && template.mcp_requirements.length > 0 && (
                                <div>
                                    <div className="text-sm font-semibold text-muted-foreground mb-3">MCP Connectors</div>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        {template.mcp_requirements.map((req, idx) => (
                                            <div key={idx} className="group rounded-xl bg-gradient-to-br from-card/95 to-card/50 backdrop-blur-sm border border-border/40 p-4 shadow-sm hover:shadow-md hover:border-purple-500/20 transition-all">
                                                <div className="flex items-start gap-3 mb-3">
                                                    <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-purple-500/15 to-purple-500/5 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                                        <PlugZap className="h-4 w-4 text-purple-500" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-sm font-semibold truncate">{req.display_name}</div>
                                                        {req.enabled_tools && req.enabled_tools.length > 0 && (
                                                            <div className="text-xs text-muted-foreground mt-1">
                                                                {req.enabled_tools.length} tool{req.enabled_tools.length !== 1 ? 's' : ''}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                {req.enabled_tools && req.enabled_tools.length > 0 && (
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {req.enabled_tools.slice(0, 6).map(tool => (
                                                            <span key={tool} className="rounded-lg bg-muted/40 border border-border/30 px-2 py-1 text-[10px] font-medium">{tool}</span>
                                                        ))}
                                                        {req.enabled_tools.length > 6 && (
                                                            <span className="rounded-lg bg-muted/40 border border-border/30 px-2 py-1 text-[10px] font-medium text-muted-foreground">
                                                                +{req.enabled_tools.length - 6} more
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                                {/* System Prompt / Instructions */}
                                {(() => {
                                        const sysPrompt = (templateDetail as AgentTemplate | undefined)?.system_prompt || (templateDetail as AgentTemplate | undefined)?.instructions;
                                        if (!sysPrompt) return null;
                                        return (
                                                <section className="space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <h2 className="text-xl font-bold">
                                                            System Prompt
                                                        </h2>
                                                        <button
                                                            onClick={async () => {
                                                                try {
                                                                    await navigator.clipboard.writeText(sysPrompt);
                                                                    setCopied('prompt');
                                                                    setTimeout(() => setCopied(null), 1200);
                                                                } catch {}
                                                            }}
                                                            className="inline-flex items-center gap-2 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm px-4 py-2 text-xs font-medium shadow-sm hover:shadow-md hover:bg-card transition-all"
                                                        >
                                                            {copied === 'prompt' ? <ClipboardCheck className="h-4 w-4 text-emerald-500" /> : <Clipboard className="h-4 w-4" />}
                                                            {copied === 'prompt' ? 'Copied!' : 'Copy'}
                                                        </button>
                                                    </div>
                                                    <div className="rounded-2xl bg-card/50 backdrop-blur-sm border border-border/40 shadow-sm overflow-hidden">
                                                        <pre className="whitespace-pre-wrap text-sm leading-7 p-6 overflow-auto max-h-[420px] scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                                                            {sysPrompt}
                                                        </pre>
                                                    </div>
                                                </section>
                                        );
                                })()}

                                {/* Technical Details */}
                                <section className="space-y-4">
                                    <h2 className="text-xl font-bold">
                                        Technical Details
                                    </h2>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="rounded-2xl bg-gradient-to-br from-card/95 to-card/50 backdrop-blur-sm border border-border/40 p-5 shadow-sm">
                                            <div className="text-sm font-semibold text-muted-foreground mb-1">Created</div>
                                            <div className="text-base font-medium">{new Date(template.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                                        </div>
                                        {template.marketplace_published_at && (
                                            <div className="rounded-2xl bg-gradient-to-br from-card/95 to-card/50 backdrop-blur-sm border border-border/40 p-5 shadow-sm">
                                                <div className="text-sm font-semibold text-muted-foreground mb-1">Published</div>
                                                <div className="text-base font-medium">{new Date(template.marketplace_published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                                            </div>
                                        )}
                                        {template.tags?.length ? (
                                            <div className="rounded-2xl bg-gradient-to-br from-card/95 to-card/50 backdrop-blur-sm border border-border/40 p-5 shadow-sm sm:col-span-2">
                                                <div className="text-sm font-semibold text-muted-foreground mb-3">All Tags</div>
                                                <div className="flex flex-wrap gap-2">
                                                    {template.tags.map(t => (
                                                        <span key={t} className="rounded-xl bg-muted/40 border border-border/30 px-3 py-1.5 text-xs font-medium">{t}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : null}
                                    </div>
                                </section>

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

                {similar && similar.length > 0 && (
                    <section className="space-y-4">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <div className="h-1 w-8 bg-gradient-to-r from-primary to-primary/50 rounded-full" />
                            Similar Agents
                        </h2>
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {similar.slice(0, 6).map((s) => (
                                <AgentCardV2 key={s.id} item={s} onPreview={() => router.push(`/agents/preview/${s.id}`)} onInstall={() => { setSelectedItem(s); setShowInstallDialog(true); }} />
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