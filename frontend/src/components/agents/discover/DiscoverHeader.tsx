"use client";
import React from 'react';
import { StandardHero } from '@/components/layout/StandardHero';

interface DiscoverHeaderProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit?: () => void;
  nav?: React.ReactNode;
  title?: string;
  subtitle?: string;
  placeholder?: string;
}

export const DiscoverHeader: React.FC<DiscoverHeaderProps> = ({
  value,
  onChange,
  onSubmit,
  nav,
  title = 'Discover Agents',
  subtitle = 'Browse curated agents and templates by Xpathedge and the community.',
  placeholder = 'Search agents, tools, or tags'
}) => {
  return (
    <StandardHero
      title={title}
      subtitle={subtitle}
      nav={nav}
      search={{
        value,
        onChange,
        onSubmit,
        placeholder
      }}
    />
  );
};
