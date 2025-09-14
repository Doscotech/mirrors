import { MessageAction, BuildActionsContext } from './types';
import { BookOpen, Quote, Repeat, RotateCcw, FilePlus2, ClipboardCopy, PanelTopClose } from 'lucide-react';

export function buildMessageActions(ctx: BuildActionsContext): MessageAction[] {
  const actions: MessageAction[] = [];
  const { isUser, isAssistant, isFailed, isStreaming, collapsed } = ctx;

  // Copy
  actions.push({ id: 'copy', label: 'Copy', icon: ClipboardCopy, onSelect: ctx.onCopy });

  // Quote
  actions.push({ id: 'quote', label: 'Quote', icon: Quote, onSelect: ctx.onQuote });

  // Retry / Regenerate
  if (isUser && isFailed) {
    actions.push({ id: 'retry', label: 'Retry', icon: RotateCcw, onSelect: ctx.onRetry });
  } else if (isAssistant && !isStreaming) {
    actions.push({ id: 'regenerate', label: 'Regenerate', icon: Repeat, onSelect: ctx.onRegenerate });
  }

  // Collapse / Expand (assistant only currently)
  if (isAssistant) {
    actions.push({ id: 'collapse', label: collapsed ? 'Expand' : 'Collapse', icon: PanelTopClose, onSelect: ctx.onCollapseToggle });
  }


  // Knowledge Base & Snippet
  actions.push({ id: 'kb', label: 'Add to Knowledge Base', icon: BookOpen, onSelect: ctx.onAddToKnowledgeBase });
  actions.push({ id: 'snippet', label: 'Save as Snippet', icon: FilePlus2, onSelect: ctx.onSaveSnippet });

  return actions;
}
