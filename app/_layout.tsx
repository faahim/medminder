// IMPORTANT: This must be the first import
import 'react-native-get-random-values';
import '../global.css';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DatabaseProvider, SettingsProvider } from '../src/contexts';
import { NotificationService } from '../src/services/notification.service';

// Request notification permissions on app start
NotificationService.requestPermissions().catch(console.error);
NotificationService.setupNotificationCategories().catch(console.error);

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <DatabaseProvider>
        <SettingsProvider>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
          </Stack>
        </SettingsProvider>
      </DatabaseProvider>
    </SafeAreaProvider>
  );
}
