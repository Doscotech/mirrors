import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList } from 'react-native';
import useAgentStore from '@/stores/agent-store';
import useModelStore from '@/stores/model-store';
import { useTheme } from '@/hooks/useThemeColor';
import { Check, X } from 'lucide-react-native';
import { ModelProviderIcon } from '@/utils/model-provider-icons';

export const AgentSelector: React.FC = () => {
  const theme = useTheme();
  const { agents, selectedAgentId, fetchAvailableAgents, setSelectedAgent, isLoading, error } = useAgentStore();
  const { availableModels } = useModelStore();
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => { 
    console.log('[AgentSelector] Component mounted, fetching agents...');
    fetchAvailableAgents(); 
  }, []);

  console.log('[AgentSelector] Render state:', { isLoading, agents: agents?.length, error });

  if (isLoading) {
    return (
      <TouchableOpacity style={[styles.compactButton, { backgroundColor: theme.background, borderColor: theme.border }]} disabled>
        <ModelProviderIcon modelId="" size={16} backgroundColor={theme.background} borderColor={theme.border} fallbackColor={theme.mutedForeground} />
        <Text style={[styles.compactText, { color: theme.mutedForeground }]}>Loading...</Text>
      </TouchableOpacity>
    );
  }
  
  if (!agents || agents.length === 0) {
    return (
      <TouchableOpacity style={[styles.compactButton, { backgroundColor: theme.background, borderColor: theme.border }]} disabled>
        <ModelProviderIcon modelId="" size={16} backgroundColor={theme.background} borderColor={theme.border} fallbackColor={theme.mutedForeground} />
        <Text style={[styles.compactText, { color: theme.mutedForeground }]}>No agents</Text>
      </TouchableOpacity>
    );
  }

  // Use selected agent or default agent or first agent
  const selected = agents.find(a => a.agent_id === selectedAgentId) 
    || agents.find(a => a.is_default)
    || agents[0];

  const handleAgentSelect = (agentId: string) => {
    setSelectedAgent(agentId);
    setIsExpanded(false);
  };

  // Truncate long agent names
  const truncateName = (name: string, maxLength: number = 12) => {
    return name.length > maxLength ? name.substring(0, maxLength) + '...' : name;
  };

  // Get color for agent badge
  const getAgentColor = (iconColor?: string, iconBackground?: string) => {
    // Prefer icon_background for the dot, fallback to icon_color, then theme primary
    return iconBackground || iconColor || theme.primary;
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.compactButton, { 
          backgroundColor: theme.background, 
          borderColor: theme.border,
        }]}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
      >
        <View style={[styles.colorDot, { backgroundColor: getAgentColor(selected.icon_color, selected.icon_background) }]} />
        <ModelProviderIcon modelId={selected.model || ''} size={16} backgroundColor={theme.background} borderColor={theme.border} fallbackColor={theme.foreground} />
        <Text style={[styles.compactText, { color: theme.foreground }]}>
          {truncateName(selected.name)}
        </Text>
        {selected.is_default && (
          <View style={[styles.defaultBadge, { backgroundColor: theme.primary }]}>
            <Text style={[styles.badgeText, { color: theme.background }]}>★</Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal
        visible={isExpanded}
        transparent
        animationType="fade"
        onRequestClose={() => setIsExpanded(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setIsExpanded(false)}
        >
          <View 
            style={[styles.modalContent, { backgroundColor: theme.card, borderColor: theme.border }]}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.foreground }]}>Select Agent</Text>
              <TouchableOpacity onPress={() => setIsExpanded(false)}>
                <X size={20} color={theme.mutedForeground} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={agents}
              keyExtractor={(item) => item.agent_id}
              style={styles.agentList}
              renderItem={({ item: agent }) => {
                const isSelected = selected.agent_id === agent.agent_id;
                const isDefault = agent.is_default;
                
                return (
                  <TouchableOpacity
                    style={[
                      styles.agentItem,
                      { 
                        backgroundColor: isSelected ? theme.mutedWithOpacity(0.1) : 'transparent',
                      }
                    ]}
                    onPress={() => handleAgentSelect(agent.agent_id)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.agentColorDot, { backgroundColor: getAgentColor(agent.icon_color, agent.icon_background) }]} />
                    <View style={styles.agentInfo}>
                      <Text style={[styles.agentName, { color: theme.foreground }]}>
                        {agent.name}
                      </Text>
                      {agent.description && (
                        <Text style={[styles.agentDescription, { color: theme.mutedForeground }]} numberOfLines={1}>
                          {agent.description}
                        </Text>
                      )}
                    </View>
                    {isDefault && (
                      <View style={[styles.defaultBadge, { backgroundColor: theme.primary }]}>
                        <Text style={[styles.badgeText, { color: theme.background }]}>★</Text>
                      </View>
                    )}
                    {isSelected && (
                      <Check size={18} color={theme.primary} />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  compactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
    flex: 1,
  },
  compactText: {
    fontSize: 13,
    fontWeight: '500',
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  defaultBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  agentList: {
    maxHeight: 400,
  },
  agentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  agentColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  agentInfo: {
    flex: 1,
  },
  agentName: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  agentDescription: {
    fontSize: 13,
  },
});

export default AgentSelector;
