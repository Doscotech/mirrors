'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CommandCenterContextType {
  isCommandCenterMode: boolean;
  activeCategory: string;
  setCommandCenterMode: (mode: boolean) => void;
  setActiveCategory: (category: string) => void;
}

const CommandCenterContext = createContext<CommandCenterContextType | undefined>(undefined);

export function CommandCenterProvider({ children }: { children: ReactNode }) {
  const [isCommandCenterMode, setCommandCenterMode] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');

  return (
    <CommandCenterContext.Provider
      value={{
        isCommandCenterMode,
        activeCategory,
        setCommandCenterMode,
        setActiveCategory,
      }}
    >
      {children}
    </CommandCenterContext.Provider>
  );
}

export function useCommandCenter() {
  const context = useContext(CommandCenterContext);
  if (context === undefined) {
    throw new Error('useCommandCenter must be used within a CommandCenterProvider');
  }
  return context;
}