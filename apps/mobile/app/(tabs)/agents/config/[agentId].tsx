import React, { useState, useEffect, useRef } from 'react';
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
  SafeAreaView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useThemedStyles } from '@/hooks/useThemeColor';
import { Bot, Trash2, Star, Brain, Wrench, Server, Save, Settings2 } from 'lucide-react-native';
import { updateAgent, deleteAgent } from '@/api/agents-api';
import useAgentStore from '@/stores/agent-store';
import InstructionsTab from '@/components/agents/config/InstructionsTab';
import ToolsTab from '@/components/agents/config/ToolsTab';
import IntegrationsTab from '@/components/agents/config/IntegrationsTab';
import KnowledgeTab from '@/components/agents/config/KnowledgeTab';

const ICON_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
  '#8B5CF6', '#EC4899', '#14B8A6', '#F97316',
];

const ICON_BACKGROUNDS = [
  '#EFF6FF', '#F0FDF4', '#FFFBEB', '#FEF2F2',
  '#F5F3FF', '#FDF2F8', '#F0FDFA', '#FFF7ED',
];

type TabType = 'general' | 'instructions' | 'tools' | 'integrations' | 'knowledge';

export default function AgentConfigScreen() {
  const { agentId } = useLocalSearchParams<{ agentId: string }>();
  const router = useRouter();
  const { agents, fetchAvailableAgents } = useAgentStore();
  
  const agent = agents.find(a => a.agent_id === agentId);
  
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [tools, setTools] = useState<Record<string, boolean | { enabled: boolean; description: string }>>({});
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [isDefault, setIsDefault] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (agent) {
      setName(agent.name);
      setDescription(agent.description || '');
      setSystemPrompt(agent.system_prompt || '');
      setTools(agent.agentpress_tools || {});
      setIsDefault(agent.is_default);
      
      // Find color index
      const colorIndex = ICON_COLORS.findIndex(c => c === agent.icon_color);
      setSelectedColorIndex(colorIndex >= 0 ? colorIndex : 0);
    }
  }, [agent?.agent_id]); // Use agent_id as dependency to ensure re-trigger

  const styles = useThemedStyles((theme) => ({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: theme.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '700' as const,
      color: theme.foreground,
    },
    closeButton: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: theme.muted,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    },
    closeButtonText: {
      fontSize: 18,
      color: theme.foreground,
      fontWeight: '600' as const,
    },
    tabBarContainer: {
      backgroundColor: theme.background,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    tabBarScroll: {
      flexGrow: 0,
    },
    tabBar: {
      flexDirection: 'row' as const,
      gap: 8,
    },
    tab: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 10,
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 8,
      minWidth: 110,
      justifyContent: 'center' as const,
      borderWidth: 1,
      borderColor: theme.border,
    },
    activeTab: {
      backgroundColor: theme.card,
      borderColor: theme.primary,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    inactiveTab: {
      backgroundColor: 'transparent',
      borderColor: theme.border,
    },
    tabText: {
      fontSize: 14,
      fontWeight: '600' as const,
      color: theme.mutedForeground,
    },
    activeTabText: {
      color: theme.primary,
    },
    content: {
      flex: 1,
      backgroundColor: theme.background,
    },
    scrollContent: {
      padding: 16,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    },
    section: {
      marginBottom: 20,
    },
    label: {
      fontSize: 15,
      fontWeight: '600' as const,
      color: theme.foreground,
      marginBottom: 10,
    },
    input: {
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 15,
      color: theme.foreground,
    },
    textArea: {
      height: 110,
      textAlignVertical: 'top' as const,
      paddingTop: 14,
    },
    previewSection: {
      alignItems: 'center' as const,
      marginBottom: 28,
      paddingVertical: 20,
    },
    previewCard: {
      width: 100,
      height: 100,
      borderRadius: 50,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 3,
    },
    colorPicker: {
      flexDirection: 'row' as const,
      flexWrap: 'wrap' as const,
      gap: 10,
    },
    colorOption: {
      width: 50,
      height: 50,
      borderRadius: 25,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    colorOptionSelected: {
      borderWidth: 3,
      borderColor: theme.primary,
      transform: [{ scale: 1.05 }],
    },
    colorCircle: {
      width: 38,
      height: 38,
      borderRadius: 19,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    },
    toggleRow: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      backgroundColor: theme.card,
      paddingHorizontal: 16,
      paddingVertical: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
    },
    toggleLabel: {
      fontSize: 15,
      fontWeight: '500' as const,
      color: theme.foreground,
    },
    toggleButton: {
      paddingVertical: 6,
      paddingHorizontal: 14,
      borderRadius: 8,
      minWidth: 50,
      alignItems: 'center' as const,
    },
    toggleButtonActive: {
      backgroundColor: theme.primary,
    },
    toggleButtonInactive: {
      backgroundColor: theme.muted,
    },
    toggleText: {
      fontSize: 13,
      fontWeight: '600' as const,
    },
    toggleTextActive: {
      color: theme.background,
    },
    toggleTextInactive: {
      color: theme.mutedForeground,
    },
    footer: {
      padding: 16,
      paddingBottom: 20,
      backgroundColor: theme.background,
      borderTopWidth: 1,
      borderTopColor: theme.border,
      gap: 10,
    },
    saveButton: {
  backgroundColor: '#da221cff',
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center' as const,
      flexDirection: 'row' as const,
      justifyContent: 'center' as const,
      gap: 8,
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3,
    },
    saveButtonDisabled: {
      opacity: 0.5,
      shadowOpacity: 0,
    },
    saveButtonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '600' as const,
    },
    deleteButton: {
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center' as const,
      flexDirection: 'row' as const,
      justifyContent: 'center' as const,
      gap: 8,
    },
    deleteButtonText: {
      color: '#EF4444',
      fontSize: 15,
      fontWeight: '600' as const,
    },
    hint: {
      fontSize: 13,
      color: theme.mutedForeground,
      marginTop: 8,
      lineHeight: 18,
    },
  }));

  if (!agent) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.hint}>Loading agent...</Text>
      </View>
    );
  }

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter an agent name');
      return;
    }

    setIsSaving(true);
    try {
      await updateAgent(agentId!, {
        name: name.trim(),
        description: description.trim() || undefined,
        system_prompt: systemPrompt,
        agentpress_tools: tools,
        icon_color: ICON_COLORS[selectedColorIndex],
        icon_background: ICON_BACKGROUNDS[selectedColorIndex],
        is_default: isDefault,
      });

      await fetchAvailableAgents();

      Alert.alert('Success', 'Agent updated successfully!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Failed to update agent:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update agent');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Agent',
      `Are you sure you want to delete "${agent.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              await deleteAgent(agentId!);
              await fetchAvailableAgents();
              
              Alert.alert('Success', 'Agent deleted successfully', [
                { text: 'OK', onPress: () => router.back() },
              ]);
            } catch (error) {
              console.error('Failed to delete agent:', error);
              Alert.alert('Error', error instanceof Error ? error.message : 'Failed to delete agent');
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <ScrollView contentContainerStyle={styles.scrollContent}>
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
              <Text style={styles.label}>Agent Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Agent name"
                placeholderTextColor={styles.hint.color}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                maxLength={50}
              />
            </View>

            {/* Description */}
            <View style={styles.section}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="What does this agent do?"
                placeholderTextColor={styles.hint.color}
                value={description}
                onChangeText={setDescription}
                multiline
                maxLength={200}
              />
              <Text style={styles.hint}>{description.length}/200 characters</Text>
            </View>

            {/* Color Picker */}
            <View style={styles.section}>
              <Text style={styles.label}>Icon Color</Text>
              <View style={styles.colorPicker}>
                {ICON_COLORS.map((color, index) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      selectedColorIndex === index && styles.colorOptionSelected,
                    ]}
                    onPress={() => setSelectedColorIndex(index)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.colorCircle,
                        { backgroundColor: ICON_BACKGROUNDS[index] },
                      ]}
                    >
                      <Bot size={22} color={color} />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Default Toggle */}
            <View style={styles.section}>
              <Text style={styles.label}>Default Agent</Text>
              <View style={styles.toggleRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Star size={18} color={isDefault ? '#F59E0B' : styles.hint.color} fill={isDefault ? '#F59E0B' : 'none'} />
                  <Text style={styles.toggleLabel}>Use as default agent</Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    isDefault ? styles.toggleButtonActive : styles.toggleButtonInactive,
                  ]}
                  onPress={() => setIsDefault(!isDefault)}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      isDefault ? styles.toggleTextActive : styles.toggleTextInactive,
                    ]}
                  >
                    {isDefault ? 'ON' : 'OFF'}
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.hint}>Default agent will be selected automatically in new chats</Text>
            </View>
          </ScrollView>
        );

      case 'instructions':
        return (
          <InstructionsTab
            systemPrompt={systemPrompt}
            onSystemPromptChange={setSystemPrompt}
          />
        );

      case 'tools':
        return (
          <ToolsTab
            tools={tools}
            onToolsChange={setTools}
          />
        );

      case 'integrations':
        return (
          <IntegrationsTab
            agentId={agentId!}
            configuredMCPs={agent?.configured_mcps || []}
            customMCPs={agent?.custom_mcps || []}
          />
        );

      case 'knowledge':
        return (
          <KnowledgeTab
            agentId={agentId!}
            agentName={name}
          />
        );

      default:
        return null;
    }
  };

  const tabs = [
    { id: 'general' as TabType, label: 'General', icon: Settings2 },
    { id: 'instructions' as TabType, label: 'Instructions', icon: Brain },
    { id: 'tools' as TabType, label: 'Tools', icon: Wrench },
    { id: 'integrations' as TabType, label: 'Integrations', icon: Server },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Edit Agent</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Horizontal Tab Bar */}
        <View style={styles.tabBarContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabBarScroll}
          >
            <View style={styles.tabBar}>
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <TouchableOpacity
                    key={tab.id}
                    style={[styles.tab, isActive ? styles.activeTab : styles.inactiveTab]}
                    onPress={() => setActiveTab(tab.id)}
                    activeOpacity={0.7}
                  >
                    <Icon
                      size={18}
                      color={isActive ? styles.activeTabText.color : styles.tabText.color}
                    />
                    <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* Tab Content */}
        <View style={styles.content}>
          {renderTabContent()}
        </View>

        {/* Footer with Actions */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.saveButton,
              (!name.trim() || isSaving) && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={!name.trim() || isSaving}
            activeOpacity={0.8}
          >
            {isSaving ? (
              <ActivityIndicator color={styles.saveButtonText.color} />
            ) : (
              <>
                <Save size={20} color={styles.saveButtonText.color} />
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
            disabled={isDeleting}
            activeOpacity={0.7}
          >
            {isDeleting ? (
              <ActivityIndicator color={styles.deleteButtonText.color} />
            ) : (
              <>
                <Trash2 size={18} color={styles.deleteButtonText.color} />
                <Text style={styles.deleteButtonText}>Delete Agent</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
