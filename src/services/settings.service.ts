import { eq } from 'drizzle-orm';
import { db } from '../db/client';
import { settings } from '../db/schema';
import { Settings } from '../types';

const DEFAULT_SETTINGS: Omit<Settings, 'id'> = {
  snoozeDurationMinutes: 15,
  missedThresholdMinutes: 60,
  notificationSound: 'default',
  hapticFeedback: true,
  darkMode: 'system',
  fontSize: 'normal',
  reminderAdvanceMinutes: 0,
};

export const SettingsService = {
  async get(): Promise<Settings> {
    const result = await db.select().from(settings).where(eq(settings.id, 1)).limit(1);
    
    if (result.length === 0) {
      // Insert default settings
      await db.insert(settings).values({ id: 1, ...DEFAULT_SETTINGS });
      return { id: 1, ...DEFAULT_SETTINGS };
    }
    
    return result[0] as Settings;
  },

  async update(data: Partial<Omit<Settings, 'id'>>): Promise<Settings> {
    await db.update(settings).set(data).where(eq(settings.id, 1));
    return this.get();
  },

  async reset(): Promise<Settings> {
    await db.update(settings).set(DEFAULT_SETTINGS).where(eq(settings.id, 1));
    return this.get();
  },
};
