import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const medications = sqliteTable('medications', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  dosage: text('dosage').notNull(),
  dosageUnit: text('dosage_unit').notNull().default('tablet'),
  instructions: text('instructions'),
  mealTiming: text('meal_timing').notNull().default('anytime'),
  scheduleType: text('schedule_type').notNull().default('daily'),
  scheduleTimes: text('schedule_times').notNull().default('["08:00"]'),
  scheduleWeekdays: text('schedule_weekdays'),
  scheduleIntervalHours: integer('schedule_interval_hours'),
  startDate: text('start_date').notNull(),
  endDate: text('end_date'),
  dependsOnMedicationId: text('depends_on_medication_id'),
  dependsOnOffsetDays: integer('depends_on_offset_days'),
  photoUri: text('photo_uri'),
  color: text('color').notNull().default('#4CAF50'),
  // Per-medication notification settings
  notificationsEnabled: integer('notifications_enabled', { mode: 'boolean' }).notNull().default(true),
  notificationSound: text('notification_sound').notNull().default('default'),
  vibrationEnabled: integer('vibration_enabled', { mode: 'boolean' }).notNull().default(true),
  reminderAdvanceMinutes: integer('reminder_advance_minutes').notNull().default(0),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const doseLogs = sqliteTable('dose_logs', {
  id: text('id').primaryKey(),
  medicationId: text('medication_id').notNull().references(() => medications.id, { onDelete: 'cascade' }),
  scheduledDate: text('scheduled_date').notNull(),
  scheduledTime: text('scheduled_time').notNull(),
  status: text('status').notNull().default('pending'),
  loggedAt: text('logged_at'),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
});

export const settings = sqliteTable('settings', {
  id: integer('id').primaryKey().default(1),
  snoozeDurationMinutes: integer('snooze_duration_minutes').notNull().default(15),
  missedThresholdMinutes: integer('missed_threshold_minutes').notNull().default(60),
  notificationSound: text('notification_sound').notNull().default('default'),
  hapticFeedback: integer('haptic_feedback', { mode: 'boolean' }).notNull().default(true),
  darkMode: text('dark_mode').notNull().default('system'),
  fontSize: text('font_size').notNull().default('normal'),
  reminderAdvanceMinutes: integer('reminder_advance_minutes').notNull().default(0),
  notificationsEnabled: integer('notifications_enabled', { mode: 'boolean' }).notNull().default(true),
});
