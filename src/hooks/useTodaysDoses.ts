import { useState, useEffect, useCallback, useMemo } from 'react';
import { format, parseISO, addMinutes, isAfter } from 'date-fns';
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
  lowSupplyMeds: Medication[]; // Medications that need refill
  notificationStatus: Map<string, boolean>; // Key: ${medId}-${time}, Value: hasNotification
  missedFollowUpStatus: Map<string, boolean>; // Key: ${medId}-${time}, Value: hasMissedFollowUp
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  logDose: (medicationId: string, time: string, status: DoseStatus) => Promise<void>;
  logAsNeededDose: (medicationId: string) => Promise<void>;
  snoozeDose: (medicationId: string, time: string, minutes: number) => Promise<void>;
  markRefilled: (medicationId: string, newSupply: number) => Promise<void>;
}

export function useTodaysDoses(): UseTodaysDosesReturn {
  const { isReady } = useDatabase();
  const [doses, setDoses] = useState<ScheduledDose[]>([]);
  const [asNeededMeds, setAsNeededMeds] = useState<Medication[]>([]);
  const [lowSupplyMeds, setLowSupplyMeds] = useState<Medication[]>([]);
  const [notificationStatus, setNotificationStatus] = useState<Map<string, boolean>>(new Map());
  const [missedFollowUpStatus, setMissedFollowUpStatus] = useState<Map<string, boolean>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadTodaysDoses = useCallback(async () => {
    if (!isReady) return;

    setIsLoading(true);
    setError(null);

    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const now = new Date();

      // Get all active medications
      const allMedications = await MedicationService.getAll();

      // Separate scheduled vs as-needed medications
      const scheduledMedications = allMedications.filter(med => med.scheduleType !== 'as-needed');
      const asNeededMedications = allMedications.filter(med => med.scheduleType === 'as-needed');

      // Get medications that need refill
      const lowSupplyMeds = await MedicationService.getLowSupplyMedications();

      // Get existing logs for today
      const logs = await DoseLogService.getDosesForDate(today);

      // Build log map for quick lookup
      const logMap = new Map<string, DoseStatus>();
      for (const log of logs) {
        const key = `${log.medicationId}-${log.scheduledTime}`;
        logMap.set(key, log.status);
      }

      // Build today's schedule (only for scheduled medications)
      const scheduled = buildTodaySchedule(scheduledMedications, logMap, now);

      // Check notification status for each pending dose
      const notifStatusMap = new Map<string, boolean>();
      const missedFollowUpMap = new Map<string, boolean>();
      const settings = await (async () => {
        try {
          const settingsModule = await import('../services/settings.service');
          return await settingsModule.SettingsService.get();
        } catch {
          return { gracePeriodMinutes: 30 };
        }
      })();

      for (const dose of scheduled) {
        const key = `${dose.medication.id}-${dose.scheduledTime}`;

        // Check for original notification
        if (dose.status === 'pending') {
          const hasNotification = await NotificationService.isNotificationScheduled(dose.medication.id, dose.scheduledTime);
          notifStatusMap.set(key, hasNotification);

          // Check if we need to schedule a follow-up notification for missed dose
          const scheduledDateTime = parseISO(`${dose.scheduledDate}T${dose.scheduledTime}`);
          const gracePeriodEnd = addMinutes(scheduledDateTime, settings.gracePeriodMinutes || 30);

          if (isAfter(now, scheduledDateTime)) {
            // We're past the scheduled time
            const hasMissedFollowUp = await NotificationService.isMissedDoseFollowUpScheduled(dose.medication.id, dose.scheduledTime);
            missedFollowUpMap.set(key, hasMissedFollowUp);

            // If no follow-up is scheduled yet and we're still within a reasonable window to remind, schedule it
            if (!hasMissedFollowUp && isAfter(gracePeriodEnd, now)) {
              await NotificationService.scheduleMissedDoseFollowUp(dose.medication, dose.scheduledTime);
              missedFollowUpMap.set(key, true);
            }
          }
        } else {
          // For non-pending doses, check if there's a follow-up to cancel
          const hasMissedFollowUp = await NotificationService.isMissedDoseFollowUpScheduled(dose.medication.id, dose.scheduledTime);
          if (hasMissedFollowUp) {
            await NotificationService.cancelMissedDoseFollowUp(dose.medication.id, dose.scheduledTime);
          }
          missedFollowUpMap.set(key, false);
        }
      }

      setDoses(scheduled);
      setAsNeededMeds(asNeededMedications);
      setLowSupplyMeds(lowSupplyMeds);
      setNotificationStatus(notifStatusMap);
      setMissedFollowUpStatus(missedFollowUpMap);
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

    // Cancel any missed dose follow-up notification
    await NotificationService.cancelMissedDoseFollowUp(medicationId, time);

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

    // Update missed follow-up status map
    setMissedFollowUpStatus(prev => {
      const updated = new Map(prev);
      updated.set(`${medicationId}-${time}`, false);
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

  const markRefilled = useCallback(async (medicationId: string, newSupply: number) => {
    await MedicationService.markAsRefilled(medicationId, newSupply);

    // Update lowSupplyMeds list optimistically
    setLowSupplyMeds(prev => prev.filter(med => med.id !== medicationId));
  }, []);

  const groupedDoses = useMemo(() => groupDosesByTimeOfDay(doses), [doses]);

  return {
    doses,
    groupedDoses,
    asNeededMeds,
    lowSupplyMeds,
    notificationStatus,
    missedFollowUpStatus,
    isLoading,
    error,
    refresh: loadTodaysDoses,
    logDose,
    logAsNeededDose,
    snoozeDose,
    markRefilled,
  };
}
