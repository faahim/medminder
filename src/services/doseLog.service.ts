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
