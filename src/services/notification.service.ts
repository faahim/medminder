import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';
import { Medication, MealTiming } from '../types';
import { format, addMinutes } from 'date-fns';
import { DoseLogService } from './doseLog.service';

// Check if running in Expo Go (notifications not supported in SDK 53+)
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

// Lazy-loaded notifications module (only load when not in Expo Go)
let Notifications: typeof import('expo-notifications') | null = null;

const getNotifications = async () => {
  if (isExpoGo) return null;
  if (!Notifications) {
    Notifications = await import('expo-notifications');
    // Configure notification behavior
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  }
  return Notifications;
};

// Notification ID prefix for each medication
const getNotificationId = (medicationId: string, time: string): string => {
  return `med-${medicationId}-${time.replace(':', '')}`;
};

// Get meal timing text for notification
const getMealTimingText = (timing: MealTiming): string => {
  switch (timing) {
    case 'before': return '(take before meal)';
    case 'after': return '(take after meal)';
    case 'with': return '(take with food)';
    default: return '';
  }
};

export const NotificationService = {
  // Check if notifications are available
  isAvailable(): boolean {
    return !isExpoGo;
  },

  // Request notification permissions
  async requestPermissions(): Promise<boolean> {
    const notif = await getNotifications();
    if (!notif) {
      console.log('[Notifications] Skipped - not available in Expo Go');
      return false;
    }

    const { status: existingStatus } = await notif.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await notif.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return false;
    }

    // Android channel setup
    if (Platform.OS === 'android') {
      await notif.setNotificationChannelAsync('medication-reminders', {
        name: 'Medication Reminders',
        importance: notif.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4CAF50',
        sound: 'default',
      });
    }

    return true;
  },

  // Schedule notifications for a medication
  async scheduleMedicationNotifications(medication: Medication): Promise<void> {
    if (!medication.isActive) return;
    const notif = await getNotifications();
    if (!notif) return;

    const times = JSON.parse(medication.scheduleTimes) as string[];
    const mealText = getMealTimingText(medication.mealTiming);

    for (const time of times) {
      const [hour, minute] = time.split(':').map(Number);
      const notificationId = getNotificationId(medication.id, time);

      // Cancel existing notification for this slot
      await notif.cancelScheduledNotificationAsync(notificationId).catch(() => {});

      // Schedule new notification
      await notif.scheduleNotificationAsync({
        identifier: notificationId,
        content: {
          title: '💊 Time for your medication',
          body: `${medication.name} ${medication.dosage} ${mealText}`.trim(),
          data: {
            medicationId: medication.id,
            medicationName: medication.name,
            dosage: medication.dosage,
            scheduledTime: time,
            type: 'medication-reminder',
          },
          categoryIdentifier: 'medication',
          sound: 'default',
        },
        trigger: {
          type: notif.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
        },
      });
    }
  },

  // Cancel all notifications for a medication
  async cancelMedicationNotifications(medicationId: string): Promise<void> {
    const notif = await getNotifications();
    if (!notif) return;

    const scheduled = await notif.getAllScheduledNotificationsAsync();

    for (const notification of scheduled) {
      if (notification.identifier.startsWith(`med-${medicationId}-`)) {
        await notif.cancelScheduledNotificationAsync(notification.identifier);
      }
    }
  },

  // Reschedule all notifications (call on app start)
  async rescheduleAllNotifications(medications: Medication[]): Promise<void> {
    const notif = await getNotifications();
    if (!notif) return;

    // Cancel all existing medication notifications
    const scheduled = await notif.getAllScheduledNotificationsAsync();
    for (const notification of scheduled) {
      if (notification.identifier.startsWith('med-')) {
        await notif.cancelScheduledNotificationAsync(notification.identifier);
      }
    }

    // Reschedule for all active medications
    for (const med of medications) {
      if (med.isActive) {
        await this.scheduleMedicationNotifications(med);
      }
    }
  },

  // Schedule a snooze notification
  async scheduleSnooze(
    medication: Medication,
    originalTime: string,
    snoozeMinutes: number
  ): Promise<void> {
    const notif = await getNotifications();
    if (!notif) return;

    const snoozeId = `snooze-${medication.id}-${Date.now()}`;
    const snoozeDate = addMinutes(new Date(), snoozeMinutes);

    await notif.scheduleNotificationAsync({
      identifier: snoozeId,
      content: {
        title: '💊 Reminder (snoozed)',
        body: `${medication.name} ${medication.dosage} - originally scheduled for ${originalTime}`,
        data: {
          medicationId: medication.id,
          medicationName: medication.name,
          dosage: medication.dosage,
          scheduledTime: originalTime,
          type: 'medication-snooze',
        },
        categoryIdentifier: 'medication-snooze',
        sound: 'default',
      },
      trigger: {
        type: notif.SchedulableTriggerInputTypes.DATE,
        date: snoozeDate,
      },
    });
  },

  // Set up notification action categories with multiple snooze options
  async setupNotificationCategories(): Promise<void> {
    const notif = await getNotifications();
    if (!notif) return;

    // iOS allows up to 4 actions per category
    // We include: TAKE, SNOOZE_15, SNOOZE_30, SNOOZE_60
    // User can tap notification body for more options (including custom snooze, skip with reason)
    await notif.setNotificationCategoryAsync('medication', [
      {
        identifier: 'TAKE',
        buttonTitle: '✓ Take Now',
        options: {
          opensAppToForeground: false,
        },
      },
      {
        identifier: 'SNOOZE_15',
        buttonTitle: '⏰ 15m',
        options: {
          opensAppToForeground: false,
        },
      },
      {
        identifier: 'SNOOZE_30',
        buttonTitle: '⏰ 30m',
        options: {
          opensAppToForeground: false,
        },
      },
      {
        identifier: 'SNOOZE_60',
        buttonTitle: '⏰ 1h',
        options: {
          opensAppToForeground: false,
        },
      },
    ]);

    // Separate category for snoozed notifications (includes skip option)
    await notif.setNotificationCategoryAsync('medication-snooze', [
      {
        identifier: 'TAKE',
        buttonTitle: '✓ Take Now',
        options: {
          opensAppToForeground: false,
        },
      },
      {
        identifier: 'SNOOZE_15',
        buttonTitle: '⏰ 15m',
        options: {
          opensAppToForeground: false,
        },
      },
      {
        identifier: 'SKIP',
        buttonTitle: 'Skip',
        options: {
          opensAppToForeground: false,
          isDestructive: true,
        },
      },
    ]);
  },

  // Update badge count based on pending doses today
  async updatePendingBadgeCount(): Promise<void> {
    const notif = await getNotifications();
    if (!notif) return;

    const today = format(new Date(), 'yyyy-MM-dd');
    const pendingLogs = await DoseLogService.getDosesForDate(today);
    const pendingCount = pendingLogs.filter(log => log.status === 'pending').length;
    await notif.setBadgeCountAsync(pendingCount);
  },

  // Check if medication should be scheduled (respects endDate)
  isMedicationSchedulable(medication: Medication): boolean {
    if (!medication.isActive) return false;

    const today = format(new Date(), 'yyyy-MM-dd');

    // Check if end date has passed
    if (medication.endDate && medication.endDate < today) {
      return false;
    }

    // Check if start date hasn't arrived
    if (medication.startDate > today) {
      return false;
    }

    return true;
  },

  // Clean up expired medications' notifications
  async cleanupExpiredNotifications(medications: Medication[]): Promise<void> {
    const notif = await getNotifications();
    if (!notif) return;

    for (const med of medications) {
      if (!this.isMedicationSchedulable(med)) {
        await this.cancelMedicationNotifications(med.id);
      }
    }
  },
};

// Export individual functions for convenience
export const {
  isAvailable,
  requestPermissions,
  scheduleMedicationNotifications,
  cancelMedicationNotifications,
  rescheduleAllNotifications,
  scheduleSnooze,
  setupNotificationCategories,
  updatePendingBadgeCount,
  isMedicationSchedulable,
  cleanupExpiredNotifications,
} = NotificationService;
