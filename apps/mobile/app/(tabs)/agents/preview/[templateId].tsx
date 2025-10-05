import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useThemedStyles } from '@/hooks/useThemeColor';
import { Eye } from 'lucide-react-native';

export default function TemplatePreviewScreen() {
  const { templateId } = useLocalSearchParams<{ templateId: string }>();

  const styles = useThemedStyles((theme) => ({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      padding: 32,
    },
    icon: {
      marginBottom: 20,
    },
    title: {
      fontSize: 20,
      fontWeight: '700' as const,
      color: theme.foreground,
      marginBottom: 10,
    },
    subtitle: {
      fontSize: 14,
      color: theme.mutedForeground,
      textAlign: 'center' as const,
    },
    templateId: {
      fontSize: 12,
      color: theme.mutedForeground,
      marginTop: 10,
      fontFamily: 'monospace' as const,
    },
  }));

  return (
    <View style={styles.container}>
      <Eye size={48} color="#888" style={styles.icon} />
      <Text style={styles.title}>Template Preview</Text>
      <Text style={styles.subtitle}>
        Coming soon: Preview and install agent templates
      </Text>
      {templateId && (
        <Text style={styles.templateId}>Template ID: {templateId}</Text>
      )}
    </View>
  );
}
