// IMPORTANT: This must be the first import
import 'react-native-get-random-values';

import { Stack } from 'expo-router';
import { DatabaseProvider, SettingsProvider } from '../src/contexts';
import { NotificationService } from '../src/services/notification.service';

// Request notification permissions on app start
NotificationService.requestPermissions().catch(console.error);
NotificationService.setupNotificationCategories().catch(console.error);

export default function RootLayout() {
  return (
    <DatabaseProvider>
      <SettingsProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
        </Stack>
      </SettingsProvider>
    </DatabaseProvider>
  );
}
