'use client';

import React from 'react';
import { AgentModelSelector } from '@/components/agents/config/model-selector';
import { useModelSelection } from '@/components/thread/chat-input/_use-model-selection-new';

interface ModelSelectorBarProps {
  className?: string;
}

export const ModelSelectorBar: React.FC<ModelSelectorBarProps> = ({ className }) => {
  const { selectedModel, handleModelChange } = useModelSelection();

  return (
    <div className={['w-full', className].filter(Boolean).join(' ')}>
  <div className="px-4 md:px-6">
        <div className="py-2">
          <AgentModelSelector value={selectedModel} onChange={handleModelChange} />
        </div>
      </div>
    </div>
  );
};

export default ModelSelectorBar;
