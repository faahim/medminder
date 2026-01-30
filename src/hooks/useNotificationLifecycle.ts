import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Subscription } from 'expo-notifications';
import { MedicationService } from '../services/medication.service';
import { NotificationService } from '../services/notification.service';
import { DoseLogService } from '../services/doseLog.service';

// Check if running in Expo Go (notifications not supported in SDK 53+)
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

/**
 * Hook that integrates notifications into the app lifecycle.
 * Handles:
 * - Initial notification setup on app launch
 * - Rescheduling all notifications when app comes to foreground
 * - Updating badge count on app foreground
 * - Handling notification response events (Take/Snooze/Skip)
 * - Timezone changes (reschedule all notifications)
 */
export function useNotificationLifecycle(isDbReady: boolean) {
  const appStateSubscription = useRef<Subscription | null>(null);
  const notificationSubscription = useRef<Subscription | null>(null);
  const lastTimezone = useRef<string | null>(null);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (isExpoGo || !isDbReady || hasInitialized.current) {
      return;
    }

    let isMounted = true;

    async function initializeNotifications() {
      try {
        console.log('[NotificationLifecycle] Initializing...');

        // Request permissions and setup categories
        const hasPermission = await NotificationService.requestPermissions();
        if (!hasPermission) {
          console.log('[NotificationLifecycle] Permissions not granted');
          return;
        }

        await NotificationService.setupNotificationCategories();

        // Get all medications and reschedule notifications
        const medications = await MedicationService.getAll();
        await NotificationService.rescheduleAllNotifications(medications);

        // Clean up expired notifications
        await NotificationService.cleanupExpiredNotifications(medications);

        // Update badge count
        await NotificationService.updatePendingBadgeCount();

        // Store initial timezone
        lastTimezone.current = Intl.DateTimeFormat().resolvedOptions().timeZone;

        hasInitialized.current = true;

        if (isMounted) {
          console.log('[NotificationLifecycle] Initialized successfully');
        }
      } catch (error) {
        console.error('[NotificationLifecycle] Initialization failed:', error);
      }
    }

    initializeNotifications();

    // Cleanup on unmount
    return () => {
      isMounted = false;
    };
  }, [isDbReady]);

  useEffect(() => {
    if (isExpoGo || !isDbReady) {
      return;
    }

    const loadNotificationsModule = async () => {
      try {
        const Notifications = await import('expo-notifications');

        // Subscribe to app state changes
        appStateSubscription.current = AppState.addEventListener(
          'change',
          handleAppStateChange
        );

        // Subscribe to notification responses (user taps action buttons)
        notificationSubscription.current =
          Notifications.addNotificationResponseReceivedListener(
            handleNotificationResponse
          );

        console.log('[NotificationLifecycle] Event listeners set up');
      } catch (error) {
        console.error('[NotificationLifecycle] Failed to setup listeners:', error);
      }
    };

    loadNotificationsModule();

    return () => {
      appStateSubscription.current?.remove();
      notificationSubscription.current?.remove();
      console.log('[NotificationLifecycle] Event listeners cleaned up');
    };
  }, [isDbReady]);

  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (isExpoGo) return;

    // Check for timezone change when app comes to foreground
    if (nextAppState === 'active') {
      const currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      // Reschedule if timezone changed
      if (lastTimezone.current && lastTimezone.current !== currentTimezone) {
        console.log(
          `[NotificationLifecycle] Timezone changed from ${lastTimezone.current} to ${currentTimezone}`
        );
        const medications = await MedicationService.getAll();
        await NotificationService.rescheduleAllNotifications(medications);
        lastTimezone.current = currentTimezone;
      }

      // Update badge count on foreground
      await NotificationService.updatePendingBadgeCount();

      console.log('[NotificationLifecycle] App came to foreground');
    }
  };

  const handleNotificationResponse = async (response: any) => {
    try {
      const { medicationId, scheduledTime, medicationName } =
        response.notification.request.content.data || {};
      const action = response.actionIdentifier;

      const today = new Date().toISOString().split('T')[0];

      console.log(
        `[NotificationLifecycle] Action: ${action} for ${medicationName} at ${scheduledTime}`
      );

      switch (action) {
        case 'TAKE':
          await DoseLogService.logDose(
            medicationId,
            today,
            scheduledTime,
            'taken'
          );
          console.log('[NotificationLifecycle] Dose logged as taken');
          break;

        case 'SNOOZE':
          const medication = await MedicationService.getById(medicationId);
          if (medication) {
            await NotificationService.scheduleSnooze(medication, scheduledTime, 15);
            console.log('[NotificationLifecycle] Snooze scheduled for 15 minutes');
          }
          break;

        case 'SKIP':
          await DoseLogService.logDose(
            medicationId,
            today,
            scheduledTime,
            'skipped'
          );
          console.log('[NotificationLifecycle] Dose logged as skipped');
          break;

        default:
          // User tapped the notification (no action button)
          console.log('[NotificationLifecycle] Notification tapped without action');
          break;
      }

      // Update badge count after action
      await NotificationService.updatePendingBadgeCount();
    } catch (error) {
      console.error('[NotificationLifecycle] Failed to handle notification response:', error);
    }
  };
}
