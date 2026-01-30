import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';
import { Medication, MealTiming, NotificationPermissionStatus } from '../types';
import { format, addMinutes, addDays } from 'date-fns';
import { DoseLogService } from './doseLog.service';
import { SettingsService } from './settings.service';

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
    case 'before': return '• Before meal';
    case 'after': return '• After meal';
    case 'with': return '• With food';
    default: return '';
  }
};

// Get meal timing icon
const getMealTimingIcon = (timing: MealTiming): string => {
  switch (timing) {
    case 'before': return '🥗';
    case 'after': return '🍽️';
    case 'with': return '🍲';
    default: return '';
  }
};

// Format time for display (12-hour format)
const formatTimeDisplay = (time: string): string => {
  const [hour, minute] = time.split(':').map(Number);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  const displayMinute = minute.toString().padStart(2, '0');
  return `${displayHour}:${displayMinute} ${ampm}`;
};

// Convert time string "HH:MM" to minutes since midnight
const timeToMinutes = (time: string): number => {
  const [hour, minute] = time.split(':').map(Number);
  return hour * 60 + minute;
};

// Check if current time is within quiet hours
const isWithinQuietHours = (
  currentTime: Date,
  quietHoursEnabled: boolean,
  quietHoursStart: string,
  quietHoursEnd: string
): boolean => {
  if (!quietHoursEnabled) return false;

  const currentMinutes = timeToMinutes(currentTime.toTimeString().slice(0, 5));
  const startMinutes = timeToMinutes(quietHoursStart);
  const endMinutes = timeToMinutes(quietHoursEnd);

  // Handle overnight quiet hours (e.g., 22:00 to 07:00)
  if (startMinutes > endMinutes) {
    // Quiet period crosses midnight
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
  } else {
    // Normal quiet period within same day
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  }
};

