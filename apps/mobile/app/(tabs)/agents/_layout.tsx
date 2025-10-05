import { Stack } from 'expo-router';
import { useTheme } from '@/hooks/useThemeColor';

export default function AgentsLayout() {
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.background,
        },
        headerTintColor: theme.foreground,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="config/[agentId]"
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="preview/[templateId]"
        options={{
          title: 'Template Preview',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="new"
        options={{
          title: 'New Agent',
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}
