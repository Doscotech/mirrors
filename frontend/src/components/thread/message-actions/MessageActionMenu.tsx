"use client";
import React from 'react';
import * as ContextMenu from '@radix-ui/react-context-menu';
import { buildMessageActions } from './buildActions';
import { UnifiedMessage } from '@/components/thread/types';
import { BuildActionsContext } from './types';
import { cn } from '@/lib/utils';

interface MessageActionMenuProps {
  message: UnifiedMessage;
  isAssistant: boolean;
  isUser: boolean;
  isFailed: boolean;
  isStreaming: boolean;
  collapsed: boolean;
  onRetry: () => void;
  onRegenerate: () => void;
  onQuote: () => void;
  onCopy: () => void;
  onCollapseToggle: () => void;
  onAddToKnowledgeBase: () => void;
  onSaveSnippet: () => void;
  children: React.ReactNode;
}

export function MessageActionMenu(props: MessageActionMenuProps) {

  const {
    message,
    isAssistant,
    isUser,
    isFailed,
    isStreaming,
    onRetry,
    onRegenerate,
    onQuote,
    onCopy,
    onCollapseToggle,
    collapsed,
    onAddToKnowledgeBase,
    onSaveSnippet,
  } = props;

  const ctx: BuildActionsContext = {
    message,
    isAssistant,
    isUser,
    isFailed,
    isStreaming,
    onRetry,
    onRegenerate,
    onQuote,
    onCopy,
    onCollapseToggle,
    collapsed,
    onAddToKnowledgeBase,
    onSaveSnippet,
  };

  const actions = buildMessageActions(ctx).filter(a => !a.hidden);

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>
        <div className="group/message relative" data-message-id={message.message_id}>
          {props.children}
          {/* Optional hover affordance */}
          <div className={cn("absolute -top-2 -right-2 opacity-0 group-hover/message:opacity-100 transition-opacity", "pointer-events-none select-none text-[10px] text-muted-foreground bg-muted/70 px-1 rounded")}>⋮</div>
        </div>
      </ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Content className="z-50 min-w-[200px] rounded-md border bg-popover p-1 shadow-md focus:outline-none text-sm">
          {actions.map((action, i) => (
            <ContextMenu.Item
              key={action.id}
              disabled={action.disabled}
              onSelect={(e) => {
                e.preventDefault();
                action.onSelect();
              }}
              className={cn(
                "flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer select-none outline-none data-[disabled=true]:opacity-50", 
                "focus:bg-accent focus:text-accent-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {action.icon && <action.icon className="h-4 w-4" />}
              <span className="truncate">{action.label}</span>
            </ContextMenu.Item>
          ))}
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}
