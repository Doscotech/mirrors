import { fontWeights } from '@/constants/Fonts';
import { useAuth } from '@/hooks/useAuth';
import { useThemedStyles } from '@/hooks/useThemeColor';
import { X, Bot, ChevronRight } from 'lucide-react-native';
import React from 'react';
import { Modal, Platform, TouchableOpacity, View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Caption, H3, Body } from './Typography';
import { useRouter } from 'expo-router';

interface SettingsDrawerProps {
    visible: boolean;
    onClose: () => void;
}

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({ visible, onClose }) => {
    const insets = useSafeAreaInsets();
    const { signOut } = useAuth();
    const router = useRouter();

    const styles = useThemedStyles((theme) => ({
        container: {
            flex: 1,
            backgroundColor: Platform.OS === 'android' ? 'rgba(0, 0, 0, 0.5)' : 'transparent',
            justifyContent: 'flex-end' as const,
        },
        drawer: {
            backgroundColor: theme.background,
            ...(Platform.OS === 'ios' ? { height: '100%' as const } : { height: '93%' as const }),
            borderTopLeftRadius: Platform.OS === 'android' ? 16 : 0,
            borderTopRightRadius: Platform.OS === 'android' ? 16 : 0,
            paddingTop: 20,
            paddingBottom: insets.bottom,
        },
        header: {
            flexDirection: 'row' as const,
            justifyContent: 'space-between' as const,
            alignItems: 'center' as const,
            paddingHorizontal: 20,
            paddingBottom: 20,
            borderBottomWidth: 1,
            borderBottomColor: theme.border,
        },
        title: {
            color: theme.foreground,
        },
        closeButton: {
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: theme.mutedWithOpacity(0.1),
            justifyContent: 'center' as const,
            alignItems: 'center' as const,
        },
        content: {
            flex: 1,
            paddingHorizontal: 20,
            paddingTop: 20,
        },
        menuSection: {
            marginBottom: 24,
        },
        sectionTitle: {
            color: theme.mutedForeground,
            fontSize: 14,
            fontFamily: fontWeights[600],
            textTransform: 'uppercase' as const,
            letterSpacing: 0.5,
            marginBottom: 12,
        },
        menuItem: {
            flexDirection: 'row' as const,
            alignItems: 'center' as const,
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 8,
            backgroundColor: theme.mutedWithOpacity(0.05),
            marginBottom: 8,
        },
        menuIcon: {
            marginRight: 12,
        },
        menuText: {
            flex: 1,
            color: theme.foreground,
            fontSize: 15,
            fontFamily: fontWeights[500],
        },
        menuDescription: {
            color: theme.mutedForeground,
            fontSize: 13,
            marginTop: 2,
        },
        signOutButton: {
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 8,
            backgroundColor: theme.mutedWithOpacity(0.1),
            marginTop: 'auto' as const,
            marginBottom: 20,
        },
        signOutText: {
            color: theme.destructive,
            fontSize: 15,
            fontFamily: fontWeights[500],
            textAlign: 'center' as const,
        },
    }));

    const handleSignOut = async () => {
        try {
            await signOut();
            onClose();
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const handleCommandCenter = () => {
        onClose();
        router.push('/private/agents');
    };

    return (
        <Modal
            visible={visible}
            transparent={Platform.OS === 'android'}
            animationType="slide"
            presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : undefined}
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                {Platform.OS === 'android' && (
                    <TouchableOpacity
                        style={{ flex: 1 }}
                        activeOpacity={1}
                        onPress={onClose}
                    />
                )}

                <View style={styles.drawer}>
                    <View style={styles.header}>
                        <H3 style={styles.title}>Settings</H3>
                        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                            <X size={18} color={styles.title.color} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        <View style={styles.menuSection}>
                            <Caption style={styles.sectionTitle}>Agent Management</Caption>
                            <TouchableOpacity style={styles.menuItem} onPress={handleCommandCenter}>
                                <Bot size={20} color={styles.title.color} style={styles.menuIcon} />
                                <View style={{ flex: 1 }}>
                                    <Body style={styles.menuText}>Command Center</Body>
                                    <Caption style={styles.menuDescription}>
                                        Manage your AI agents, templates, and configurations
                                    </Caption>
                                </View>
                                <ChevronRight size={18} color={styles.menuText.color} opacity={0.5} />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
                            <Caption style={styles.signOutText}>Sign Out</Caption>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}; 