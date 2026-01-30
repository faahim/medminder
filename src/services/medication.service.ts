import { eq, desc } from 'drizzle-orm';
import { db } from '../db/client';
import { medications } from '../db/schema';
import { Medication, MedicationFormData, MedicationNotificationSettings } from '../types';
import { generateUUID } from '../utils/uuid';
import { NotificationService } from './notification.service';
import { format, parseISO, differenceInDays, addDays } from 'date-fns';

export const MedicationService = {
  // Get all active medications
  async getAll(): Promise<Medication[]> {
    const result = await db
      .select()
      .from(medications)
      .where(eq(medications.isActive, true))
      .orderBy(medications.name);
    
    return result.map(mapToMedication);
  },

  // Get all archived (inactive) medications
  async getArchived(): Promise<Medication[]> {
    const result = await db
      .select()
      .from(medications)
      .where(eq(medications.isActive, false))
      .orderBy(medications.name);
    
    return result.map(mapToMedication);
  },

  // Get single medication by ID
  async getById(id: string): Promise<Medication | null> {
    const result = await db
      .select()
      .from(medications)
      .where(eq(medications.id, id))
      .limit(1);
    
    return result.length > 0 ? mapToMedication(result[0]) : null;
  },

  // Get medications that depend on a given medication
  async getDependents(medicationId: string): Promise<Medication[]> {
    const result = await db
      .select()
      .from(medications)
      .where(eq(medications.dependsOnMedicationId, medicationId));
    
    return result.map(mapToMedication);
  },

  // Create new medication
  async create(data: MedicationFormData): Promise<Medication> {
    const now = new Date().toISOString();
    const id = generateUUID();

    const newMed = {
      id,
      name: data.name,
      dosage: data.dosage,
      dosageUnit: data.dosageUnit,
      instructions: data.instructions || null,
      mealTiming: data.mealTiming,
      scheduleType: data.scheduleType,
      scheduleTimes: JSON.stringify(data.scheduleTimes),
      scheduleWeekdays: data.scheduleWeekdays.length > 0
        ? JSON.stringify(data.scheduleWeekdays)
        : null,
      scheduleIntervalHours: data.scheduleIntervalHours || null,
      startDate: data.startDate.toISOString().split('T')[0],
      endDate: data.endDate ? data.endDate.toISOString().split('T')[0] : null,
      dependsOnMedicationId: data.dependsOnMedicationId,
      dependsOnOffsetDays: data.dependsOnOffsetDays || null,
      color: data.color,
      photoUri: null,
      // Notification settings
      notificationsEnabled: data.notificationsEnabled ?? true,
      notificationSound: data.notificationSound ?? 'default',
      vibrationEnabled: data.vibrationEnabled ?? true,
      reminderAdvanceMinutes: data.reminderAdvanceMinutes ?? 0,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      // Refill settings
      currentSupply: data.currentSupply ?? null,
      supplyUnit: data.supplyUnit ?? null,
      lowSupplyThreshold: data.lowSupplyThreshold ?? null,
      lastRefillDate: data.lastRefillDate ? data.lastRefillDate.toISOString() : null,
    };

    await db.insert(medications).values(newMed);

    // Schedule notifications for this medication
    const medication = await this.getById(id);
    if (medication) {
      await NotificationService.scheduleMedicationNotifications(medication);
    }

    return medication!;
  },

  // Update medication
  async update(id: string, data: Partial<MedicationFormData>): Promise<Medication | null> {
    const now = new Date().toISOString();

    const updateData: Record<string, any> = { updatedAt: now };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.dosage !== undefined) updateData.dosage = data.dosage;
    if (data.dosageUnit !== undefined) updateData.dosageUnit = data.dosageUnit;
    if (data.instructions !== undefined) updateData.instructions = data.instructions;
    if (data.mealTiming !== undefined) updateData.mealTiming = data.mealTiming;
    if (data.scheduleType !== undefined) updateData.scheduleType = data.scheduleType;
    if (data.scheduleTimes !== undefined) updateData.scheduleTimes = JSON.stringify(data.scheduleTimes);
    if (data.scheduleWeekdays !== undefined) {
      updateData.scheduleWeekdays = data.scheduleWeekdays.length > 0
        ? JSON.stringify(data.scheduleWeekdays)
        : null;
    }
    if (data.scheduleIntervalHours !== undefined) updateData.scheduleIntervalHours = data.scheduleIntervalHours;
    if (data.startDate !== undefined) updateData.startDate = data.startDate.toISOString().split('T')[0];
    if (data.endDate !== undefined) updateData.endDate = data.endDate ? data.endDate.toISOString().split('T')[0] : null;
    if (data.color !== undefined) updateData.color = data.color;
    // Notification settings
    if (data.notificationsEnabled !== undefined) updateData.notifications_enabled = data.notificationsEnabled;
    if (data.notificationSound !== undefined) updateData.notification_sound = data.notificationSound;
    if (data.vibrationEnabled !== undefined) updateData.vibration_enabled = data.vibrationEnabled;
    if (data.reminderAdvanceMinutes !== undefined) updateData.reminder_advance_minutes = data.reminderAdvanceMinutes;
    // Refill settings
    if (data.currentSupply !== undefined) updateData.current_supply = data.currentSupply;
    if (data.supplyUnit !== undefined) updateData.supply_unit = data.supplyUnit;
    if (data.lowSupplyThreshold !== undefined) updateData.low_supply_threshold = data.lowSupplyThreshold;
    if (data.lastRefillDate !== undefined) updateData.last_refill_date = data.lastRefillDate ? data.lastRefillDate.toISOString() : null;

    await db
      .update(medications)
      .set(updateData)
      .where(eq(medications.id, id));

    // Reschedule notifications
    await NotificationService.cancelMedicationNotifications(id);
    const medication = await this.getById(id);
    if (medication && medication.isActive) {
      await NotificationService.scheduleMedicationNotifications(medication);
    }

    return medication;
  },

  // Archive medication (soft delete)
  async archive(id: string): Promise<void> {
    await db
      .update(medications)
      .set({ isActive: false, updatedAt: new Date().toISOString() })
      .where(eq(medications.id, id));
    
    // Cancel notifications
    await NotificationService.cancelMedicationNotifications(id);
  },

  // Restore archived medication
  async restore(id: string): Promise<void> {
    await db
      .update(medications)
      .set({ isActive: true, updatedAt: new Date().toISOString() })
      .where(eq(medications.id, id));
    
    // Reschedule notifications
    const medication = await this.getById(id);
    if (medication) {
      await NotificationService.scheduleMedicationNotifications(medication);
    }
  },

  // Hard delete medication
  async delete(id: string): Promise<void> {
    await NotificationService.cancelMedicationNotifications(id);
    await db.delete(medications).where(eq(medications.id, id));
  },

  // Update only notification settings for a medication
  async updateNotificationSettings(
    id: string,
    settings: Partial<MedicationNotificationSettings>
  ): Promise<Medication | null> {
    const now = new Date().toISOString();

    const updateData: Record<string, any> = { updatedAt: now };

    if (settings.notificationsEnabled !== undefined) updateData.notifications_enabled = settings.notificationsEnabled;
    if (settings.notificationSound !== undefined) updateData.notification_sound = settings.notificationSound;
    if (settings.vibrationEnabled !== undefined) updateData.vibration_enabled = settings.vibrationEnabled;
    if (settings.reminderAdvanceMinutes !== undefined) updateData.reminder_advance_minutes = settings.reminderAdvanceMinutes;

    await db
      .update(medications)
      .set(updateData)
      .where(eq(medications.id, id));

    // Reschedule notifications
    await NotificationService.cancelMedicationNotifications(id);
    const medication = await this.getById(id);
    if (medication && medication.isActive) {
      await NotificationService.scheduleMedicationNotifications(medication);
    }

    return medication;
  },

  // Calculate days remaining for a medication based on supply and dosage
  calculateDaysRemaining(medication: Medication): number | null {
    if (medication.currentSupply === null || medication.currentSupply <= 0) {
      return null;
    }

    // Only calculate for scheduled medications (not as-needed)
    if (medication.scheduleType === 'as-needed') {
      return null;
    }

    const times = JSON.parse(medication.scheduleTimes) as string[];
    const dosesPerDay = times.length;

    if (dosesPerDay === 0) {
      return null;
    }

    // Days remaining = supply / doses per day
    return Math.floor(medication.currentSupply / dosesPerDay);
  },

  // Check if medication needs refill
  needsRefill(medication: Medication): boolean {
    const daysRemaining = this.calculateDaysRemaining(medication);
    if (daysRemaining === null) {
      return false;
    }

    const threshold = medication.lowSupplyThreshold || 7;
    return daysRemaining <= threshold;
  },

  // Get all medications that need refill
  async getLowSupplyMedications(): Promise<Medication[]> {
    const allMeds = await this.getAll();
    return allMeds.filter((med) => this.needsRefill(med));
  },

  // Mark medication as refilled
  async markAsRefilled(
    id: string,
    newSupply: number,
    unit?: string
  ): Promise<Medication | null> {
    const now = new Date();
    const updateData: Partial<MedicationFormData> = {
      currentSupply: newSupply,
      lastRefillDate: now,
    };

    if (unit) {
      updateData.supplyUnit = unit;
    }

    const updated = await this.update(id, updateData);

    // Cancel and reschedule refill notifications
    if (updated) {
      await NotificationService.cancelMedicationNotifications(id);
      await NotificationService.scheduleMedicationNotifications(updated);
    }

    return updated;
  },

  // Update refill settings only
  async updateRefillSettings(
    id: string,
    settings: {
      currentSupply?: number | null;
      supplyUnit?: string | null;
      lowSupplyThreshold?: number | null;
    }
  ): Promise<Medication | null> {
    const updateData: Partial<MedicationFormData> = {};

    if (settings.currentSupply !== undefined) updateData.currentSupply = settings.currentSupply;
    if (settings.supplyUnit !== undefined) updateData.supplyUnit = settings.supplyUnit;
    if (settings.lowSupplyThreshold !== undefined) updateData.lowSupplyThreshold = settings.lowSupplyThreshold;

    return this.update(id, updateData);
  },
};

