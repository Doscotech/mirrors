import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList } from 'react-native';
import useModelStore from '@/stores/model-store';
import { useTheme } from '@/hooks/useThemeColor';
import { Check, X } from 'lucide-react-native';
import { ModelProviderIcon } from '@/utils/model-provider-icons';

export const ModelSelector: React.FC = () => {
  const theme = useTheme();
  const { availableModels, selectedModelId, fetchAvailableModels, setSelectedModelId, loading, error } = useModelStore();
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => { 
    console.log('[ModelSelector] Component mounted, fetching models...');
    fetchAvailableModels(); 
  }, []);

  console.log('[ModelSelector] Render state:', { loading, availableModels: availableModels?.length, error });

  if (loading) {
    return (
      <TouchableOpacity style={[styles.compactButton, { backgroundColor: theme.background, borderColor: theme.border }]} disabled>
        <ModelProviderIcon modelId="" size={16} backgroundColor={theme.background} borderColor={theme.border} fallbackColor={theme.mutedForeground} />
        <Text style={[styles.compactText, { color: theme.mutedForeground }]}>Loading...</Text>
      </TouchableOpacity>
    );
  }
  
  if (!availableModels || availableModels.length === 0) {
    return (
      <TouchableOpacity style={[styles.compactButton, { backgroundColor: theme.background, borderColor: theme.border }]} disabled>
        <ModelProviderIcon modelId="" size={16} backgroundColor={theme.background} borderColor={theme.border} fallbackColor={theme.mutedForeground} />
        <Text style={[styles.compactText, { color: theme.mutedForeground }]}>No models</Text>
      </TouchableOpacity>
    );
  }

  const selected = availableModels.find(m => m.id === selectedModelId) || availableModels[0];

  const handleModelSelect = (modelId: string) => {
    setSelectedModelId(modelId);
    setIsExpanded(false);
  };

  // Truncate long model names
  const truncateName = (name: string, maxLength: number = 12) => {
    return name.length > maxLength ? name.substring(0, maxLength) + '...' : name;
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
        <ModelProviderIcon modelId={selected.id} size={16} backgroundColor={theme.background} borderColor={theme.border} fallbackColor={theme.foreground} />
        <Text style={[styles.compactText, { color: theme.foreground }]}>
          {truncateName(selected.short_name || selected.display_name)}
        </Text>
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
              <Text style={[styles.modalTitle, { color: theme.foreground }]}>Select Model</Text>
              <TouchableOpacity onPress={() => setIsExpanded(false)}>
                <X size={20} color={theme.mutedForeground} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={availableModels}
              keyExtractor={(item) => item.id}
              style={styles.modelList}
              renderItem={({ item: model }) => {
                const isSelected = selected.id === model.id;
                
                return (
                  <TouchableOpacity
                    style={[
                      styles.modelItem,
                      { 
                        backgroundColor: isSelected ? theme.mutedWithOpacity(0.1) : 'transparent',
                      }
                    ]}
                    onPress={() => handleModelSelect(model.id)}
                    activeOpacity={0.7}
                  >
                    <ModelProviderIcon modelId={model.id} size={20} backgroundColor={theme.background} borderColor={theme.border} fallbackColor={theme.foreground} />
                    <View style={styles.modelInfo}>
                      <Text style={[styles.modelName, { color: theme.foreground }]}>
                        {model.display_name}
                      </Text>
                      {model.short_name && model.short_name !== model.display_name && (
                        <Text style={[styles.modelShortName, { color: theme.mutedForeground }]}>
                          {model.short_name}
                        </Text>
                      )}
                    </View>
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
  modelList: {
    maxHeight: 400,
  },
  modelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  modelInfo: {
    flex: 1,
  },
  modelName: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  modelShortName: {
    fontSize: 13,
  },
});

export default ModelSelector;
