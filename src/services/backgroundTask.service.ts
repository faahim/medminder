import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';
import { MedicationService } from './medication.service';
import { NotificationService } from './notification.service';

// Check if running in Expo Go (background tasks not supported)
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

// Task name for background notification rescheduling
export const BACKGROUND_NOTIFICATION_TASK = 'BACKGROUND_NOTIFICATION_TASK';

// Minimum interval for background tasks on iOS (15 minutes)
// Android allows more flexibility
const MIN_BACKGROUND_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes in milliseconds

/**
 * Background task handler that runs periodically to ensure notifications remain scheduled.
 *
 * This task:
 * 1. Retrieves all active medications
 * 2. Checks if notifications are scheduled for each dose time
 * 3. Re-schedules any missing notifications
 * 4. Cleans up expired notifications
 *
 * The task is designed to be lightweight to minimize battery impact.
 */
const backgroundNotificationTask = async () => {
  const now = Date.now();
  console.log(`[BackgroundTask] Running at ${new Date(now).toISOString()}`);

  try {
    // Get all medications
    const medications = await MedicationService.getAll();

    // Filter to only active, schedulable medications
    const activeMedications = medications.filter(med =>
      NotificationService.isMedicationSchedulable(med)
    );

    if (activeMedications.length === 0) {
      console.log('[BackgroundTask] No active medications to check');
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    let rescheduledCount = 0;
    let cancelledCount = 0;

    // Check and reschedule each medication's notifications
    for (const medication of activeMedications) {
      const times = JSON.parse(medication.scheduleTimes) as string[];

      for (const time of times) {
        const isScheduled = await NotificationService.isNotificationScheduled(
          medication.id,
          time
        );

        if (!isScheduled) {
          console.log(
            `[BackgroundTask] Rescheduling notification for ${medication.name} at ${time}`
          );
          await NotificationService.scheduleMedicationNotifications(medication);
          rescheduledCount++;
        }
      }
    }

    // Clean up any expired medications' notifications
    const expiredMedications = medications.filter(
      med => !NotificationService.isMedicationSchedulable(med)
    );

    for (const expiredMed of expiredMedications) {
      await NotificationService.cancelMedicationNotifications(expiredMed.id);
      cancelledCount++;
    }

    console.log(
      `[BackgroundTask] Task completed: ${rescheduledCount} rescheduled, ${cancelledCount} cancelled`
    );

    const elapsed = Date.now() - now;
    console.log(`[BackgroundTask] Execution time: ${elapsed}ms`);

    // Return success
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('[BackgroundTask] Error during execution:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
};

/**
 * Background Task Service
 *
 * Manages background task registration for notification rescheduling.
 * On iOS, background execution is limited, so periodic checks may not always run reliably.
 * This service uses Expo BackgroundFetch which schedules periodic checks when the OS allows.
 */
export const BackgroundTaskService = {
  /**
   * Check if background tasks are available
   * Not available in Expo Go
   */
  isAvailable(): boolean {
    return !isExpoGo;
  },

  /**
   * Register the background notification task with Expo TaskManager
   *
   * This defines the task that will run periodically.
   * Must be called before the app starts (typically in _layout.tsx or at app startup).
   */
  async registerTask(): Promise<void> {
    if (isExpoGo) {
      console.log('[BackgroundTask] Skipped - not available in Expo Go');
      return;
    }

    const isRegistered = await TaskManager.isTaskRegisteredAsync(
      BACKGROUND_NOTIFICATION_TASK
    );

    if (isRegistered) {
      console.log('[BackgroundTask] Task already registered');
      return;
    }

    // Register the task definition
    TaskManager.defineTask(
      BACKGROUND_NOTIFICATION_TASK,
      backgroundNotificationTask
    );

    console.log('[BackgroundTask] Task registered successfully');
  },

  /**
   * Start the background periodic check
   *
   * Configures the minimum interval for background execution.
   * On iOS, the OS may delay execution beyond the requested minimum.
   */
  async startPeriodicCheck(): Promise<boolean> {
    if (isExpoGo) {
      console.log('[BackgroundTask] Skipped - not available in Expo Go');
      return false;
    }

    try {
      const status = await BackgroundFetch.getStatusAsync();
      const isAvailable = status === BackgroundFetch.BackgroundFetchStatus.Available;

      if (!isAvailable) {
        console.log(
          `[BackgroundTask] Background fetch not available. Status: ${status}`
        );
        return false;
      }

      // Set minimum interval for background checks
      // iOS enforces a minimum of 15 minutes
      await BackgroundFetch.setMinimumIntervalAsync(MIN_BACKGROUND_INTERVAL_MS);

      // Register the task for periodic execution
      await BackgroundFetch.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK, {
        minimumInterval: MIN_BACKGROUND_INTERVAL_MS,
        stopOnTerminate: false, // Continue running even if app is terminated
        startOnBoot: true, // Start after device reboot
      });

      console.log(
        `[BackgroundTask] Periodic check started (interval: ${MIN_BACKGROUND_INTERVAL_MS / 60000} min)`
      );

      return true;
    } catch (error) {
      console.error('[BackgroundTask] Failed to start periodic check:', error);
      return false;
    }
  },

  /**
   * Unregister the background task
   *
   * Call this to stop background checks.
   */
  async unregisterTask(): Promise<void> {
    if (isExpoGo) {
      return;
    }

    try {
      await BackgroundFetch.unregisterTaskAsync(BACKGROUND_NOTIFICATION_TASK);
      console.log('[BackgroundTask] Task unregistered');
    } catch (error) {
      console.error('[BackgroundTask] Failed to unregister task:', error);
    }
  },

  /**
   * Get the status of background fetch on the device
   */
  async getStatus(): Promise<BackgroundFetch.BackgroundFetchStatus> {
    if (isExpoGo) {
      return BackgroundFetch.BackgroundFetchStatus.Restricted;
    }

    return BackgroundFetch.getStatusAsync();
  },

  /**
   * Force an immediate background task execution for testing
   *
   * Only works in development and may be limited by the OS.
   */
  async testTask(): Promise<void> {
    if (isExpoGo) {
      console.log('[BackgroundTask] Skipped - not available in Expo Go');
      return;
    }

    try {
      console.log('[BackgroundTask] Running test execution...');
      await backgroundNotificationTask();
      console.log('[BackgroundTask] Test execution completed');
    } catch (error) {
      console.error('[BackgroundTask] Test execution failed:', error);
    }
  },
};

// Export individual functions for convenience
export const {
  isAvailable,
  registerTask,
  startPeriodicCheck,
  unregisterTask,
  getStatus,
  testTask,
} = BackgroundTaskService;
