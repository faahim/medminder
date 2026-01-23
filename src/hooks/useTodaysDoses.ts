import { useState, useEffect, useCallback, useMemo } from 'react';
import { format } from 'date-fns';
import { MedicationService } from '../services/medication.service';
import { DoseLogService } from '../services/doseLog.service';
import { NotificationService } from '../services/notification.service';
import { buildTodaySchedule, groupDosesByTimeOfDay } from '../utils/schedule';
import { ScheduledDose, DoseStatus, TimeOfDay } from '../types';
import { useDatabase } from '../contexts/DatabaseContext';

interface UseTodaysDosesReturn {
  doses: ScheduledDose[];
  groupedDoses: Record<TimeOfDay, ScheduledDose[]>;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  logDose: (medicationId: string, time: string, status: DoseStatus) => Promise<void>;
}

export function useTodaysDoses(): UseTodaysDosesReturn {
  const { isReady } = useDatabase();
  const [doses, setDoses] = useState<ScheduledDose[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadTodaysDoses = useCallback(async () => {
    if (!isReady) return;

    setIsLoading(true);
    setError(null);

    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      
      // Get all active medications
      const medications = await MedicationService.getAll();
      
      // Get existing logs for today
      const logs = await DoseLogService.getDosesForDate(today);
      
      // Build log map for quick lookup
      const logMap = new Map<string, DoseStatus>();
      for (const log of logs) {
        const key = `${log.medicationId}-${log.scheduledTime}`;
        logMap.set(key, log.status);
      }
      
      // Build today's schedule
      const scheduled = buildTodaySchedule(medications, logMap, new Date());
      
      setDoses(scheduled);
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
    
    // Update local state optimistically
    setDoses(prev => prev.map(dose => {
      if (dose.medication.id === medicationId && dose.scheduledTime === time) {
        return { ...dose, status };
      }
      return dose;
    }));
    
    // Update badge count
    await NotificationService.updatePendingBadgeCount();
  }, [doses]);

  const groupedDoses = useMemo(() => groupDosesByTimeOfDay(doses), [doses]);

  return {
    doses,
    groupedDoses,
    isLoading,
    error,
    refresh: loadTodaysDoses,
    logDose,
  };
}
