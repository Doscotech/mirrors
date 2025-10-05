import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useThemedStyles } from '@/hooks/useThemeColor';
import { Search, Wrench } from 'lucide-react-native';

// Core tools that cannot be disabled
const CORE_TOOLS = ['reply_to_user', 'respond_to_user'];

// Tool definitions with descriptions
const TOOL_DEFINITIONS: Record<string, { name: string; description: string; category: string }> = {
  reply_to_user: { name: 'Reply to User', description: 'Core tool to send messages to users', category: 'Core' },
  respond_to_user: { name: 'Respond to User', description: 'Core tool to respond to user queries', category: 'Core' },
  create_sandbox: { name: 'Create Sandbox', description: 'Create isolated code execution environments', category: 'Code' },
  execute_code: { name: 'Execute Code', description: 'Run code in sandboxes', category: 'Code' },
  write_file: { name: 'Write File', description: 'Create and modify files in sandboxes', category: 'Files' },
  read_file: { name: 'Read File', description: 'Read file contents from sandboxes', category: 'Files' },
  list_directory: { name: 'List Directory', description: 'Browse filesystem structure', category: 'Files' },
  web_search: { name: 'Web Search', description: 'Search the internet for information', category: 'Search' },
  get_webpage_content: { name: 'Get Webpage', description: 'Fetch and read webpage contents', category: 'Web' },
  send_email: { name: 'Send Email', description: 'Send emails to users', category: 'Communication' },
};

interface ToolsTabProps {
  tools: Record<string, boolean | { enabled: boolean; description: string }>;
  onToolsChange: (tools: Record<string, boolean | { enabled: boolean; description: string }>) => void;
  disabled?: boolean;
}

export default function ToolsTab({ tools, onToolsChange, disabled = false }: ToolsTabProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const styles = useThemedStyles((theme) => ({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    scrollContent: {
      padding: 16,
    },
    searchContainer: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      backgroundColor: theme.card,
      borderRadius: 12,
      paddingHorizontal: 14,
      borderWidth: 1,
      borderColor: theme.border,
      marginBottom: 16,
    },
    searchInput: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 8,
      color: theme.foreground,
      fontSize: 15,
    },
    toolCard: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.border,
    },
    toolHeader: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      marginBottom: 8,
    },
    toolTitle: {
      fontSize: 15,
      fontWeight: '600' as const,
      color: theme.foreground,
      flex: 1,
    },
    coreBadge: {
      backgroundColor: theme.muted,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 6,
      marginLeft: 8,
    },
    coreBadgeText: {
      color: theme.mutedForeground,
      fontSize: 11,
      fontWeight: '600' as const,
    },
    toolDescription: {
      fontSize: 14,
      color: theme.mutedForeground,
      marginBottom: 10,
      lineHeight: 20,
    },
    categoryBadge: {
      alignSelf: 'flex-start' as const,
      backgroundColor: theme.muted,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 6,
    },
    categoryText: {
      fontSize: 12,
      color: theme.mutedForeground,
      fontWeight: '500' as const,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      paddingHorizontal: 32,
      paddingVertical: 60,
    },
    emptyText: {
      fontSize: 15,
      color: theme.mutedForeground,
      textAlign: 'center' as const,
      marginTop: 12,
      lineHeight: 22,
    },
  }));

  const isToolEnabled = (tool: boolean | { enabled: boolean; description: string } | undefined): boolean => {
    if (tool === undefined) return false;
    if (typeof tool === 'boolean') return tool;
    return tool.enabled;
  };

  const handleToggle = (toolKey: string, value: boolean) => {
    if (CORE_TOOLS.includes(toolKey)) return; // Don't allow toggling core tools
    if (disabled) return;

    const updatedTools = {
      ...tools,
      [toolKey]: typeof tools[toolKey] === 'object' 
        ? { ...(tools[toolKey] as { enabled: boolean; description: string }), enabled: value }
        : value,
    };
    onToolsChange(updatedTools);
  };

  const filteredTools = Object.entries(TOOL_DEFINITIONS).filter(([key, def]) =>
    def.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    def.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const enabledCount = Object.values(tools).filter(t => isToolEnabled(t)).length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.searchContainer}>
        <Search size={18} color={styles.toolDescription.color} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search tools..."
          placeholderTextColor={styles.toolDescription.color}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {filteredTools.map(([toolKey, toolDef]) => {
        const isCore = CORE_TOOLS.includes(toolKey);
        const enabled = isCore ? true : isToolEnabled(tools[toolKey]);

        return (
          <View key={toolKey} style={styles.toolCard}>
            <View style={styles.toolHeader}>
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.toolTitle}>{toolDef.name}</Text>
                {isCore && (
                  <View style={styles.coreBadge}>
                    <Text style={styles.coreBadgeText}>CORE</Text>
                  </View>
                )}
              </View>
              <Switch
                value={enabled}
                onValueChange={(value) => handleToggle(toolKey, value)}
                disabled={isCore || disabled}
              />
            </View>
            <Text style={styles.toolDescription}>{toolDef.description}</Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{toolDef.category}</Text>
            </View>
          </View>
        );
      })}

      {filteredTools.length === 0 && (
        <View style={styles.emptyContainer}>
          <Wrench size={48} color={styles.emptyText.color} />
          <Text style={styles.emptyText}>No tools found matching "{searchQuery}"</Text>
        </View>
      )}
    </ScrollView>
  );
}
