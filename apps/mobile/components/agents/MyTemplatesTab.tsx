import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, Alert } from 'react-native';
import { Globe, Download, GlobeLock, PackageOpen } from 'lucide-react-native';
import { useThemedStyles } from '@/hooks/useThemeColor';
import { unpublishAgent } from '@/api/agents-api';
import useAgentStore from '@/stores/agent-store';

export default function MyTemplatesTab() {
  const { agents, fetchAvailableAgents } = useAgentStore();
  const [isLoading, setIsLoading] = useState(false);
  const [unpublishingId, setUnpublishingId] = useState<string | null>(null);

  const styles = useThemedStyles((theme) => ({
    container: {
      flex: 1,
      backgroundColor: theme.background,
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
    emptyIcon: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.mutedWithOpacity(0.1),
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      marginBottom: 20,
    },
    emptyText: {
      fontSize: 18,
      fontWeight: '600' as const,
      color: theme.foreground,
      textAlign: 'center' as const,
      marginBottom: 8,
    },
    emptySubtext: {
      fontSize: 14,
      color: theme.mutedForeground,
      textAlign: 'center' as const,
    },
    templateCard: {
      backgroundColor: theme.card,
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.border,
    },
    templateHeader: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      marginBottom: 6,
    },
    colorDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginRight: 8,
    },
    templateName: {
      fontSize: 16,
      fontWeight: '600' as const,
      color: theme.foreground,
      flex: 1,
    },
    publishedBadge: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 4,
      backgroundColor: '#16a34a',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    publishedText: {
      color: theme.background,
      fontSize: 12,
      fontWeight: '600' as const,
    },
    templateDescription: {
      fontSize: 14,
      color: theme.mutedForeground,
      marginBottom: 12,
    },
    templateFooter: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
    },
    downloadCount: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 6,
    },
    downloadText: {
      fontSize: 12,
      color: theme.mutedForeground,
    },
    unpublishButton: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 6,
      backgroundColor: theme.mutedWithOpacity(0.2),
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
    },
    unpublishButtonDisabled: {
      opacity: 0.6,
    },
    unpublishButtonText: {
      color: theme.foreground,
      fontSize: 14,
      fontWeight: '600' as const,
    },
  }));

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setIsLoading(true);
      await fetchAvailableAgents(true); // Force refresh
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnpublish = async (agent: typeof agents[0]) => {
    if (!agent.template_id) return;

    Alert.alert(
      'Unpublish Agent',
      `Are you sure you want to unpublish "${agent.name}"? This will remove it from the marketplace.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unpublish',
          style: 'destructive',
          onPress: async () => {
            try {
              setUnpublishingId(agent.agent_id);
              await unpublishAgent(agent.template_id!);
              await fetchAvailableAgents(true); // Force refresh
              Alert.alert('Success', `"${agent.name}" has been unpublished from the marketplace.`);
            } catch (error) {
              console.error('Failed to unpublish agent:', error);
              Alert.alert('Error', 'Failed to unpublish agent');
            } finally {
              setUnpublishingId(null);
            }
          },
        },
      ]
    );
  };

  const getAgentColor = (iconColor?: string, iconBackground?: string) => {
    return iconBackground || iconColor || '#3B82F6';
  };

  // Filter to only show published agents
  const publishedAgents = agents.filter(agent => agent.marketplace_published_at);

  const renderTemplate = ({ item }: { item: typeof agents[0] }) => {
    const isUnpublishing = unpublishingId === item.agent_id;

    return (
      <View style={styles.templateCard}>
        <View style={styles.templateHeader}>
          <View style={[styles.colorDot, { backgroundColor: getAgentColor(item.icon_color, item.icon_background) }]} />
          <Text style={styles.templateName}>{item.name}</Text>
          <View style={styles.publishedBadge}>
            <Globe size={12} color="#ffffff" />
            <Text style={styles.publishedText}>Published</Text>
          </View>
        </View>
        {item.description && (
          <Text style={styles.templateDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        <View style={styles.templateFooter}>
          <View style={styles.downloadCount}>
            <Download size={14} color={styles.downloadText.color} />
            <Text style={styles.downloadText}>
              {item.download_count || 0} installs
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.unpublishButton, isUnpublishing && styles.unpublishButtonDisabled]}
            onPress={() => handleUnpublish(item)}
            disabled={isUnpublishing}
          >
            <GlobeLock size={16} color={styles.unpublishButtonText.color} />
            <Text style={styles.unpublishButtonText}>
              {isUnpublishing ? 'Unpublishing...' : 'Unpublish'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIcon}>
        <PackageOpen size={40} color={styles.emptyText.color} opacity={0.5} />
      </View>
      <Text style={styles.emptyText}>No published templates</Text>
      <Text style={styles.emptySubtext}>
        Publish an agent from "My Agents" to share it with the community
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={publishedAgents}
        renderItem={renderTemplate}
        keyExtractor={(item) => item.agent_id}
        contentContainerStyle={publishedAgents.length === 0 ? { flex: 1 } : styles.list}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={loadTemplates} />
        }
      />
    </View>
  );
}
