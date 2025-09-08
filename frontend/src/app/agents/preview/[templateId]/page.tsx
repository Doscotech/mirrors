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
            const t = templateDetail as AgentTemplate;
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
        model: (t as any).model || t.metadata?.model,
        // Include built-in agent tools if present
        agentpress_tools: (t as any).agentpress_tools as any,
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
                .map((t) => ({
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
                })) as MarketplaceTemplate[];
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
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

        if (error || !template) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <h2 className="text-2xl font-semibold mb-2">Template not found</h2>
                    <p className="text-muted-foreground">The template you're looking for doesn't exist or has been removed.</p>
                </div>
            </div>
        );
    }

    const accent = template.icon_background || 'linear-gradient(135deg,#06b6d4,#8b5cf6,#f43f5e)';

    return (
        <div className="min-h-screen">
                <div className="relative overflow-hidden border-b border-border/60 bg-gradient-to-b from-white via-background to-background dark:from-[#0b1220] dark:via-background dark:to-background">
                <div className="pointer-events-none absolute inset-0 opacity-60" style={{
                    background: 'radial-gradient(800px 300px at 10% 0%, rgba(6,182,212,0.12), transparent 60%),\
                                             radial-gradient(600px 250px at 90% 10%, rgba(139,92,246,0.10), transparent 60%),\
                                             radial-gradient(500px 200px at 50% 100%, rgba(244,63,94,0.08), transparent 60%)'
                }} />
                    {/* Glow gradients (lighter in light, stronger in dark) */}
                    <div className="pointer-events-none absolute inset-0 opacity-20 dark:opacity-60" style={{
                        background: 'radial-gradient(800px 300px at 10% 0%, rgba(6,182,212,0.12), transparent 60%),\
                                             radial-gradient(600px 250px at 90% 10%, rgba(139,92,246,0.10), transparent 60%),\
                                             radial-gradient(500px 200px at 50% 100%, rgba(244,63,94,0.08), transparent 60%)'
                    }} />
                    {/* Light mode accent rings */}
                    <div className="pointer-events-none absolute inset-0 opacity-[0.18] dark:hidden" style={{
                        backgroundImage: 'repeating-radial-gradient(circle at 15% -10%, rgba(6,182,212,0.20) 0px, rgba(6,182,212,0.20) 1px, transparent 2px, transparent 24px),\
                                          repeating-radial-gradient(circle at 85% 0%, rgba(139,92,246,0.16) 0px, rgba(139,92,246,0.16) 1px, transparent 2px, transparent 22px)'
                    }} />
                    {/* Dark mode soft dots */}
                    <div className="pointer-events-none absolute inset-0 hidden dark:block opacity-[0.14]" style={{
                        backgroundImage: 'repeating-radial-gradient(circle at 15% -10%, rgba(255,255,255,0.12) 0px, rgba(255,255,255,0.12) 1px, transparent 2px, transparent 26px),\
                                          repeating-radial-gradient(circle at 85% 0%, rgba(255,255,255,0.10) 0px, rgba(255,255,255,0.10) 1px, transparent 2px, transparent 22px)'
                    }} />
                    {/* Edge feather gradients */}
                    <div className="pointer-events-none absolute inset-0" style={{
                        background: 'linear-gradient(180deg, rgba(6,182,212,0.06), transparent 22%, transparent 78%, rgba(244,63,94,0.06)),\
                                     linear-gradient(90deg, rgba(6,182,212,0.05), transparent 18%, transparent 82%, rgba(139,92,246,0.05))'
                    }} />
                <div className="container mx-auto max-w-5xl px-4 py-10">
                    <div className="flex items-start gap-4">
                        <div className="h-16 w-16 rounded-2xl ring-1 ring-white/10" style={{ background: accent }} />
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">{template.name}</h1>
                                {template.is_kortix_team && (
                                    <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary border border-primary/30"><BadgeCheck className="h-3 w-3" /> Verified</span>
                                )}
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">by {template.creator_name || 'Unknown'} · {template.download_count || 0} installs</p>
                            {template.tags && template.tags.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-1.5">
                                    {template.tags.slice(0, 6).map(tag => (
                                        <span key={tag} className="rounded-full border px-2 py-0.5 text-[10px] text-muted-foreground">{tag}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                                    <div className="flex shrink-0 items-center gap-2">
                                        <button onClick={() => { setSelectedItem(template); setShowInstallDialog(true); }} className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground flex items-center gap-2"><Download className="h-4 w-4" /> Install</button>
                                        <button onClick={copyShare} className="rounded-lg border px-4 py-2 text-sm flex items-center gap-2"><Share2 className="h-4 w-4" /> Share</button>
                                    </div>
                    </div>
                </div>
                <div className="h-[2px] w-full" style={{ background: 'linear-gradient(90deg,#06b6d4 0%, #8b5cf6 50%, #f43f5e 100%)' }} />
            </div>

                        <div className="container mx-auto max-w-5xl px-4 py-8 space-y-10">
                <section>
                    <h2 className="text-base font-semibold">About this agent</h2>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-muted-foreground">{template.description}</p>

                    {/* Capabilities summary */}
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-xl border p-3">
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <Cpu className="h-4 w-4" />
                                Model
                            </div>
                            <div className="mt-1 text-sm text-muted-foreground">
                                {template.model || 'Not specified'}
                            </div>
                        </div>
                        <div className="rounded-xl border p-3">
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <Wrench className="h-4 w-4" />
                                Built-in tools
                            </div>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                                {(() => {
                                    const toolsObj = template.agentpress_tools || {};
                                    const entries = Object.entries(toolsObj) as Array<[string, any]>;
                                    const enabled = entries
                                        .map(([name, cfg]) => ({
                                            name,
                                            enabled: typeof cfg === 'boolean' ? cfg : (cfg?.enabled ?? true)
                                        }))
                                        .filter(t => t.enabled);
                                    if (enabled.length === 0) return <span className="text-xs text-muted-foreground">No built-in tools</span>;
                                    return enabled.slice(0, 8).map(t => (
                                        <span key={t.name} className="rounded-full border px-2 py-0.5 text-[10px] text-muted-foreground">{getToolDisplayName(t.name)}</span>
                                    ));
                                })()}
                            </div>
                        </div>
                        <div className="rounded-xl border p-3">
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <PlugZap className="h-4 w-4" />
                                Service connectors (MCP)
                            </div>
                            <div className="mt-2 space-y-1.5">
                                {template.mcp_requirements && template.mcp_requirements.length > 0 ? (
                                    template.mcp_requirements.slice(0, 3).map((req, idx) => (
                                        <div key={idx} className="text-xs">
                                            <div className="font-medium text-foreground">
                                                {req.display_name}
                                            </div>
                                            {req.enabled_tools && req.enabled_tools.length > 0 && (
                                                <div className="mt-1 flex flex-wrap gap-1.5">
                                                    {req.enabled_tools.slice(0, 6).map(tool => (
                                                        <span key={tool} className="rounded-full border px-2 py-0.5 text-[10px] text-muted-foreground">{tool}</span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <span className="text-xs text-muted-foreground">No external connectors</span>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                                {/* System Prompt / Instructions */}
                                {(() => {
                                        const sysPrompt = (templateDetail as AgentTemplate | undefined)?.system_prompt || (templateDetail as AgentTemplate | undefined)?.instructions;
                                        if (!sysPrompt) return null;
                                        return (
                                                <section>
                                                        <div className="flex items-center justify-between">
                                                                <h2 className="text-base font-semibold">System prompt</h2>
                                                                <button
                                                                    onClick={async () => {
                                                                        try {
                                                                            await navigator.clipboard.writeText(sysPrompt);
                                                                            setCopied('prompt');
                                                                            setTimeout(() => setCopied(null), 1200);
                                                                        } catch {}
                                                                    }}
                                                                    className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs"
                                                                >
                                                                    {copied === 'prompt' ? <ClipboardCheck className="h-3.5 w-3.5" /> : <Clipboard className="h-3.5 w-3.5" />}
                                                                    {copied === 'prompt' ? 'Copied' : 'Copy'}
                                                                </button>
                                                        </div>
                                                        <pre className="mt-3 whitespace-pre-wrap text-sm leading-7 bg-muted/30 border rounded-xl p-3 overflow-auto max-h-[420px]">
                                                                {sysPrompt}
                                                        </pre>
                                                </section>
                                        );
                                })()}

                                {/* Technical Details */}
                                                <section>
                                                    <h2 className="text-base font-semibold">Technical details</h2>
                                                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                                        <div className="rounded-xl border p-3 text-sm">
                                            <div className="font-medium">Created</div>
                                            <div className="text-muted-foreground">{new Date(template.created_at).toLocaleString()}</div>
                                        </div>
                                        {template.marketplace_published_at && (
                                            <div className="rounded-xl border p-3 text-sm">
                                                <div className="font-medium">Published</div>
                                                <div className="text-muted-foreground">{new Date(template.marketplace_published_at).toLocaleString()}</div>
                                            </div>
                                        )}
                                        {template.tags?.length ? (
                                            <div className="rounded-xl border p-3 text-sm">
                                                <div className="font-medium">Tags</div>
                                                <div className="mt-1 flex flex-wrap gap-1.5">
                                                    {template.tags.map(t => (
                                                        <span key={t} className="rounded-full border px-2 py-0.5 text-[10px] text-muted-foreground">{t}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : null}
                                    </div>
                                </section>

                                                                {/* Chat preview removed per product decision */}

                {template.mcp_requirements && template.mcp_requirements.length > 0 && (
                    <section>
                        <h2 className="text-base font-semibold">Requirements</h2>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                            {template.mcp_requirements.map((req, idx) => (
                                <div key={idx} className="rounded-xl border p-3">
                                    <div className="text-sm font-medium">{req.display_name}</div>
                                    <div className="text-xs text-muted-foreground">{req.custom_type ? req.custom_type.toUpperCase() : (req.source || 'tool')}</div>
                                    {req.enabled_tools && req.enabled_tools.length > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-1.5">
                                            {req.enabled_tools.map((tool) => (
                                                <span key={tool} className="rounded-full border px-2 py-0.5 text-[10px] text-muted-foreground">{tool}</span>
                                            ))}
                                        </div>
                                    )}
                                    {req.required_config && req.required_config.length > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-1.5">
                                            {req.required_config.map((field) => (
                                                <span key={field} className="rounded-full border px-2 py-0.5 text-[10px] text-muted-foreground">{field}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {similar && similar.length > 0 && (
                    <section>
                        <h2 className="text-base font-semibold">Similar agents</h2>
                        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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