import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, MoreVertical, Edit, Trash2, Star, Globe, GlobeLock, Download } from 'lucide-react-native';
import { useThemedStyles } from '@/hooks/useThemeColor';
import useAgentStore from '@/stores/agent-store';
import useModelStore from '@/stores/model-store';
import { Agent, deleteAgent, updateAgent, publishAgent, unpublishAgent } from '@/api/agents-api';

export default function MyAgentsTab() {
  const router = useRouter();
  const { agents, isLoading, fetchAvailableAgents } = useAgentStore();
  const { availableModels } = useModelStore();
  const [actionMenuAgentId, setActionMenuAgentId] = useState<string | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);

  const styles = useThemedStyles((theme) => ({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      padding: 16,
      backgroundColor: theme.card,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '700' as const,
      color: theme.foreground,
    },
    newButton: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 6,
      backgroundColor: theme.muted,
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.border,
    },
    newButtonText: {
      color: theme.foreground,
      fontSize: 14,
      fontWeight: '600' as const,
    },
    list: {
      padding: 16,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      paddingHorizontal: 32,
      paddingTop: 60,
    },
    emptyText: {
      fontSize: 16,
      color: theme.mutedForeground,
      textAlign: 'center' as const,
      marginBottom: 20,
    },
    agentCard: {
      backgroundColor: theme.card,
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.border,
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'flex-start' as const,
    },
    agentCardContent: {
      flex: 1,
    },
    agentCardActions: {
      paddingLeft: 12,
    },
    menuButton: {
      padding: 4,
    },
    agentName: {
      fontSize: 16,
      fontWeight: '600' as const,
      color: theme.foreground,
      marginBottom: 6,
    },
    agentDescription: {
      fontSize: 14,
      color: theme.mutedForeground,
      marginBottom: 10,
    },
    agentMeta: {
      flexDirection: 'row' as const,
      gap: 12,
    },
    metaBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      backgroundColor: theme.muted,
      borderRadius: 6,
    },
    metaText: {
      fontSize: 12,
      color: theme.mutedForeground,
      fontWeight: '500' as const,
    },
    defaultBadge: {
      backgroundColor: theme.primary,
    },
    defaultText: {
      color: theme.background,
    },
    publishedBadge: {
      backgroundColor: '#10B981',
    },
    publishedText: {
      color: theme.background,
    },
    agentColorDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginRight: 8,
    },
    agentHeader: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      marginBottom: 6,
    },
    actionMenu: {
      position: 'absolute' as const,
      right: 16,
      top: 60,
      backgroundColor: theme.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 5,
      minWidth: 160,
      zIndex: 1000,
    },
    actionMenuItem: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      padding: 14,
      gap: 12,
    },
    actionMenuDivider: {
      height: 1,
      backgroundColor: theme.border,
    },
    actionMenuText: {
      fontSize: 14,
      fontWeight: '500' as const,
      color: theme.foreground,
    },
    actionMenuTextDanger: {
      color: '#EF4444',
    },
  }));

  useEffect(() => {
    fetchAvailableAgents();
  }, []);

  const handleRefresh = () => {
    fetchAvailableAgents();
  };

  const handleCreateAgent = () => {
    router.push('/private/agents/new' as any);
  };

  const handleAgentPress = (agent: Agent) => {
    setActionMenuAgentId(null);
    router.push(`/private/agents/config/${agent.agent_id}` as any);
  };

  const handleMenuPress = (agentId: string) => {
    setActionMenuAgentId(actionMenuAgentId === agentId ? null : agentId);
  };

  const handleEdit = (agent: Agent) => {
    setActionMenuAgentId(null);
    router.push(`/private/agents/config/${agent.agent_id}` as any);
  };

  const handleToggleDefault = async (agent: Agent) => {
    setActionMenuAgentId(null);
    try {
      await updateAgent(agent.agent_id, { is_default: !agent.is_default });
      await fetchAvailableAgents();
    } catch (error) {
      console.error('Failed to toggle default:', error);
      Alert.alert('Error', 'Failed to update default agent');
    }
  };

  const handleDelete = (agent: Agent) => {
    setActionMenuAgentId(null);
    Alert.alert(
      'Delete Agent',
      `Are you sure you want to delete "${agent.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAgent(agent.agent_id);
              await fetchAvailableAgents();
            } catch (error) {
              console.error('Failed to delete agent:', error);
              Alert.alert('Error', 'Failed to delete agent');
            }
          },
        },
      ]
    );
  };

  const handlePublish = async (agent: Agent) => {
    setActionMenuAgentId(null);
    Alert.alert(
      'Publish to Marketplace',
      `Publish "${agent.name}" to make it available for others to discover and install?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Publish',
          onPress: async () => {
            try {
              setPublishingId(agent.agent_id);
              await publishAgent(agent.agent_id);
              await fetchAvailableAgents();
              Alert.alert('Success', 'Agent published to marketplace!');
            } catch (error) {
              console.error('Failed to publish agent:', error);
              Alert.alert('Error', 'Failed to publish agent');
            } finally {
              setPublishingId(null);
            }
          },
        },
      ]
    );
  };

  const handleUnpublish = async (agent: Agent) => {
    setActionMenuAgentId(null);
    if (!agent.template_id) {
      Alert.alert('Error', 'This agent is not published');
      return;
    }

    Alert.alert(
      'Unpublish from Marketplace',
      `Remove "${agent.name}" from the marketplace?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unpublish',
          style: 'destructive',
          onPress: async () => {
            try {
              setPublishingId(agent.agent_id);
              await unpublishAgent(agent.template_id!);
              await fetchAvailableAgents();
              Alert.alert('Success', 'Agent removed from marketplace');
            } catch (error) {
              console.error('Failed to unpublish agent:', error);
              Alert.alert('Error', 'Failed to unpublish agent');
            } finally {
              setPublishingId(null);
            }
          },
        },
      ]
    );
  };

  const getAgentColor = (iconColor?: string, iconBackground?: string) => {
    return iconBackground || iconColor || '#3B82F6';
  };

  const getModelDisplayName = (modelId?: string) => {
    if (!modelId) return 'No model';
    const model = availableModels.find(m => m.id === modelId);
    return model?.short_name || model?.display_name || modelId;
  };

  const renderAgentCard = ({ item }: { item: Agent }) => {
    const isPublished = !!item.marketplace_published_at;
    const isPublishing = publishingId === item.agent_id;

    return (
    <View>
      <TouchableOpacity
        style={styles.agentCard}
        onPress={() => handleAgentPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.agentCardContent}>
          <View style={styles.agentHeader}>
            <View style={[styles.agentColorDot, { backgroundColor: getAgentColor(item.icon_color, item.icon_background) }]} />
            <Text style={styles.agentName}>{item.name}</Text>
          </View>
          {item.description && (
            <Text style={styles.agentDescription} numberOfLines={2}>
              {item.description}
            </Text>
          )}
          <View style={styles.agentMeta}>
            {item.is_default && (
              <View style={[styles.metaBadge, styles.defaultBadge]}>
                <Text style={[styles.metaText, styles.defaultText]}>★ Default</Text>
              </View>
            )}
            {isPublished && (
              <View style={[styles.metaBadge, styles.publishedBadge]}>
                <Text style={[styles.metaText, styles.publishedText]}>
                  📊 {item.download_count || 0} downloads
                </Text>
              </View>
            )}
            <View style={styles.metaBadge}>
              <Text style={styles.metaText}>{getModelDisplayName(item.model)}</Text>
            </View>
          </View>
        </View>
        <View style={styles.agentCardActions}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => handleMenuPress(item.agent_id)}
            disabled={isPublishing}
          >
            <MoreVertical size={20} color={styles.agentName.color} opacity={isPublishing ? 0.5 : 1} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {/* Action Menu */}
      {actionMenuAgentId === item.agent_id && (
        <View style={styles.actionMenu}>
          <TouchableOpacity
            style={styles.actionMenuItem}
            onPress={() => handleEdit(item)}
          >
            <Edit size={18} color={styles.actionMenuText.color} />
            <Text style={styles.actionMenuText}>Customize</Text>
          </TouchableOpacity>

          <View style={styles.actionMenuDivider} />

          <TouchableOpacity
            style={styles.actionMenuItem}
            onPress={() => handleToggleDefault(item)}
          >
            <Star
              size={18}
              color={item.is_default ? '#F59E0B' : styles.actionMenuText.color}
              fill={item.is_default ? '#F59E0B' : 'none'}
            />
            <Text style={styles.actionMenuText}>
              {item.is_default ? 'Remove Default' : 'Set as Default'}
            </Text>
          </TouchableOpacity>

          <View style={styles.actionMenuDivider} />

          {isPublished ? (
            <TouchableOpacity
              style={styles.actionMenuItem}
              onPress={() => handleUnpublish(item)}
            >
              <GlobeLock size={18} color={styles.actionMenuText.color} />
              <Text style={styles.actionMenuText}>Unpublish</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.actionMenuItem}
              onPress={() => handlePublish(item)}
            >
              <Globe size={18} color="#10B981" />
              <Text style={[styles.actionMenuText, { color: '#10B981' }]}>Publish to Marketplace</Text>
            </TouchableOpacity>
          )}

          <View style={styles.actionMenuDivider} />

          <TouchableOpacity
            style={styles.actionMenuItem}
            onPress={() => handleDelete(item)}
          >
            <Trash2 size={18} color="#EF4444" />
            <Text style={[styles.actionMenuText, styles.actionMenuTextDanger]}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );};

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        You haven't created any agents yet.{'\n'}
        Get started by creating your first agent!
      </Text>
      <TouchableOpacity onPress={handleCreateAgent} style={{ marginTop: 12 }}>
        <Text style={{ color: '#da221cff', fontWeight: '600' }}>Create your first agent</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Agents ({agents.length})</Text>
        <TouchableOpacity style={styles.newButton} onPress={handleCreateAgent}>
          <Plus size={18} color={styles.newButtonText.color} />
          <Text style={styles.newButtonText}>New</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={{ flex: 1 }}
        activeOpacity={1}
        onPress={() => setActionMenuAgentId(null)}
      >
        <FlatList
          data={agents}
          renderItem={renderAgentCard}
          keyExtractor={(item) => item.agent_id}
          contentContainerStyle={agents.length === 0 ? { flex: 1 } : styles.list}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
          }
        />
      </TouchableOpacity>
    </View>
  );
}
