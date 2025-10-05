import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, TextInput, Alert } from 'react-native';
import { Globe, Download, Search, X } from 'lucide-react-native';
import { useThemedStyles } from '@/hooks/useThemeColor';
import { fetchMarketplaceTemplates, installTemplate, Agent } from '@/api/agents-api';
import useAgentStore from '@/stores/agent-store';

export default function ExploreTab() {
  const { fetchAvailableAgents } = useAgentStore();
  const [templates, setTemplates] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [installingId, setInstallingId] = useState<string | null>(null);

  const styles = useThemedStyles((theme) => ({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      padding: 16,
      backgroundColor: theme.card,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    searchContainer: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      backgroundColor: theme.background,
      borderRadius: 12,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: theme.border,
    },
    searchInput: {
      flex: 1,
      paddingVertical: 10,
      paddingHorizontal: 8,
      color: theme.foreground,
      fontSize: 14,
    },
    clearButton: {
      padding: 4,
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
    installButton: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 6,
      backgroundColor: theme.muted,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.border,
    },
    installButtonDisabled: {
      opacity: 0.6,
    },
    installButtonText: {
      color: theme.foreground,
      fontSize: 14,
      fontWeight: '600' as const,
    },
  }));

  useEffect(() => {
    loadTemplates();
  }, [searchQuery]);

  const loadTemplates = async () => {
    try {
      setIsLoading(true);
      const response = await fetchMarketplaceTemplates({
        search: searchQuery || undefined,
        limit: 50,
      });
      setTemplates(response.templates);
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInstall = async (template: Agent) => {
    try {
      setInstallingId(template.template_id!);
      await installTemplate(template.template_id!);
      await fetchAvailableAgents();
      Alert.alert('Success', `"${template.name}" has been added to your agents!`);
    } catch (error) {
      console.error('Failed to install template:', error);
      Alert.alert('Error', 'Failed to install template');
    } finally {
      setInstallingId(null);
    }
  };

  const getAgentColor = (iconColor?: string, iconBackground?: string) => {
    return iconBackground || iconColor || '#3B82F6';
  };

  const renderTemplate = ({ item }: { item: Agent }) => {
    const isInstalling = installingId === item.template_id;

    return (
      <View style={styles.templateCard}>
        <View style={styles.templateHeader}>
          <View style={[styles.colorDot, { backgroundColor: getAgentColor(item.icon_color, item.icon_background) }]} />
          <Text style={styles.templateName}>{item.name}</Text>
        </View>
        {item.description && (
          <Text style={styles.templateDescription} numberOfLines={3}>
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
            style={[styles.installButton, isInstalling && styles.installButtonDisabled]}
            onPress={() => handleInstall(item)}
            disabled={isInstalling}
          >
            <Download size={16} color={styles.installButtonText.color} />
            <Text style={styles.installButtonText}>
              {isInstalling ? 'Installing...' : 'Install'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIcon}>
        <Globe size={40} color={styles.emptyText.color} opacity={0.5} />
      </View>
      <Text style={styles.emptyText}>
        {searchQuery ? 'No templates found' : 'No templates available'}
      </Text>
      <Text style={styles.emptySubtext}>
        {searchQuery
          ? 'Try a different search term'
          : 'Check back later for community-created agents'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={18} color={styles.downloadText.color} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search marketplace..."
            placeholderTextColor={styles.downloadText.color}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setSearchQuery('')}
            >
              <X size={18} color={styles.downloadText.color} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={templates}
        renderItem={renderTemplate}
        keyExtractor={(item) => item.template_id!}
        contentContainerStyle={templates.length === 0 ? { flex: 1 } : styles.list}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={loadTemplates} />
        }
      />
    </View>
  );
}
