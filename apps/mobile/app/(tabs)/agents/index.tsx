import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useThemedStyles } from '@/hooks/useThemeColor';
import MyAgentsTab from '@/components/agents/MyAgentsTab';
import ExploreTab from '@/components/agents/ExploreTab';
import MyTemplatesTab from '@/components/agents/MyTemplatesTab';

export default function AgentsScreen() {
  const [activeTab, setActiveTab] = useState<'my-agents' | 'explore' | 'my-templates'>('my-agents');

  const styles = useThemedStyles((theme) => ({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    tabBar: {
      flexDirection: 'row' as const,
      backgroundColor: theme.card,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      paddingHorizontal: 8,
    },
    tab: {
      flex: 1,
      paddingVertical: 14,
      alignItems: 'center' as const,
      borderBottomWidth: 3,
      borderBottomColor: 'transparent',
    },
    activeTab: {
      borderBottomColor: theme.primary,
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
    },
  }));

  const renderContent = () => {
    switch (activeTab) {
      case 'my-agents':
        return <MyAgentsTab />;
      case 'explore':
        return <ExploreTab />;
      case 'my-templates':
        return <MyTemplatesTab />;
      default:
        return <MyAgentsTab />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'my-agents' && styles.activeTab]}
          onPress={() => setActiveTab('my-agents')}
        >
          <Text style={[styles.tabText, activeTab === 'my-agents' && styles.activeTabText]}>
            My Agents
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'explore' && styles.activeTab]}
          onPress={() => setActiveTab('explore')}
        >
          <Text style={[styles.tabText, activeTab === 'explore' && styles.activeTabText]}>
            Explore
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'my-templates' && styles.activeTab]}
          onPress={() => setActiveTab('my-templates')}
        >
          <Text style={[styles.tabText, activeTab === 'my-templates' && styles.activeTabText]}>
            My Templates
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        {renderContent()}
      </View>
    </View>
  );
}
