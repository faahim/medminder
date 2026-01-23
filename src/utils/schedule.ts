import { Medication, ScheduledDose, TimeOfDay, DoseStatus } from '../types';
import {
  format,
  parseISO,
  getDay,
  addDays,
  isBefore,
  isAfter,
  isSameDay,
} from 'date-fns';

// Get time of day category for a time string
export function getTimeOfDay(time: string): TimeOfDay {
  const hour = parseInt(time.split(':')[0], 10);

  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

// Check if a medication's dependency has been completed
export function isDependencyCompleted(
  med: Medication,
  allMedications: Medication[],
  date: Date
): boolean {
  // If no dependency, it's always "completed"
  if (!med.dependsOnMedicationId) return true;

  // Find the dependency medication
  const dependency = allMedications.find(m => m.id === med.dependsOnMedicationId);
  if (!dependency) return true; // Dependency not found, assume completed

  // If dependency has no end date, it's never completed
  if (!dependency.endDate) return false;

  // Calculate when this medication can start (dependency end date + offset days)
  const offsetDays = med.dependsOnOffsetDays || 0;
  const canStartDate = addDays(parseISO(dependency.endDate), offsetDays);

  // Check if the date is on or after the can-start date
  return !isBefore(date, canStartDate);
}

// Get the status of a medication's dependency
export function getDependencyStatus(
  med: Medication,
  allMedications: Medication[],
  currentDate: Date = new Date()
): { isWaiting: boolean; dependencyName?: string; startDate?: Date; daysUntilStart?: number } {
  if (!med.dependsOnMedicationId) {
    return { isWaiting: false };
  }

  const dependency = allMedications.find(m => m.id === med.dependsOnMedicationId);
  if (!dependency) {
    return { isWaiting: false };
  }

  if (!dependency.endDate) {
    return {
      isWaiting: true,
      dependencyName: dependency.name,
    };
  }

  const offsetDays = med.dependsOnOffsetDays || 0;
  const startDate = addDays(parseISO(dependency.endDate), offsetDays);

  if (isBefore(currentDate, startDate)) {
    const daysUntilStart = Math.ceil(
      (startDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    return {
      isWaiting: true,
      dependencyName: dependency.name,
      startDate,
      daysUntilStart,
    };
  }

  return { isWaiting: false };
}

// Check if a medication is active on a given date
export function isMedicationActiveOnDate(
  med: Medication,
  date: Date,
  allMedications: Medication[] = []
): boolean {
  const dateStr = format(date, 'yyyy-MM-dd');

  // As-needed medications don't have scheduled doses
  if (med.scheduleType === 'as-needed') return false;

  // Check start date
  if (med.startDate > dateStr) return false;

  // Check end date
  if (med.endDate && med.endDate < dateStr) return false;

  // Check if active
  if (!med.isActive) return false;

  // Check if dependency has completed
  if (!isDependencyCompleted(med, allMedications, date)) return false;

  return true;
}

// Check if medication should be scheduled on this day (for weekly schedules)
export function isMedicationScheduledOnDay(
  med: Medication,
  date: Date,
  allMedications: Medication[] = []
): boolean {
  if (!isMedicationActiveOnDate(med, date, allMedications)) return false;

  if (med.scheduleType === 'weekly' && med.scheduleWeekdays) {
    const weekdays = JSON.parse(med.scheduleWeekdays) as number[];
    const dayOfWeek = getDay(date); // 0 = Sunday, 1 = Monday, etc.
    return weekdays.includes(dayOfWeek);
  }

  // For daily and interval schedules, always true if active
  return true;
}

// Get all scheduled doses for a medication on a given date
export function getScheduledTimesForDate(
  med: Medication,
  date: Date,
  allMedications: Medication[] = []
): string[] {
  if (!isMedicationScheduledOnDay(med, date, allMedications)) return [];

  const times = JSON.parse(med.scheduleTimes) as string[];

  // For interval-based schedules, calculate times differently
  if (med.scheduleType === 'interval' && med.scheduleIntervalHours) {
    // Start from first time and add intervals
    const intervalTimes: string[] = [];
    const startHour = parseInt(times[0]?.split(':')[0] || '8', 10);
    const startMin = parseInt(times[0]?.split(':')[1] || '0', 10);

    let hour = startHour;
    while (hour < 24) {
      intervalTimes.push(`${hour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')}`);
      hour += med.scheduleIntervalHours;
    }
    return intervalTimes;
  }

  return times;
}

// Build scheduled doses for today with status
export function buildTodaySchedule(
  medications: Medication[],
  existingLogs: Map<string, DoseStatus>, // key: `${medId}-${time}`
  currentTime: Date
): ScheduledDose[] {
  const today = format(currentTime, 'yyyy-MM-dd');
  const doses: ScheduledDose[] = [];

  for (const med of medications) {
    // Skip as-needed medications - they don't have scheduled doses
    if (med.scheduleType === 'as-needed') continue;

    const times = getScheduledTimesForDate(med, currentTime, medications);

    for (const time of times) {
      const key = `${med.id}-${time}`;
      const existingStatus = existingLogs.get(key);

      let status: DoseStatus;
      if (existingStatus) {
        status = existingStatus;
      } else {
        // If there's no existing log, it's pending
        status = 'pending';
      }

      doses.push({
        medication: med,
        scheduledDate: today,
        scheduledTime: time,
        timeOfDay: getTimeOfDay(time),
        status,
        doseLogId: null, // Will be populated if log exists
      });
    }
  }

  // Sort by time
  doses.sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));

  return doses;
}

// Group doses by time of day
export function groupDosesByTimeOfDay(doses: ScheduledDose[]): Record<TimeOfDay, ScheduledDose[]> {
  return {
    morning: doses.filter(d => d.timeOfDay === 'morning'),
    afternoon: doses.filter(d => d.timeOfDay === 'afternoon'),
    evening: doses.filter(d => d.timeOfDay === 'evening'),
    night: doses.filter(d => d.timeOfDay === 'night'),
  };
}
