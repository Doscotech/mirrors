import React from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet } from 'react-native';
import { useThemedStyles } from '@/hooks/useThemeColor';
import { Brain } from 'lucide-react-native';

interface InstructionsTabProps {
  systemPrompt: string;
  onSystemPromptChange: (value: string) => void;
  disabled?: boolean;
}

export default function InstructionsTab({
  systemPrompt,
  onSystemPromptChange,
  disabled = false,
}: InstructionsTabProps) {
  const styles = useThemedStyles((theme) => ({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    scrollContent: {
      padding: 16,
    },
    header: {
      marginBottom: 16,
    },
    title: {
      fontSize: 18,
      fontWeight: '600' as const,
      color: theme.foreground,
      marginBottom: 6,
    },
    subtitle: {
      fontSize: 14,
      color: theme.mutedForeground,
      lineHeight: 20,
    },
    editorContainer: {
      backgroundColor: theme.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 16,
      minHeight: 280,
    },
    textInput: {
      fontSize: 15,
      color: theme.foreground,
      lineHeight: 22,
      textAlignVertical: 'top' as const,
    },
    footer: {
      marginTop: 12,
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
    },
    charCount: {
      fontSize: 13,
      color: theme.mutedForeground,
    },
  }));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={styles.title}>System Prompt</Text>
        <Text style={styles.subtitle}>
          Define how your agent should behave, its personality, and capabilities
        </Text>
      </View>

      <View style={styles.editorContainer}>
        <TextInput
          style={styles.textInput}
          value={systemPrompt}
          onChangeText={onSystemPromptChange}
          placeholder={systemPrompt || "Enter your agent's instructions..."}
          placeholderTextColor={styles.subtitle.color}
          multiline
          editable={!disabled}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.charCount}>
          {systemPrompt.length} characters
        </Text>
      </View>
    </ScrollView>
  );
}
