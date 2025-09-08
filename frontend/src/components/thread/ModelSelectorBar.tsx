'use client';

import React from 'react';
import { AgentModelSelector } from '@/components/agents/config/model-selector';
import { useModelSelection } from '@/components/thread/chat-input/_use-model-selection-new';
import { AgentSelectionDropdown } from '@/components/agents/agent-selection-dropdown';
import { useAgentSelection } from '@/lib/stores/agent-selection-store';

interface ModelSelectorBarProps {
  className?: string;
}

export const ModelSelectorBar: React.FC<ModelSelectorBarProps> = ({ className }) => {
  const { selectedModel, handleModelChange } = useModelSelection();
  const { selectedAgentId, setSelectedAgent } = useAgentSelection();

  return (
    <div className={['w-full', className].filter(Boolean).join(' ')}>
      <div className="px-4 md:px-6">
        <div className="py-2 flex items-center gap-2">
          {/* Agent selector moved here to sit next to model selector */}
          <div className="min-w-[200px]">
            <AgentSelectionDropdown
              selectedAgentId={selectedAgentId}
              onAgentSelect={(id) => setSelectedAgent(id)}
              variant="compact"
              className="h-8 px-2 py-1 rounded-xl"
            />
          </div>
          <AgentModelSelector value={selectedModel} onChange={handleModelChange} />
        </div>
      </div>
    </div>
  );
};

export default ModelSelectorBar;
