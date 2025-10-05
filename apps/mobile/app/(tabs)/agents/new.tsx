import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useThemedStyles } from '@/hooks/useThemeColor';
import { Bot, X } from 'lucide-react-native';
import { createAgent } from '@/api/agents-api';
import useAgentStore from '@/stores/agent-store';

const ICON_COLORS = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#14B8A6', // teal
  '#F97316', // orange
];

const ICON_BACKGROUNDS = [
  '#EFF6FF', // blue-50
  '#F0FDF4', // green-50
  '#FFFBEB', // amber-50
  '#FEF2F2', // red-50
  '#F5F3FF', // purple-50
  '#FDF2F8', // pink-50
  '#F0FDFA', // teal-50
  '#FFF7ED', // orange-50
];

export default function NewAgentScreen() {
  const router = useRouter();
  const { fetchAvailableAgents } = useAgentStore();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [isCreating, setIsCreating] = useState(false);

  const styles = useThemedStyles((theme) => ({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    scrollContent: {
      padding: 20,
    },
    header: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      marginBottom: 24,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: '700' as const,
      color: theme.foreground,
    },
    closeButton: {
      padding: 8,
    },
    section: {
      marginBottom: 24,
    },
    label: {
      fontSize: 14,
      fontWeight: '600' as const,
      color: theme.foreground,
      marginBottom: 8,
    },
    input: {
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      padding: 14,
      fontSize: 16,
      color: theme.foreground,
    },
    textArea: {
      height: 100,
      textAlignVertical: 'top' as const,
    },
    previewSection: {
      alignItems: 'center' as const,
      marginBottom: 24,
    },
    previewCard: {
      width: 120,
      height: 120,
      borderRadius: 60,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      marginBottom: 16,
    },
    colorPickerLabel: {
      fontSize: 14,
      fontWeight: '600' as const,
      color: theme.foreground,
      marginBottom: 12,
    },
    colorPicker: {
      flexDirection: 'row' as const,
      flexWrap: 'wrap' as const,
      gap: 12,
      justifyContent: 'center' as const,
    },
    colorOption: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      borderWidth: 3,
      borderColor: 'transparent',
    },
    colorOptionSelected: {
      borderColor: theme.primary,
    },
    colorCircle: {
      width: 32,
      height: 32,
      borderRadius: 16,
    },
    createButton: {
      backgroundColor: theme.primary,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center' as const,
      marginTop: 8,
    },
    createButtonDisabled: {
      opacity: 0.5,
    },
    createButtonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '700' as const,
    },
    hint: {
      fontSize: 12,
      color: theme.mutedForeground,
      marginTop: 6,
    },
  }));

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter an agent name');
      return;
    }

    setIsCreating(true);
    try {
      const newAgent = await createAgent({
        name: name.trim(),
        description: description.trim() || undefined,
        icon_name: 'bot',
        icon_color: ICON_COLORS[selectedColorIndex],
        icon_background: ICON_BACKGROUNDS[selectedColorIndex],
        is_default: false,
      });

      // Refresh agent list
      await fetchAvailableAgents();

      Alert.alert(
        'Success',
        'Agent created successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              router.back();
              // Navigate to config screen
              setTimeout(() => {
                router.push(`/(tabs)/agents/config/${newAgent.agent_id}` as any);
              }, 100);
            },
          },
        ]
      );
    } catch (error) {
      console.error('Failed to create agent:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to create agent');
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    if (name.trim() || description.trim()) {
      Alert.alert(
        'Discard changes?',
        'Are you sure you want to discard this agent?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => router.back() },
        ]
      );
    } else {
      router.back();
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Create Agent</Text>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <X size={24} color={styles.headerTitle.color} />
          </TouchableOpacity>
        </View>

        {/* Preview */}
        <View style={styles.previewSection}>
          <View
            style={[
              styles.previewCard,
              { backgroundColor: ICON_BACKGROUNDS[selectedColorIndex] },
            ]}
          >
            <Bot size={48} color={ICON_COLORS[selectedColorIndex]} />
          </View>
        </View>

        {/* Name */}
        <View style={styles.section}>
          <Text style={styles.label}>Agent Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Research Assistant"
            placeholderTextColor={styles.hint.color}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            maxLength={50}
          />
          <Text style={styles.hint}>Give your agent a descriptive name</Text>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.label}>Description (optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="What does this agent do?"
            placeholderTextColor={styles.hint.color}
            value={description}
            onChangeText={setDescription}
            multiline
            maxLength={200}
          />
          <Text style={styles.hint}>
            {description.length}/200 characters
          </Text>
        </View>

        {/* Color Picker */}
        <View style={styles.section}>
          <Text style={styles.colorPickerLabel}>Choose Color</Text>
          <View style={styles.colorPicker}>
            {ICON_COLORS.map((color, index) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorOption,
                  selectedColorIndex === index && styles.colorOptionSelected,
                ]}
                onPress={() => setSelectedColorIndex(index)}
              >
                <View
                  style={[
                    styles.colorCircle,
                    { backgroundColor: ICON_BACKGROUNDS[index] },
                  ]}
                >
                  <Bot size={20} color={color} style={{ alignSelf: 'center', marginTop: 6 }} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Create Button */}
        <TouchableOpacity
          style={[
            styles.createButton,
            (!name.trim() || isCreating) && styles.createButtonDisabled,
          ]}
          onPress={handleCreate}
          disabled={!name.trim() || isCreating}
        >
          {isCreating ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.createButtonText}>Create Agent</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
