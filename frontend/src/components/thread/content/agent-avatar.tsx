'use client';

import React from 'react';
import { useAgent } from '@/hooks/react-query/agents/use-agents';
import { KortixLogo } from '@/components/sidebar/kortix-logo';
import { DynamicIcon } from 'lucide-react/dynamic';
import { cn } from '@/lib/utils';

interface AgentAvatarProps {
  // For fetching agent by ID
  agentId?: string;
  fallbackName?: string;
  
  // For direct props (bypasses agent fetch)
  iconName?: string | null;
  iconColor?: string;
  backgroundColor?: string;
  agentName?: string;
  isSunaDefault?: boolean;
  
  // Common props
  size?: number;
  className?: string;
}

export const AgentAvatar: React.FC<AgentAvatarProps> = ({ 
  // Agent fetch props
  agentId, 
  fallbackName = 'Xera',
  
  // Direct props
  iconName: propIconName,
  iconColor: propIconColor,
  backgroundColor: propBackgroundColor,
  agentName: propAgentName,
  isSunaDefault: propIsSunaDefault,
  
  // Common props
  size = 16,
  className = '',
}) => {
  const { data: agent, isLoading } = useAgent(agentId || '');

  // Determine values from props or agent data
  const iconName = propIconName ?? agent?.icon_name;
  const iconColor = propIconColor ?? agent?.icon_color ?? '#000000';
  const backgroundColor = propBackgroundColor ?? agent?.icon_background ?? '#F3F4F6';
  const agentName = propAgentName ?? agent?.name ?? fallbackName;
  const isSuna = propIsSunaDefault ?? agent?.metadata?.is_suna_default;

  // Calculate responsive border radius - proportional to size
  // Use a ratio that prevents full rounding while maintaining nice corners
  const borderRadiusStyle = {
    borderRadius: `${Math.min(size * 0.25, 16)}px` // 25% of size, max 16px
  };

  // Show skeleton for loading state or when no data is available
  if ((isLoading && agentId) || (!agent && !agentId && !propIconName && !propIsSunaDefault)) {
    return (
      <div 
        className={cn("bg-muted animate-pulse border", className)}
        style={{ width: size, height: size, ...borderRadiusStyle }}
      />
    );
  }

  if (isSuna) {
    return (
      <div 
        className={cn(
          "flex items-center justify-center bg-muted border",
          className
        )}
        style={{ width: size, height: size, ...borderRadiusStyle }}
      >
        <KortixLogo size={size * 0.6} />
      </div>
    );
  }

  if (iconName) {
    return (
      <div 
        className={cn(
          "flex items-center justify-center transition-all border",
          className
        )}
        style={{ 
          width: size, 
          height: size,
          backgroundColor,
          ...borderRadiusStyle
        }}
      >
        <DynamicIcon 
          name={iconName as any} 
          size={size * 0.5} 
          color={iconColor}
        />
      </div>
    );
  }

  // Fallback to default bot icon with gradient background
  // Generate a consistent gradient based on agent name
  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    'linear-gradient(135deg, #ff6e7f 0%, #bfe9ff 100%)',
  ];
  
  const nameHash = agentName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const gradientIndex = nameHash % gradients.length;
  const selectedGradient = gradients[gradientIndex];
  
  return (
    <div 
      className={cn(
        "flex items-center justify-center border border-white/20 shadow-sm",
        className
      )}
      style={{ 
        width: size, 
        height: size, 
        background: selectedGradient,
        ...borderRadiusStyle 
      }}
    >
      <DynamicIcon 
        name="bot" 
        size={size * 0.5} 
        color="#ffffff"
        strokeWidth={2.5}
      />
    </div>
  );
};

interface AgentNameProps {
  agentId?: string;
  fallback?: string;
}

export const AgentName: React.FC<AgentNameProps> = ({ 
  agentId, 
  fallback = "Xera" 
}) => {
  const { data: agent, isLoading } = useAgent(agentId || '');

  if (isLoading && agentId) {
    return <span className="text-muted-foreground">Loading...</span>;
  }

  return <span>{agent?.name || fallback}</span>;
};

// Utility function for checking if agent has custom profile
export function hasCustomProfile(agent: {
  icon_name?: string | null;
}): boolean {
  return !!(agent.icon_name);
} 