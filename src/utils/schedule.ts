import { Medication, ScheduledDose, TimeOfDay, DoseStatus } from '../types';
import { 
  format, 
  parseISO, 
  getDay, 
  addDays,
  isBefore,
  isAfter,
} from 'date-fns';

// Get time of day category for a time string
export function getTimeOfDay(time: string): TimeOfDay {
  const hour = parseInt(time.split(':')[0], 10);
  
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

// Check if a medication is active on a given date
export function isMedicationActiveOnDate(med: Medication, date: Date): boolean {
  const dateStr = format(date, 'yyyy-MM-dd');
  
  // Check start date
  if (med.startDate > dateStr) return false;
  
  // Check end date
  if (med.endDate && med.endDate < dateStr) return false;
  
  // Check if active
  if (!med.isActive) return false;
  
  return true;
}

// Check if medication should be scheduled on this day (for weekly schedules)
export function isMedicationScheduledOnDay(med: Medication, date: Date): boolean {
  if (!isMedicationActiveOnDate(med, date)) return false;
  
  if (med.scheduleType === 'weekly' && med.scheduleWeekdays) {
    const weekdays = JSON.parse(med.scheduleWeekdays) as number[];
    const dayOfWeek = getDay(date); // 0 = Sunday, 1 = Monday, etc.
    return weekdays.includes(dayOfWeek);
  }
  
  // For daily and interval schedules, always true if active
  return true;
}

// Get all scheduled doses for a medication on a given date
export function getScheduledTimesForDate(med: Medication, date: Date): string[] {
  if (!isMedicationScheduledOnDay(med, date)) return [];
  
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
  const currentTimeStr = format(currentTime, 'HH:mm');
  const doses: ScheduledDose[] = [];

  for (const med of medications) {
    const times = getScheduledTimesForDate(med, currentTime);
    
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
