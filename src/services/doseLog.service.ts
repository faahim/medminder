import { eq, and, gte, lte, desc, sql } from 'drizzle-orm';
import { db } from '../db/client';
import { doseLogs } from '../db/schema';
import { DoseLog, DoseStatus, DayAggregate, Medication } from '../types';
import { generateUUID } from '../utils/uuid';
import { format, parseISO, isAfter, addMinutes } from 'date-fns';

export const DoseLogService = {
  // Get or create dose log for a specific scheduled dose (atomic operation)
  // Uses INSERT OR IGNORE + SELECT pattern to prevent race conditions
  async getOrCreate(
    medicationId: string, 
    scheduledDate: string, 
    scheduledTime: string
  ): Promise<DoseLog> {
    const now = new Date().toISOString();
    const id = generateUUID();

    // Atomic: Try to insert, ignore if exists due to UNIQUE constraint
    await db.run(sql`
      INSERT OR IGNORE INTO dose_logs (id, medication_id, scheduled_date, scheduled_time, status, logged_at, notes, created_at)
      VALUES (${id}, ${medicationId}, ${scheduledDate}, ${scheduledTime}, 'pending', NULL, NULL, ${now})
    `);

    // Now fetch the record (either newly created or existing)
    const result = await db
      .select()
      .from(doseLogs)
      .where(
        and(
          eq(doseLogs.medicationId, medicationId),
          eq(doseLogs.scheduledDate, scheduledDate),
          eq(doseLogs.scheduledTime, scheduledTime)
        )
      )
      .limit(1);

    if (result.length === 0) {
      throw new Error('Failed to get or create dose log');
    }

    return mapToDoseLog(result[0]);
  },

  // Log a dose action (take, skip, etc.)
  async logDose(
    medicationId: string,
    scheduledDate: string,
    scheduledTime: string,
    status: DoseStatus,
    notes?: string
  ): Promise<DoseLog> {
    const log = await this.getOrCreate(medicationId, scheduledDate, scheduledTime);
    const now = new Date().toISOString();

    await db
      .update(doseLogs)
      .set({
        status,
        loggedAt: now,
        notes: notes || null,
      })
      .where(eq(doseLogs.id, log.id));

    return {
      ...log,
      status,
      loggedAt: now,
      notes: notes || null,
    };
  },

  // Get all doses for a specific date
  async getDosesForDate(date: string): Promise<DoseLog[]> {
    const result = await db
      .select()
      .from(doseLogs)
      .where(eq(doseLogs.scheduledDate, date))
      .orderBy(doseLogs.scheduledTime);

    return result.map(mapToDoseLog);
  },

  // Get dose logs for a medication
  async getLogsForMedication(medicationId: string, limit = 30): Promise<DoseLog[]> {
    const result = await db
      .select()
      .from(doseLogs)
      .where(eq(doseLogs.medicationId, medicationId))
      .orderBy(desc(doseLogs.scheduledDate), desc(doseLogs.scheduledTime))
      .limit(limit);

    return result.map(mapToDoseLog);
  },

  // Get day aggregate statistics
  async getDayAggregate(date: string): Promise<DayAggregate> {
    const logs = await this.getDosesForDate(date);

    const taken = logs.filter(l => l.status === 'taken').length;
    const missed = logs.filter(l => l.status === 'missed').length;
    const skipped = logs.filter(l => l.status === 'skipped').length;
    const pending = logs.filter(l => l.status === 'pending').length;

    const relevantCount = taken + missed;
    const adherence = relevantCount > 0 ? Math.round((taken / relevantCount) * 100) : 100;

    return {
      date,
      totalDoses: logs.length,
      takenCount: taken,
      missedCount: missed,
      skippedCount: skipped,
      pendingCount: pending,
      adherencePercent: adherence,
    };
  },

  // Get aggregates for a date range (for calendar view)
  async getAggregatesForRange(startDate: string, endDate: string): Promise<DayAggregate[]> {
    const result = await db
      .select()
      .from(doseLogs)
      .where(
        and(
          gte(doseLogs.scheduledDate, startDate),
          lte(doseLogs.scheduledDate, endDate)
        )
      );

    // Group by date
    const byDate = new Map<string, DoseLog[]>();
    for (const row of result) {
      const log = mapToDoseLog(row);
      const existing = byDate.get(log.scheduledDate) || [];
      existing.push(log);
      byDate.set(log.scheduledDate, existing);
    }

    // Calculate aggregates
    const aggregates: DayAggregate[] = [];
    for (const [date, logs] of byDate) {
      const taken = logs.filter(l => l.status === 'taken').length;
      const missed = logs.filter(l => l.status === 'missed').length;
      const skipped = logs.filter(l => l.status === 'skipped').length;
      const pending = logs.filter(l => l.status === 'pending').length;

      const relevantCount = taken + missed;
      const adherence = relevantCount > 0 ? Math.round((taken / relevantCount) * 100) : 100;

      aggregates.push({
        date,
        totalDoses: logs.length,
        takenCount: taken,
        missedCount: missed,
        skippedCount: skipped,
        pendingCount: pending,
        adherencePercent: adherence,
      });
    }

    return aggregates;
  },

  // Mark overdue pending doses as missed
  async markOverdueDosesAsMissed(thresholdMinutes: number): Promise<number> {
    const now = new Date();
    const today = format(now, 'yyyy-MM-dd');

    // Get all pending doses for today
    const pending = await db
      .select()
      .from(doseLogs)
      .where(
        and(
          eq(doseLogs.scheduledDate, today),
          eq(doseLogs.status, 'pending')
        )
      );

    let count = 0;
    for (const log of pending) {
      const scheduledDateTime = parseISO(`${log.scheduledDate}T${log.scheduledTime}`);
      const threshold = addMinutes(scheduledDateTime, thresholdMinutes);

      if (isAfter(now, threshold)) {
        await db
          .update(doseLogs)
          .set({ status: 'missed', loggedAt: now.toISOString() })
          .where(eq(doseLogs.id, log.id));
        count++;
      }
    }

    return count;
  },

  // Calculate current streak (consecutive days with >= 80% adherence)
  async getCurrentStreak(asOfDate?: Date): Promise<number> {
    const referenceDate = asOfDate || new Date();
    let currentDate = new Date(referenceDate);
    currentDate.setHours(0, 0, 0, 0);

    let streak = 0;

    // Check backwards from reference date
    while (true) {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      const aggregate = await this.getDayAggregate(dateStr);

      // Day has no doses - doesn't break streak, doesn't count
      if (aggregate.totalDoses === 0) {
        currentDate.setDate(currentDate.getDate() - 1);
        // Skip backwards until we find a day with doses or reach a limit
        const emptyDaysChecked = 30; // Safety limit
        let emptyCount = 0;
        while (emptyCount < emptyDaysChecked && aggregate.totalDoses === 0) {
          currentDate.setDate(currentDate.getDate() - 1);
          const prevDateStr = format(currentDate, 'yyyy-MM-dd');
          const prevAggregate = await this.getDayAggregate(prevDateStr);
          if (prevAggregate.totalDoses > 0) {
            if (prevAggregate.adherencePercent >= 80) {
              streak++;
              currentDate.setDate(currentDate.getDate() - 1);
            } else {
              return streak;
            }
          }
          emptyCount++;
        }
        return streak;
      }

      // Day has doses but adherence < 80% - break streak
      if (aggregate.adherencePercent < 80) {
        return streak;
      }

      // Day has doses with >= 80% adherence - continue streak
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);

      // Safety limit: don't go back more than a year
      const daysDiff = Math.floor((referenceDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff > 365) {
        break;
      }
    }

    return streak;
  },

  // Calculate best streak (longest consecutive days with >= 80% adherence)
  async getBestStreak(startDate?: Date, endDate?: Date): Promise<number> {
    const start = startDate ? new Date(startDate) : new Date();
    start.setDate(start.getDate() - 365); // Default to last year
    const end = endDate ? new Date(endDate) : new Date();

    const aggregates = await this.getAggregatesForRange(
      format(start, 'yyyy-MM-dd'),
      format(end, 'yyyy-MM-dd')
    );

    // Group by date and filter days with doses and >= 80% adherence
    const goodDays = aggregates
      .filter(a => a.totalDoses > 0 && a.adherencePercent >= 80)
      .map(a => a.date)
      .sort();

    if (goodDays.length === 0) return 0;

    let bestStreak = 1;
    let currentStreak = 1;

    for (let i = 1; i < goodDays.length; i++) {
      const prevDate = parseISO(goodDays[i - 1]);
      const currDate = parseISO(goodDays[i]);
      const diffDays = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Consecutive day
        currentStreak++;
      } else {
        // Streak broken
        bestStreak = Math.max(bestStreak, currentStreak);
        currentStreak = 1;
      }
    }

    return Math.max(bestStreak, currentStreak);
  },
};

function mapToDoseLog(row: any): DoseLog {
  return {
    id: row.id,
    medicationId: row.medicationId || row.medication_id,
    scheduledDate: row.scheduledDate || row.scheduled_date,
    scheduledTime: row.scheduledTime || row.scheduled_time,
    status: row.status as DoseStatus,
    loggedAt: row.loggedAt || row.logged_at,
    notes: row.notes,
    createdAt: row.createdAt || row.created_at,
  };
}