// Parse time string "HH:MM" to today's Date object at that time
const parseTimeToToday = (time: string): Date => {
  const [hour, minute] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date;
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
    // Check if notifications are enabled for this medication
    if (!medication.notificationsEnabled) return;

    const notif = await getNotifications();
    if (!notif) return;

    // Get settings to check quiet hours
    const settings = await SettingsService.get();

    // If notifications are globally disabled, don't schedule
    if (!settings.notificationsEnabled) return;

    const times = JSON.parse(medication.scheduleTimes) as string[];
    const mealText = getMealTimingText(medication.mealTiming);

    // Map sound name to expo-notifications sound
    const getSound = (soundName: string): any => {
      switch (soundName) {
        case 'gentle':
          return null; // Use system default gentle sound
        case 'urgent':
          return 'default'; // Use default (louder)
        default:
          return 'default';
      }
    };

    for (const time of times) {
      const [hour, minute] = time.split(':').map(Number);
      const notificationId = getNotificationId(medication.id, time);

      // Cancel existing notification for this slot
      await notif.cancelScheduledNotificationAsync(notificationId).catch(() => {});

      // Check if this time falls within quiet hours
      const scheduledTimeForToday = parseTimeToToday(time);
      const isQuietTime = isWithinQuietHours(
        scheduledTimeForToday,
        settings.quietHoursEnabled,
        settings.quietHoursStart,
        settings.quietHoursEnd
      );

      let trigger: any;

      if (isQuietTime) {
        // The scheduled time falls within quiet hours
        // If quiet hours end today (same day), schedule for after quiet hours end
        const quietEndMinutes = timeToMinutes(settings.quietHoursEnd);
        const scheduledMinutes = timeToMinutes(time);

        if (quietEndMinutes < scheduledMinutes) {
          // Quiet hours ended earlier in the day, but current time is within quiet hours
          // This happens when quiet period crosses midnight (e.g., 22:00-07:00)
          // Schedule for tomorrow at the same time
          const tomorrow = addDays(new Date(), 1);
          trigger = {
            type: notif.SchedulableTriggerInputTypes.DATE,
            date: new Date(tomorrow.setHours(hour, minute, 0, 0)),
          };
        } else {
          // Quiet hours end later today - schedule for after quiet hours end
          const [endHour, endMinute] = settings.quietHoursEnd.split(':').map(Number);
          const today = new Date();
          today.setHours(endHour, endMinute, 0, 0);
          trigger = {
            type: notif.SchedulableTriggerInputTypes.DATE,
            date: today,
          };
        }
      } else {
        // Normal schedule - use daily trigger
        trigger = {
          type: notif.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
        };
      }

      // Schedule new notification
      const mealIcon = getMealTimingIcon(medication.mealTiming);
      const displayTime = formatTimeDisplay(time);

      await notif.scheduleNotificationAsync({
        identifier: notificationId,
        content: {
          title: `💊 Time for ${medication.name}`,
          body: `${medication.dosage} ${medication.dosageUnit}\n${mealText ? mealText + '\n' : ''}🕐 ${displayTime}${mealIcon ? ' ' + mealIcon : ''}`,
          data: {
            medicationId: medication.id,
            medicationName: medication.name,
            dosage: medication.dosage,
            scheduledTime: time,
            type: 'medication-reminder',
          },
          categoryIdentifier: 'medication',
          sound: getSound(medication.notificationSound),
        },
        trigger,
      });

      // Schedule advance reminder if enabled
      if (medication.reminderAdvanceMinutes && medication.reminderAdvanceMinutes > 0) {
        const advanceId = `advance-${medication.id}-${time.replace(':', '')}`;
        await notif.cancelScheduledNotificationAsync(advanceId).catch(() => {});

        // Calculate trigger time for advance reminder
        // We schedule this for the same day, but advance minutes before
        const advanceMinutes = medication.reminderAdvanceMinutes;
        let advanceHour = hour;
        let advanceMinute = minute - advanceMinutes;

        // Handle minute overflow
        if (advanceMinute < 0) {
          advanceMinute += 60;
          advanceHour -= 1;
        }
        // Handle hour overflow
        if (advanceHour < 0) {
          advanceHour += 24;
        }

        // Check if advance reminder time falls within quiet hours
        const advanceTimeForToday = new Date();
        advanceTimeForToday.setHours(advanceHour, advanceMinute, 0, 0);
        const isAdvanceQuietTime = isWithinQuietHours(
          advanceTimeForToday,
          settings.quietHoursEnabled,
          settings.quietHoursStart,
          settings.quietHoursEnd
        );

        let advanceTrigger: any;

        if (isAdvanceQuietTime) {
          // Advance reminder falls within quiet hours - skip it
          console.log(`[NotificationService] Skipping advance reminder for ${medication.name} at ${time} (falls within quiet hours)`);
          continue;
        } else {
          advanceTrigger = {
            type: notif.SchedulableTriggerInputTypes.DAILY,
            hour: advanceHour,
            minute: advanceMinute,
          };
        }

        const mealIcon = getMealTimingIcon(medication.mealTiming);
        const displayTime = formatTimeDisplay(time);

        await notif.scheduleNotificationAsync({
          identifier: advanceId,
          content: {
            title: `⏰ Upcoming: ${medication.name}`,
            body: `💊 ${medication.dosage} ${medication.dosageUnit} at ${displayTime}\n${mealText ? mealText + '\n' : ''}In ${advanceMinutes} min${mealIcon ? ' ' + mealIcon : ''}`,
            data: {
              medicationId: medication.id,
              medicationName: medication.name,
              dosage: medication.dosage,
              scheduledTime: time,
              type: 'medication-advance',
            },
            categoryIdentifier: 'medication',
            sound: getSound(medication.notificationSound),
          },
          trigger: advanceTrigger,
        });
      }
    }
  },

  // Cancel all notifications for a medication
  async cancelMedicationNotifications(medicationId: string): Promise<void> {
    const notif = await getNotifications();
    if (!notif) return;

    const scheduled = await notif.getAllScheduledNotificationsAsync();

    for (const notification of scheduled) {
      // Cancel both regular and advance notifications
      if (notification.identifier.startsWith(`med-${medicationId}-`) ||
          notification.identifier.startsWith(`advance-${medicationId}-`) ||
          notification.identifier.startsWith(`missed-${medicationId}-`)) {
        await notif.cancelScheduledNotificationAsync(notification.identifier);
      }
    }
  },

  // Reschedule all notifications (call on app start)
  async rescheduleAllNotifications(medications: Medication[]): Promise<void> {
    const notif = await getNotifications();
    if (!notif) return;

    // Cancel all existing medication notifications (including advance and missed)
    const scheduled = await notif.getAllScheduledNotificationsAsync();
    for (const notification of scheduled) {
      if (notification.identifier.startsWith('med-') ||
          notification.identifier.startsWith('advance-') ||
          notification.identifier.startsWith('missed-')) {
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
    const displayTime = formatTimeDisplay(originalTime);
    const mealIcon = getMealTimingIcon(medication.mealTiming);

    await notif.scheduleNotificationAsync({
      identifier: snoozeId,
      content: {
        title: `💊 Reminder (snoozed): ${medication.name}`,
        body: `${medication.dosage} ${medication.dosageUnit}${mealIcon ? ' ' + mealIcon : ''}\n🕐 Originally scheduled for ${displayTime}`,
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

    // Category for missed dose follow-up notifications
    await notif.setNotificationCategoryAsync('medication-missed', [
      {
        identifier: 'TAKE_LATE',
        buttonTitle: 'Take Now',
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

    const settings = await SettingsService.get();

    // If badge is disabled, set to 0
    if (!settings.badgeEnabled) {
      await notif.setBadgeCountAsync(0);
      return;
    }

    const today = format(new Date(), 'yyyy-MM-dd');
    const now = new Date();

    const pendingLogs = await DoseLogService.getDosesForDate(today);

    // Only count pending doses that are still in the future (or within a small window of now)
    // This prevents showing badges for doses that have already passed
    const pendingCount = pendingLogs.filter(log => {
      if (log.status !== 'pending') return false;

      const [hour, minute] = log.scheduledTime.split(':').map(Number);
      const scheduledTime = new Date();
      scheduledTime.setHours(hour, minute, 0, 0);

      // Include doses that are still upcoming or within 15 minutes of now
      const minutesDiff = (scheduledTime.getTime() - now.getTime()) / (1000 * 60);
      return minutesDiff > -15; // Show if within 15 minutes past scheduled time
    }).length;

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

  // Check if a notification is scheduled for a specific medication and time
  async isNotificationScheduled(medicationId: string, time: string): Promise<boolean> {
    const notif = await getNotifications();
    if (!notif) return false;

    const notificationId = getNotificationId(medicationId, time);
    const scheduled = await notif.getAllScheduledNotificationsAsync();

    return scheduled.some(n => n.identifier === notificationId);
  },

  // Cancel notification for a specific medication and time slot
  async cancelDoseNotification(medicationId: string, time: string): Promise<void> {
    const notif = await getNotifications();
    if (!notif) return;

    const notificationId = getNotificationId(medicationId, time);
    await notif.cancelScheduledNotificationAsync(notificationId).catch(() => {});
  },

  // Schedule a follow-up notification for a missed dose
  async scheduleMissedDoseFollowUp(
    medication: Medication,
    originalTime: string
  ): Promise<void> {
    const notif = await getNotifications();
    if (!notif) return;

    try {
      const settings = await SettingsService.get();

      // Skip if notifications are disabled
      if (!settings.notificationsEnabled) return;

      const gracePeriodMinutes = settings.gracePeriodMinutes || 30;
      const followUpId = `missed-${medication.id}-${originalTime}`;
      const followUpDate = addMinutes(new Date(), gracePeriodMinutes);
      const displayTime = formatTimeDisplay(originalTime);
      const mealIcon = getMealTimingIcon(medication.mealTiming);

      await notif.scheduleNotificationAsync({
        identifier: followUpId,
        content: {
          title: `⚠️ Missed: ${medication.name}`,
          body: `${medication.dosage} ${medication.dosageUnit}${mealIcon ? ' ' + mealIcon : ''}\n🕐 ${displayTime}\n\nTap to take now or skip.`,
          data: {
            medicationId: medication.id,
            medicationName: medication.name,
            dosage: medication.dosage,
            scheduledTime: originalTime,
            type: 'medication-missed',
          },
          categoryIdentifier: 'medication-missed',
          sound: 'default',
        },
        trigger: {
          type: notif.SchedulableTriggerInputTypes.DATE,
          date: followUpDate,
        },
      });
    } catch (error) {
      console.error('[NotificationService] Failed to schedule missed dose follow-up:', error);
    }
  },

  // Cancel a missed dose follow-up notification
  async cancelMissedDoseFollowUp(medicationId: string, time: string): Promise<void> {
    const notif = await getNotifications();
    if (!notif) return;

    const followUpId = `missed-${medicationId}-${time}`;
    await notif.cancelScheduledNotificationAsync(followUpId).catch(() => {});
  },

  // Check if a missed dose follow-up is scheduled
  async isMissedDoseFollowUpScheduled(medicationId: string, time: string): Promise<boolean> {
    const notif = await getNotifications();
    if (!notif) return false;

    const followUpId = `missed-${medicationId}-${time}`;
    const scheduled = await notif.getAllScheduledNotificationsAsync();

    return scheduled.some(n => n.identifier === followUpId);
  },

  // Process and check for missed doses
  // This should be called when the app is opened to detect and update any missed doses
  async checkAndUpdateMissedDoses(): Promise<number> {
    const settings = await SettingsService.get();
    const thresholdMinutes = settings.missedThresholdMinutes || 60;

    // Use the dose log service to mark overdue doses as missed
    const missedCount = await DoseLogService.markOverdueDosesAsMissed(thresholdMinutes);

    if (missedCount > 0) {
      console.log(`[NotificationService] Marked ${missedCount} doses as missed`);
    }

    return missedCount;
  },

  // Get current permission status from the system
  async getPermissionStatus(): Promise<NotificationPermissionStatus> {
    const notif = await getNotifications();
    if (!notif) {
      return 'denied';
    }

    const { status } = await notif.getPermissionsAsync();
    return status as NotificationPermissionStatus;
  },

  // Request permission and sync with settings
  async requestPermissionAndSync(): Promise<NotificationPermissionStatus> {
    const notif = await getNotifications();
    if (!notif) {
      return 'denied';
    }

    const { status } = await notif.requestPermissionsAsync();
    const permissionStatus = status as NotificationPermissionStatus;

    // Sync with settings
    await SettingsService.update({ notificationsPermission: permissionStatus });

    // Also update the master notifications enabled setting based on permission
    if (permissionStatus === 'granted') {
      const settings = await SettingsService.get();
      if (settings.notificationsEnabled === false) {
        // User granted permission but had disabled notifications in settings
        // Keep their setting preference but update permission state
      }
    }

    return permissionStatus;
  },

  // Sync system permission status with settings
  async syncPermissionStatus(): Promise<void> {
    const systemStatus = await this.getPermissionStatus();
    await SettingsService.update({ notificationsPermission: systemStatus });
  },

  // Schedule refill reminder for a medication
  async scheduleRefillReminder(medication: Medication, daysRemaining: number): Promise<void> {
    const notif = await getNotifications();
    if (!notif) return;

    try {
      const settings = await SettingsService.get();

      // Skip if notifications are disabled
      if (!settings.notificationsEnabled) return;

      const refillId = `refill-${medication.id}`;

      // Cancel existing refill notification
      await notif.cancelScheduledNotificationAsync(refillId).catch(() => {});

      // Calculate when to send the reminder (at threshold day)
      const threshold = medication.lowSupplyThreshold || 7;
      const daysUntilReminder = daysRemaining - threshold;

      if (daysUntilReminder <= 0) {
        // Already at or below threshold, notify now
        await notif.scheduleNotificationAsync({
          identifier: refillId,
          content: {
            title: `📦 Refill Needed: ${medication.name}`,
            body: `Only ${daysRemaining} ${medication.supplyUnit || 'doses'} remaining. Order a refill soon!`,
            data: {
              medicationId: medication.id,
              medicationName: medication.name,
              type: 'refill-reminder',
            },
            categoryIdentifier: 'refill',
            sound: 'default',
          },
          trigger: {
            type: notif.SchedulableTriggerInputTypes.DATE,
            date: new Date(),
          },
        });
      } else {
        // Schedule for when supply reaches threshold
        const reminderDate = addDays(new Date(), daysUntilReminder);

        await notif.scheduleNotificationAsync({
          identifier: refillId,
          content: {
            title: `📦 Refill Needed: ${medication.name}`,
            body: `Only ${threshold} ${medication.supplyUnit || 'doses'} remaining. Order a refill soon!`,
            data: {
              medicationId: medication.id,
              medicationName: medication.name,
              type: 'refill-reminder',
            },
            categoryIdentifier: 'refill',
            sound: 'default',
          },
          trigger: {
            type: notif.SchedulableTriggerInputTypes.DATE,
            date: reminderDate,
          },
        });
      }
    } catch (error) {
      console.error('[NotificationService] Failed to schedule refill reminder:', error);
    }
  },

  // Cancel refill reminder for a medication
  async cancelRefillReminder(medicationId: string): Promise<void> {
    const notif = await getNotifications();
    if (!notif) return;

    const refillId = `refill-${medicationId}`;
    await notif.cancelScheduledNotificationAsync(refillId).catch(() => {});
  },

  // Schedule refill reminders for all medications
  async scheduleRefillReminders(medications: Medication[]): Promise<void> {
    const { MedicationService } = await import('./medication.service');

    for (const med of medications) {
      if (!med.isActive) continue;
      if (med.scheduleType === 'as-needed') continue;
      if (med.currentSupply === null || med.currentSupply <= 0) continue;

      const daysRemaining = MedicationService.calculateDaysRemaining(med);
      if (daysRemaining !== null && daysRemaining <= (med.lowSupplyThreshold || 7)) {
        await this.scheduleRefillReminder(med, daysRemaining);
      }
    }
  },

  // Setup refill notification category
  async setupRefillCategory(): Promise<void> {
    const notif = await getNotifications();
    if (!notif) return;

    await notif.setNotificationCategoryAsync('refill', [
      {
        identifier: 'MARK_REFILLED',
        buttonTitle: 'Mark Refilled',
        options: {
          opensAppToForeground: true,
        },
      },
      {
        identifier: 'DISMISS',
        buttonTitle: 'Dismiss',
        options: {
          opensAppToForeground: false,
        },
      },
    ]);
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
  isNotificationScheduled,
  cancelDoseNotification,
  scheduleMissedDoseFollowUp,
  cancelMissedDoseFollowUp,
  isMissedDoseFollowUpScheduled,
  checkAndUpdateMissedDoses,
  getPermissionStatus,
  requestPermissionAndSync,
  syncPermissionStatus,
  scheduleRefillReminder,
  cancelRefillReminder,
  scheduleRefillReminders,
  setupRefillCategory,
} = NotificationService;
