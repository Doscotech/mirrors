import { UnifiedMessage } from '@/components/thread/types';

export type MessageAction = {
  id: string;
  label: string;
  onSelect: () => void;
  icon?: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
  hidden?: boolean;
  separatorBefore?: boolean;
  submenu?: MessageAction[];
};

export interface BuildActionsContext {
  message: UnifiedMessage;
  isAssistant: boolean;
  isUser: boolean;
  isFailed: boolean;
  isStreaming: boolean;
  onRetry: () => void;
  onRegenerate: () => void;
  onQuote: () => void;
  onCopy: () => void;
  onCollapseToggle: () => void;
  collapsed: boolean;
  onAddToKnowledgeBase: () => void;
  onSaveSnippet: () => void;
}
