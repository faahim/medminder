import * as SQLite from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from './schema';

const expo = SQLite.openDatabaseSync('medminder.db');

export const db = drizzle(expo, { schema });

// Initialize database with tables
export async function initializeDatabase() {
  await expo.execAsync(`
    CREATE TABLE IF NOT EXISTS medications (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      dosage TEXT NOT NULL,
      dosage_unit TEXT NOT NULL DEFAULT 'tablet',
      instructions TEXT,
      meal_timing TEXT NOT NULL DEFAULT 'anytime',
      schedule_type TEXT NOT NULL DEFAULT 'daily',
      schedule_times TEXT NOT NULL DEFAULT '["08:00"]',
      schedule_weekdays TEXT,
      schedule_interval_hours INTEGER,
      start_date TEXT NOT NULL,
      end_date TEXT,
      depends_on_medication_id TEXT,
      depends_on_offset_days INTEGER,
      photo_uri TEXT,
      color TEXT NOT NULL DEFAULT '#4CAF50',
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS dose_logs (
      id TEXT PRIMARY KEY,
      medication_id TEXT NOT NULL,
      scheduled_date TEXT NOT NULL,
      scheduled_time TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      logged_at TEXT,
      notes TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (medication_id) REFERENCES medications(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY DEFAULT 1,
      snooze_duration_minutes INTEGER NOT NULL DEFAULT 15,
      missed_threshold_minutes INTEGER NOT NULL DEFAULT 60,
      notification_sound TEXT NOT NULL DEFAULT 'default',
      haptic_feedback INTEGER NOT NULL DEFAULT 1,
      dark_mode TEXT NOT NULL DEFAULT 'system',
      font_size TEXT NOT NULL DEFAULT 'normal',
      reminder_advance_minutes INTEGER NOT NULL DEFAULT 0
    );

    INSERT OR IGNORE INTO settings (id) VALUES (1);

    CREATE UNIQUE INDEX IF NOT EXISTS idx_dose_logs_unique 
      ON dose_logs(medication_id, scheduled_date, scheduled_time);

    CREATE INDEX IF NOT EXISTS idx_dose_logs_date ON dose_logs(scheduled_date);
    CREATE INDEX IF NOT EXISTS idx_dose_logs_med_date ON dose_logs(medication_id, scheduled_date);
    CREATE INDEX IF NOT EXISTS idx_medications_active ON medications(is_active);
  `);
}