// Helper to map DB row to Medication type
function mapToMedication(row: any): Medication {
  return {
    id: row.id,
    name: row.name,
    dosage: row.dosage,
    dosageUnit: row.dosageUnit || row.dosage_unit,
    instructions: row.instructions,
    mealTiming: row.mealTiming || row.meal_timing,
    scheduleType: row.scheduleType || row.schedule_type,
    scheduleTimes: row.scheduleTimes || row.schedule_times,
    scheduleWeekdays: row.scheduleWeekdays || row.schedule_weekdays,
    scheduleIntervalHours: row.scheduleIntervalHours || row.schedule_interval_hours,
    startDate: row.startDate || row.start_date,
    endDate: row.endDate || row.end_date,
    dependsOnMedicationId: row.dependsOnMedicationId || row.depends_on_medication_id,
    dependsOnOffsetDays: row.dependsOnOffsetDays || row.depends_on_offset_days,
    photoUri: row.photoUri || row.photo_uri,
    color: row.color,
    notificationsEnabled: Boolean(row.notifications_enabled ?? row.notificationsEnabled ?? true),
    notificationSound: row.notificationSound || row.notification_sound || 'default',
    vibrationEnabled: Boolean(row.vibration_enabled ?? row.vibrationEnabled ?? true),
    reminderAdvanceMinutes: row.reminderAdvanceMinutes || row.reminder_advance_minutes || 0,
    isActive: Boolean(row.isActive ?? row.is_active),
    createdAt: row.createdAt || row.created_at,
    updatedAt: row.updatedAt || row.updated_at,
    // Refill settings
    currentSupply: row.currentSupply ?? row.current_supply ?? null,
    supplyUnit: row.supplyUnit ?? row.supply_unit ?? null,
    lowSupplyThreshold: row.lowSupplyThreshold ?? row.low_supply_threshold ?? null,
    lastRefillDate: row.lastRefillDate ?? row.last_refill_date ?? null,
  };
}
