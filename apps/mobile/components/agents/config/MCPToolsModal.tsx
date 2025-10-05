import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, Switch, TouchableWithoutFeedback } from 'react-native';
import { useThemedStyles } from '@/hooks/useThemeColor';
import { X, Wrench } from 'lucide-react-native';

interface MCPToolsModalProps {
  visible: boolean;
  onClose: () => void;
  mcpName: string;
  availableTools: string[];
  enabledTools: string[];
  onSave: (enabledTools: string[]) => void;
}

export default function MCPToolsModal({
  visible,
  onClose,
  mcpName,
  availableTools,
  enabledTools,
  onSave,
}: MCPToolsModalProps) {
  const [selectedTools, setSelectedTools] = useState<string[]>(enabledTools);

  const styles = useThemedStyles((theme) => ({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end' as const,
    },
    container: {
      backgroundColor: theme.card,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: '80%' as any,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    header: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600' as const,
      color: theme.foreground,
      flex: 1,
    },
    closeButton: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: theme.muted,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    },
    content: {
      padding: 20,
    },
    subtitle: {
      fontSize: 14,
      color: theme.mutedForeground,
      marginBottom: 16,
      lineHeight: 20,
    },
    toolItem: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      backgroundColor: theme.card,
      padding: 16,
      borderRadius: 12,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: theme.border,
    },
    toolName: {
      fontSize: 15,
      fontWeight: '500' as const,
      color: theme.foreground,
      flex: 1,
    },
    emptyContainer: {
      paddingVertical: 40,
      alignItems: 'center' as const,
    },
    emptyText: {
      fontSize: 14,
      color: theme.mutedForeground,
      textAlign: 'center' as const,
      marginTop: 12,
    },
    footer: {
      padding: 20,
      borderTopWidth: 1,
      borderTopColor: theme.border,
      gap: 10,
    },
    saveButton: {
      backgroundColor: theme.primary,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center' as const,
    },
    saveButtonText: {
      color: theme.background,
      fontSize: 16,
      fontWeight: '600' as const,
    },
    cancelButton: {
      backgroundColor: theme.card,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center' as const,
      borderWidth: 1,
      borderColor: theme.border,
    },
    cancelButtonText: {
      color: theme.foreground,
      fontSize: 16,
      fontWeight: '600' as const,
    },
  }));

  const handleToggleTool = (tool: string) => {
    setSelectedTools(prev =>
      prev.includes(tool)
        ? prev.filter(t => t !== tool)
        : [...prev, tool]
    );
  };

  const handleSave = () => {
    onSave(selectedTools);
    onClose();
  };

  const handleCancel = () => {
    setSelectedTools(enabledTools); // Reset to original
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleCancel}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={handleCancel}
      >
        <View
          style={styles.container}
          onStartShouldSetResponder={() => true}
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Configure Tools</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleCancel}
              activeOpacity={0.7}
            >
              <X size={18} color={styles.headerTitle.color} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={styles.subtitle}>
              Select which tools from "{mcpName}" should be available to your agent
            </Text>

            {availableTools.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Wrench size={48} color={styles.emptyText.color} />
                <Text style={styles.emptyText}>
                  No tools available for this integration
                </Text>
              </View>
            ) : (
              availableTools.map((tool) => (
                <View key={tool} style={styles.toolItem}>
                  <Text style={styles.toolName}>{tool}</Text>
                  <Switch
                    value={selectedTools.includes(tool)}
                    onValueChange={() => handleToggleTool(tool)}
                  />
                </View>
              ))
            )}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              activeOpacity={0.8}
            >
              <Text style={styles.saveButtonText}>
                Save ({selectedTools.length} tools selected)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}
