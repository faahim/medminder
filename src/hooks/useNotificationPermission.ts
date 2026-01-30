import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';

// Check if running in Expo Go (notifications not supported in SDK 53+)
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

export type NotificationPermissionStatus = 'not-determined' | 'granted' | 'denied';

// Lazy-loaded notifications module
let Notifications: typeof import('expo-notifications') | null = null;

const getNotifications = async () => {
  if (isExpoGo) return null;
  if (!Notifications) {
    Notifications = await import('expo-notifications');
  }
  return Notifications;
};

/**
 * Hook to manage notification permissions
 * Provides the current permission status and functions to request permissions
 */
export function useNotificationPermission() {
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermissionStatus>('not-determined');
  const [isLoading, setIsLoading] = useState(true);

  // Load initial permission status
  useEffect(() => {
    loadPermissionStatus();
  }, []);

  const loadPermissionStatus = async () => {
    try {
      const notif = await getNotifications();
      if (!notif) {
        setPermissionStatus('denied'); // Treat as denied if notifications not available
        setIsLoading(false);
        return;
      }

      const { status } = await notif.getPermissionsAsync();
      setPermissionStatus(status as NotificationPermissionStatus);
    } catch (error) {
      console.error('[useNotificationPermission] Failed to load permission status:', error);
      setPermissionStatus('denied');
    } finally {
      setIsLoading(false);
    }
  };

  const requestPermission = async (): Promise<NotificationPermissionStatus> => {
    try {
      const notif = await getNotifications();
      if (!notif) {
        setPermissionStatus('denied');
        return 'denied';
      }

      const { status } = await notif.requestPermissionsAsync();
      setPermissionStatus(status as NotificationPermissionStatus);

      // Android channel setup when permission is granted
      if (Platform.OS === 'android' && status === 'granted') {
        await notif.setNotificationChannelAsync('medication-reminders', {
          name: 'Medication Reminders',
          importance: notif.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#4CAF50',
          sound: 'default',
        });
      }

      return status as NotificationPermissionStatus;
    } catch (error) {
      console.error('[useNotificationPermission] Failed to request permission:', error);
      setPermissionStatus('denied');
      return 'denied';
    }
  };

  const checkPermissions = async (): Promise<NotificationPermissionStatus> => {
    const notif = await getNotifications();
    if (!notif) {
      return 'denied';
    }

    const { status } = await notif.getPermissionsAsync();
    setPermissionStatus(status as NotificationPermissionStatus);
    return status as NotificationPermissionStatus;
  };

  return {
    permissionStatus,
    isLoading,
    requestPermission,
    checkPermissions,
    isAvailable: !isExpoGo,
  };
}
