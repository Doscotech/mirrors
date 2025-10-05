import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Cpu } from 'lucide-react-native';
import { SERVER_URL } from '@/constants/Server';

export type ModelProvider = 
  | 'openai'
  | 'anthropic' 
  | 'google'
  | 'xai'
  | 'moonshotai'
  | 'bedrock'
  | 'openrouter';

/**
 * Get the provider from a model ID
 */
export function getModelProvider(modelId: string): ModelProvider {
  if (!modelId) return 'openai';
  
  const lowerModelId = modelId.toLowerCase();
  
  if (lowerModelId.includes('anthropic') || lowerModelId.includes('claude')) {
    return 'anthropic';
  }
  if (lowerModelId.includes('openai') || lowerModelId.includes('gpt')) {
    return 'openai';
  }
  if (lowerModelId.includes('google') || lowerModelId.includes('gemini')) {
    return 'google';
  }
  if (lowerModelId.includes('xai') || lowerModelId.includes('grok')) {
    return 'xai';
  }
  if (lowerModelId.includes('moonshotai') || lowerModelId.includes('kimi')) {
    return 'moonshotai';
  }
  if (lowerModelId.includes('bedrock')) {
    return 'bedrock';
  }
  if (lowerModelId.includes('openrouter')) {
    return 'openrouter';
  }
  
  // Default fallback - try to extract provider from model ID format "provider/model"
  const parts = modelId.split('/');
  if (parts.length > 1) {
    const provider = parts[0].toLowerCase();
    if (['openai', 'anthropic', 'google', 'xai', 'moonshotai', 'bedrock', 'openrouter'].includes(provider)) {
      return provider as ModelProvider;
    }
  }
  
  return 'openai'; // Default fallback
}

/**
 * Get the icon URL for a provider (using backend static files)
 */
export function getProviderIconUrl(provider: ModelProvider): string {
  const baseUrl = SERVER_URL.replace('/api', ''); // Remove /api from SERVER_URL
  
  const iconMap: Record<ModelProvider, string> = {
    anthropic: `${baseUrl}/images/models/Anthropic.svg`,
    openai: `${baseUrl}/images/models/OAI.svg`,
    google: `${baseUrl}/images/models/Gemini.svg`,
    xai: `${baseUrl}/images/models/Grok.svg`,
    moonshotai: `${baseUrl}/images/models/Moonshot.svg`,
    bedrock: `${baseUrl}/images/models/Anthropic.svg`,
    openrouter: `${baseUrl}/images/models/OAI.svg`,
  };

  return iconMap[provider];
}

interface ModelProviderIconProps {
  modelId: string;
  size?: number;
  backgroundColor?: string;
  borderColor?: string;
  fallbackColor?: string;
}

export function ModelProviderIcon({ 
  modelId, 
  size = 20,
  backgroundColor = undefined,
  borderColor = undefined,
  fallbackColor = undefined
}: ModelProviderIconProps) {
  // lazily require theme hook to avoid cyclic imports at module level
  const { useTheme } = require('@/hooks/useThemeColor');
  const theme = useTheme();
  const bg = backgroundColor ?? theme.card;
  const border = borderColor ?? theme.border;
  const fallback = fallbackColor ?? theme.mutedForeground;
  const provider = getModelProvider(modelId);
  const iconUrl = getProviderIconUrl(provider);
  
  const borderRadius = Math.min(size * 0.25, 12);
  
  return (
    <View 
      style={[
        styles.iconContainer,
        { 
          width: size, 
          height: size, 
          borderRadius,
          backgroundColor: bg,
          borderColor: border,
        }
      ]}
    >
      {iconUrl ? (
        <Image
          source={{ uri: iconUrl }}
          style={{ 
            width: size * 0.7, 
            height: size * 0.7,
          }}
          resizeMode="contain"
        />
      ) : (
        <Cpu size={size * 0.6} color={fallback} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
});
