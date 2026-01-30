// IMPORTANT: This must be first import
import 'react-native-get-random-values';
import '../global.css';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DatabaseProvider, SettingsProvider, useDatabase } from '../src/contexts';
import { useNotificationLifecycle } from '../src/hooks/useNotificationLifecycle';

// Inner component that has access to DatabaseContext
function RootLayoutInner() {
  const { isReady: dbReady } = useDatabase();

  // Initialize notification lifecycle when database is ready
  useNotificationLifecycle(dbReady);

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <DatabaseProvider>
        <SettingsProvider>
          <RootLayoutInner />
        </SettingsProvider>
      </DatabaseProvider>
    </SafeAreaProvider>
  );
}
