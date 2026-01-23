import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Medication, MealTiming } from '../types';
import { format, addMinutes } from 'date-fns';
import { DoseLogService } from './doseLog.service';

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
  // Request notification permissions
  async requestPermissions(): Promise<boolean> {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return false;
    }

    // Android channel setup
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('medication-reminders', {
        name: 'Medication Reminders',
        importance: Notifications.AndroidImportance.HIGH,
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

    const times = JSON.parse(medication.scheduleTimes) as string[];
    const mealText = getMealTimingText(medication.mealTiming);

    for (const time of times) {
      const [hour, minute] = time.split(':').map(Number);
      const notificationId = getNotificationId(medication.id, time);

      // Cancel existing notification for this slot
      await Notifications.cancelScheduledNotificationAsync(notificationId).catch(() => {});

      // Schedule new notification
      await Notifications.scheduleNotificationAsync({
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
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
        },
      });
    }
  },

  // Cancel all notifications for a medication
  async cancelMedicationNotifications(medicationId: string): Promise<void> {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    
    for (const notification of scheduled) {
      if (notification.identifier.startsWith(`med-${medicationId}-`)) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }
  },

  // Reschedule all notifications (call on app start)
  async rescheduleAllNotifications(medications: Medication[]): Promise<void> {
    // Cancel all existing medication notifications
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notification of scheduled) {
      if (notification.identifier.startsWith('med-')) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
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
    const snoozeId = `snooze-${medication.id}-${Date.now()}`;
    const snoozeDate = addMinutes(new Date(), snoozeMinutes);

    await Notifications.scheduleNotificationAsync({
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
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: snoozeDate,
      },
    });
  },

  // Set up notification action categories
  async setupNotificationCategories(): Promise<void> {
    await Notifications.setNotificationCategoryAsync('medication', [
      {
        identifier: 'TAKE',
        buttonTitle: '✓ Take Now',
        options: {
          opensAppToForeground: false,
        },
      },
      {
        identifier: 'SNOOZE',
        buttonTitle: '⏰ Snooze 15min',
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
    const today = format(new Date(), 'yyyy-MM-dd');
    const pendingLogs = await DoseLogService.getDosesForDate(today);
    const pendingCount = pendingLogs.filter(log => log.status === 'pending').length;
    await Notifications.setBadgeCountAsync(pendingCount);
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
    for (const med of medications) {
      if (!this.isMedicationSchedulable(med)) {
        await this.cancelMedicationNotifications(med.id);
      }
    }
  },
};

// Export individual functions for convenience
export const {
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
