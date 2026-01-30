import { useState, useEffect, useCallback, useMemo } from 'react';
import { format } from 'date-fns';
import { MedicationService } from '../services/medication.service';
import { DoseLogService } from '../services/doseLog.service';
import { NotificationService } from '../services/notification.service';
import { buildTodaySchedule, groupDosesByTimeOfDay } from '../utils/schedule';
import { ScheduledDose, DoseStatus, TimeOfDay, Medication } from '../types';
import { useDatabase } from '../contexts/DatabaseContext';

interface UseTodaysDosesReturn {
  doses: ScheduledDose[];
  groupedDoses: Record<TimeOfDay, ScheduledDose[]>;
  asNeededMeds: Medication[];
  notificationStatus: Map<string, boolean>; // Key: ${medId}-${time}, Value: hasNotification
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  logDose: (medicationId: string, time: string, status: DoseStatus) => Promise<void>;
  logAsNeededDose: (medicationId: string) => Promise<void>;
  snoozeDose: (medicationId: string, time: string, minutes: number) => Promise<void>;
}

export function useTodaysDoses(): UseTodaysDosesReturn {
  const { isReady } = useDatabase();
  const [doses, setDoses] = useState<ScheduledDose[]>([]);
  const [asNeededMeds, setAsNeededMeds] = useState<Medication[]>([]);
  const [notificationStatus, setNotificationStatus] = useState<Map<string, boolean>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadTodaysDoses = useCallback(async () => {
    if (!isReady) return;

    setIsLoading(true);
    setError(null);

    try {
      const today = format(new Date(), 'yyyy-MM-dd');

      // Get all active medications
      const allMedications = await MedicationService.getAll();

      // Separate scheduled vs as-needed medications
      const scheduledMedications = allMedications.filter(med => med.scheduleType !== 'as-needed');
      const asNeededMedications = allMedications.filter(med => med.scheduleType === 'as-needed');

      // Get existing logs for today
      const logs = await DoseLogService.getDosesForDate(today);

      // Build log map for quick lookup
      const logMap = new Map<string, DoseStatus>();
      for (const log of logs) {
        const key = `${log.medicationId}-${log.scheduledTime}`;
        logMap.set(key, log.status);
      }

      // Build today's schedule (only for scheduled medications)
      const scheduled = buildTodaySchedule(scheduledMedications, logMap, new Date());

      // Check notification status for each pending dose
      const notifStatusMap = new Map<string, boolean>();
      for (const dose of scheduled) {
        if (dose.status === 'pending') {
          const key = `${dose.medication.id}-${dose.scheduledTime}`;
          const hasNotification = await NotificationService.isNotificationScheduled(dose.medication.id, dose.scheduledTime);
          notifStatusMap.set(key, hasNotification);
        }
      }

      setDoses(scheduled);
      setAsNeededMeds(asNeededMedications);
      setNotificationStatus(notifStatusMap);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load doses'));
    } finally {
      setIsLoading(false);
    }
  }, [isReady]);

  useEffect(() => {
    loadTodaysDoses();
  }, [loadTodaysDoses]);

  const logDose = useCallback(async (
    medicationId: string,
    time: string,
    status: DoseStatus
  ) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    await DoseLogService.logDose(medicationId, today, time, status);

    // Cancel the notification for this dose
    await NotificationService.cancelDoseNotification(medicationId, time);

    // Update local state optimistically
    setDoses(prev => prev.map(dose => {
      if (dose.medication.id === medicationId && dose.scheduledTime === time) {
        return { ...dose, status };
      }
      return dose;
    }));

    // Update notification status map
    setNotificationStatus(prev => {
      const updated = new Map(prev);
      updated.delete(`${medicationId}-${time}`);
      return updated;
    });

    // Update badge count
    await NotificationService.updatePendingBadgeCount();
  }, []);

  const snoozeDose = useCallback(async (
    medicationId: string,
    time: string,
    minutes: number
  ) => {
    // Find the medication
    const medication = await MedicationService.getById(medicationId);
    if (!medication) return;

    // Schedule snooze notification
    await NotificationService.scheduleSnooze(medication, time, minutes);

    // Cancel the original notification
    await NotificationService.cancelDoseNotification(medicationId, time);

    // Update notification status map
    setNotificationStatus(prev => {
      const updated = new Map(prev);
      updated.set(`${medicationId}-${time}`, false); // Original notification is cancelled
      return updated;
    });

    // Update badge count
    await NotificationService.updatePendingBadgeCount();
  }, []);

  const logAsNeededDose = useCallback(async (medicationId: string) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const now = format(new Date(), 'HH:mm');

    // For as-needed meds, use current time as the scheduled time
    await DoseLogService.logDose(medicationId, today, now, 'taken');
  }, []);

  const groupedDoses = useMemo(() => groupDosesByTimeOfDay(doses), [doses]);

  return {
    doses,
    groupedDoses,
    asNeededMeds,
    notificationStatus,
    isLoading,
    error,
    refresh: loadTodaysDoses,
    logDose,
    logAsNeededDose,
    snoozeDose,
  };
}
