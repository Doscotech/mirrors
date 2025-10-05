import React from 'react';
import { View, Text } from 'react-native';
import { useThemedStyles } from '@/hooks/useThemeColor';
import { BookOpen } from 'lucide-react-native';

interface KnowledgeTabProps {
  agentId: string;
  agentName: string;
}

export default function KnowledgeTab({ agentId, agentName }: KnowledgeTabProps) {
  const styles = useThemedStyles((theme) => ({
    container: {
      flex: 1,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      padding: 32,
    },
    icon: {
      marginBottom: 16,
    },
    title: {
      fontSize: 16,
      fontWeight: '600' as const,
      color: theme.foreground,
      textAlign: 'center' as const,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 13,
      color: theme.mutedForeground,
      textAlign: 'center' as const,
      lineHeight: 18,
    },
  }));

  return (
    <View style={styles.container}>
      <BookOpen size={48} color={styles.subtitle.color} style={styles.icon} />
      <Text style={styles.title}>Knowledge Base</Text>
      <Text style={styles.subtitle}>
        Knowledge base management will be available in a future update
      </Text>
    </View>
  );
}
