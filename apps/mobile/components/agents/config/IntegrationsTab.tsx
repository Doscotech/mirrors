import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useThemedStyles } from '@/hooks/useThemeColor';
import { Server, Plug, Store, Settings, Trash2, Plus } from 'lucide-react-native';
import { updateAgent } from '@/api/agents-api';
import useAgentStore from '@/stores/agent-store';
import MCPToolsModal from './MCPToolsModal';
import { fetchComposioToolkits } from '@/api/composio-api';

interface MCP {
  name: string;
  qualifiedName?: string;
  mcp_qualified_name?: string;
  config?: any;
  enabledTools?: string[];
  isCustom?: boolean;
  customType?: string;
  isComposio?: boolean;
  toolkitSlug?: string;
  toolkit_slug?: string;
  selectedProfileId?: string;
}

interface IntegrationsTabProps {
  agentId: string;
  configuredMCPs: MCP[];
  customMCPs: MCP[];
  onMCPChange?: (updates: { configured_mcps: MCP[]; custom_mcps: MCP[] }) => void;
  disabled?: boolean;
}

export default function IntegrationsTab({
  agentId,
  configuredMCPs,
  customMCPs,
  onMCPChange,
  disabled = false,
}: IntegrationsTabProps) {
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toolsModalVisible, setToolsModalVisible] = useState(false);
  const [selectedMCP, setSelectedMCP] = useState<{ mcp: MCP; index: number } | null>(null);
  const [appsModalVisible, setAppsModalVisible] = useState(false);
  const [appsLoading, setAppsLoading] = useState(false);
  const [apps, setApps] = useState<any[]>([]);
  const [connectModalVisible, setConnectModalVisible] = useState(false);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [profileName, setProfileName] = useState('');
  const [connecting, setConnecting] = useState(false);
  const { fetchAvailableAgents } = useAgentStore();

  const styles = useThemedStyles((theme) => ({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    scrollContent: {
      padding: 16,
    },
    header: {
      marginBottom: 20,
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
    buttonsRow: {
      flexDirection: 'row' as const,
      gap: 10,
      marginBottom: 20,
    },
    addButton: {
      flex: 1,
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      gap: 8,
      backgroundColor: theme.primary,
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderRadius: 12,
    },
    addButtonOutline: {
  backgroundColor: theme.secondary,
  borderWidth: 1,
  borderColor: theme.primary,
    },
    addButtonText: {
      fontSize: 14,
      fontWeight: '600' as const,
      color: theme.background,
    },
    addButtonTextOutline: {
  color: theme.primary,
    },
    mcpCard: {
      backgroundColor: theme.card,
      borderRadius: 10,
      padding: 12,
      marginBottom: 10,
      borderWidth: 0,
    },
    mcpHeader: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      marginBottom: 12,
      gap: 12,
    },
    mcpLogo: {
      width: 36,
      height: 36,
      borderRadius: 6,
      backgroundColor: theme.muted,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    },
    mcpLogoText: {
      fontSize: 16,
      fontWeight: '600' as const,
      color: theme.mutedForeground,
    },
    mcpInfo: {
      flex: 1,
    },
    mcpName: {
      fontSize: 15,
      fontWeight: '600' as const,
      color: theme.foreground,
      marginBottom: 4,
    },
    mcpMeta: {
      fontSize: 13,
      color: theme.mutedForeground,
    },
    mcpActions: {
      flexDirection: 'row' as const,
      gap: 8,
      marginTop: 8,
      alignItems: 'center' as const,
    },
    actionButton: {
      flex: 0,
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      gap: 6,
      paddingVertical: 8,
      paddingHorizontal: 10,
      borderRadius: 8,
      backgroundColor: theme.secondary,
    },
    actionButtonDanger: {
      backgroundColor: 'transparent',
      borderWidth: 0,
    },
    actionButtonText: {
      fontSize: 13,
      fontWeight: '600' as const,
      color: theme.foreground,
    },
    browseButton: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      backgroundColor: theme.primary,
      borderRadius: 8,
      paddingHorizontal: 14,
      paddingVertical: 8,
    },
    customButton: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      backgroundColor: theme.secondary,
      borderRadius: 8,
      paddingHorizontal: 14,
      paddingVertical: 8,
    },
    actionButtonTextDanger: {
      color: '#EF4444',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      paddingHorizontal: 32,
      paddingVertical: 60,
    },
    emptyIcon: {
      marginBottom: 20,
    },
    emptyTitle: {
      fontSize: 17,
      fontWeight: '600' as const,
      color: theme.foreground,
      textAlign: 'center' as const,
      marginBottom: 10,
    },
    emptyText: {
      fontSize: 14,
      color: theme.mutedForeground,
      textAlign: 'center' as const,
      lineHeight: 20,
      marginBottom: 16,
    },
    comingSoonBadge: {
      backgroundColor: theme.muted,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
    },
    comingSoonText: {
      fontSize: 12,
      fontWeight: '600' as const,
      color: theme.mutedForeground,
      textTransform: 'uppercase' as const,
    },
  }));

  const allMCPs = [...configuredMCPs, ...customMCPs];

  const saveMCPChanges = async (configured: MCP[], custom: MCP[]) => {
    setIsSaving(true);
    try {
      await updateAgent(agentId, {
        configured_mcps: configured as any,
        custom_mcps: custom as any,
      });
      
      await fetchAvailableAgents();
      
      // Call parent callback if provided
      onMCPChange?.({
        configured_mcps: configured,
        custom_mcps: custom,
      });
      
      return true;
    } catch (error) {
      console.error('Failed to update MCPs:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update integrations');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddComposio = async () => {
    setAppsModalVisible(true);
    setAppsLoading(true);
    try {
      const data = await fetchComposioToolkits();
      setApps(data.toolkits || []);
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch MCP apps');
    } finally {
      setAppsLoading(false);
    }
  };

  const handleAddCustom = () => {
    // TODO: Implement Custom MCP integration flow (custom MCP modal/sheet)
    Alert.alert('Custom MCP', 'Custom MCP integration coming soon.');
  };

  const handleConfigureTools = (mcp: MCP, index: number) => {
    setSelectedMCP({ mcp, index });
    setToolsModalVisible(true);
  };

  const handleToolsSave = async (enabledTools: string[]) => {
    if (!selectedMCP) return;

    const { mcp, index } = selectedMCP;
    const newMCPs = [...allMCPs];
    newMCPs[index] = { ...mcp, enabledTools };

    // Split back into configured and custom
    const configured = newMCPs.filter(m => !m.isCustom);
    const custom = newMCPs.filter(m => m.isCustom);

    const success = await saveMCPChanges(configured, custom);
    if (success) {
      Alert.alert('Success', 'Tools configuration updated');
    }
    setSelectedMCP(null);
  };

  const handleRemoveMCP = (mcp: MCP, index: number) => {
    Alert.alert(
      'Remove Integration',
      `Are you sure you want to remove "${mcp.name}"? This will disconnect all associated tools and cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setDeletingIndex(index);
            
            // Filter out the MCP at the given index
            const newMCPs = allMCPs.filter((_, i) => i !== index);
            
            // Split back into configured and custom
            const configured = newMCPs.filter(m => !m.isCustom);
            const custom = newMCPs.filter(m => m.isCustom);
            
            const success = await saveMCPChanges(configured, custom);
            if (success) {
              Alert.alert('Success', 'Integration removed');
            }
            setDeletingIndex(null);
          },
        },
      ]
    );
  };

  const getFirstLetter = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={styles.title}>Integrations</Text>
        <Text style={styles.subtitle}>
          Connect external tools and services via Model Context Protocol (MCP)
        </Text>
      </View>

      <View style={styles.buttonsRow}>
        <TouchableOpacity
          style={[styles.browseButton, { marginRight: 8 }]}
          onPress={handleAddComposio}
          activeOpacity={0.7}
          disabled={disabled}
        >
          <Store size={18} color={styles.addButtonText.color} />
          <Text style={[styles.addButtonText, { marginLeft: 6 }]}>Browse Apps</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.customButton}
          onPress={handleAddCustom}
          activeOpacity={0.7}
          disabled={disabled}
        >
          <Server size={18} color={styles.addButtonText.color} />
          <Text style={[styles.addButtonText, { marginLeft: 6 } ]}>Custom MCP</Text>
        </TouchableOpacity>
      </View>

      {/* Modal for MCP Apps */}
      {appsModalVisible && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.55)', zIndex: 100 }}>
          <View style={{ flex: 1, paddingTop: 48, paddingBottom: 24, backgroundColor: styles.mcpCard.backgroundColor }}>
            <View style={{ paddingHorizontal: 24, paddingBottom: 12 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 22, color: styles.mcpName.color, marginBottom: 8 }}>Browse MCP Apps</Text>
              <TouchableOpacity onPress={() => setAppsModalVisible(false)} style={{ position: 'absolute', right: 24, top: 0, backgroundColor: styles.browseButton.backgroundColor || styles.addButtonText.color, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8 }}>
                <Text style={{ color: styles.addButtonText.color, fontWeight: 'bold', fontSize: 16 }}>Close</Text>
              </TouchableOpacity>
            </View>
            {appsLoading ? (
              <ActivityIndicator size="large" color={styles.addButtonText.color} style={{ marginTop: 48 }} />
            ) : (
              <ScrollView style={{ flex: 1, paddingHorizontal: 24 }} contentContainerStyle={{ paddingBottom: 32 }}>
                {apps.map((app, idx) => (
                  <TouchableOpacity key={app.slug || idx} style={{ padding: 16, borderBottomWidth: 1, borderColor: '#E6E9F0', backgroundColor: styles.mcpCard.backgroundColor, borderRadius: 12, marginBottom: 8 }}>
                    <Text style={{ fontWeight: '600', fontSize: 17, color: styles.mcpName.color }}>{app.name}</Text>
                    <Text style={{ color: styles.subtitle.color, fontSize: 14 }}>{app.description}</Text>
                  </TouchableOpacity>
                ))}
                {apps.length === 0 && <Text style={{ color: styles.subtitle.color, textAlign: 'center', marginTop: 24 }}>No apps found</Text>}
              </ScrollView>
            )}
          </View>
        </View>
      )}

      {allMCPs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Plug size={56} color={styles.emptyText.color} style={styles.emptyIcon} />
          <Text style={styles.emptyTitle}>No Integrations Yet</Text>
          <Text style={styles.emptyText}>
            Extend your agent's capabilities by connecting to external tools, databases, and APIs through MCP servers
          </Text>
          {/* Removed 'Coming Soon' badge for integrations */}
        </View>
      ) : (
        <View>
          {allMCPs.map((mcp, index) => (
            <View key={index} style={styles.mcpCard}>
              <View style={styles.mcpHeader}>
                <View style={styles.mcpLogo}>
                  <Text style={styles.mcpLogoText}>{getFirstLetter(mcp.name)}</Text>
                </View>
                <View style={styles.mcpInfo}>
                  <Text style={styles.mcpName}>{mcp.name}</Text>
                  <Text style={styles.mcpMeta}>
                    {mcp.enabledTools?.length || 0} tools enabled
                  </Text>
                </View>
              </View>

              <View style={styles.mcpActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleConfigureTools(mcp, index)}
                  activeOpacity={0.7}
                  disabled={disabled || isSaving || deletingIndex === index}
                >
                  {isSaving && selectedMCP?.index === index ? (
                    <ActivityIndicator size="small" color={styles.actionButtonText.color} />
                  ) : (
                    <>
                      <Settings size={16} color={styles.actionButtonText.color} />
                      <Text style={styles.actionButtonText}>Configure</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.actionButtonDanger]}
                  onPress={() => handleRemoveMCP(mcp, index)}
                  activeOpacity={0.7}
                  disabled={disabled || isSaving || deletingIndex === index}
                >
                  {deletingIndex === index ? (
                    <ActivityIndicator size="small" color="#EF4444" />
                  ) : (
                    <>
                      <Trash2 size={16} color="#EF4444" />
                      <Text style={[styles.actionButtonText, styles.actionButtonTextDanger]}>Remove</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      <MCPToolsModal
        visible={toolsModalVisible}
        onClose={() => {
          setToolsModalVisible(false);
          setSelectedMCP(null);
        }}
        mcpName={selectedMCP?.mcp.name || ''}
        availableTools={selectedMCP?.mcp.enabledTools || []}
        enabledTools={selectedMCP?.mcp.enabledTools || []}
        onSave={handleToolsSave}
      />
    </ScrollView>
  );
}
