// ============ ENUMS ============

export type MealTiming = 'before' | 'after' | 'with' | 'anytime';
export type DoseStatus = 'pending' | 'taken' | 'missed' | 'skipped';
export type ScheduleType = 'daily' | 'weekly' | 'interval' | 'as-needed';
export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';
export type NotificationSound = 'default' | 'gentle' | 'urgent';
export type SupplyUnit = 'pills' | 'ml' | 'doses';

// ============ CORE ENTITIES ============

export interface Medication {
  id: string;                      // UUID
  name: string;                    // "Domperidone"
  dosage: string;                  // "10mg"
  dosageUnit: string;              // "tablet" | "ml" | "capsule"
  instructions: string | null;     // "Take with full glass of water"
  mealTiming: MealTiming;          // "before" | "after" | "with" | "anytime"
  scheduleType: ScheduleType;      // "daily" | "weekly" | "interval" | "as-needed"
  scheduleTimes: string;           // JSON: ["08:00", "20:00"]
  scheduleWeekdays: string | null; // JSON: [1,3,5] for Mon/Wed/Fri (only if weekly)
  scheduleIntervalHours: number | null; // e.g., 6 (only if interval)
  startDate: string;               // ISO date "2025-01-23"
  endDate: string | null;          // ISO date or null (ongoing)
  dependsOnMedicationId: string | null; // For sequential start
  dependsOnOffsetDays: number | null;   // Days after dependency completes
  photoUri: string | null;         // Local file path
  color: string;                   // Hex color for UI "#4CAF50"
  notificationsEnabled: boolean;   // Per-medication notification toggle
  notificationSound: string;       // "default" | "gentle" | "urgent"
  vibrationEnabled: boolean;       // Enable vibration for this medication
  reminderAdvanceMinutes: number;  // Minutes before scheduled time to remind (0 = none)
  isActive: boolean;               // Soft delete / archive
  createdAt: string;               // ISO timestamp
  updatedAt: string;               // ISO timestamp
  // Refill settings
  currentSupply: number | null;    // Current supply count (e.g., 30 pills)
  supplyUnit: string | null;        // 'pills' | 'ml' | 'doses'
  lowSupplyThreshold: number | null; // Alert when days remaining <= threshold (3/5/7/10)
  lastRefillDate: string | null;   // ISO timestamp of last refill
}

export interface DoseLog {
  id: string;                      // UUID
  medicationId: string;            // FK to Medication
  scheduledDate: string;           // ISO date "2025-01-23"
  scheduledTime: string;           // "08:00"
  status: DoseStatus;              // "pending" | "taken" | "missed" | "skipped"
  loggedAt: string | null;         // ISO timestamp when action taken
  notes: string | null;            // Optional user note
  createdAt: string;               // ISO timestamp
}

export type NotificationPermissionStatus = 'not-determined' | 'granted' | 'denied';

export interface Settings {
  id: number;                      // Always 1 (singleton)
  snoozeDurationMinutes: number;   // Default: 15
  missedThresholdMinutes: number;  // Minutes after scheduled to mark missed (default: 60)
  gracePeriodMinutes: number;      // Grace period before follow-up notification (default: 30)
  notificationSound: string;       // "default" | "gentle" | "urgent"
  hapticFeedback: boolean;         // Enable/disable haptics
  darkMode: 'system' | 'light' | 'dark';
  fontSize: 'normal' | 'large' | 'xlarge';
  reminderAdvanceMinutes: number;  // How early to remind (default: 0)
  notificationsEnabled: boolean;   // Master toggle for notifications (default: true)
  notificationsPermission: NotificationPermissionStatus; // Permission status: 'not-determined' | 'granted' | 'denied'
  notificationOnboardingShown: boolean; // Whether permission onboarding modal has been shown
  notificationOnboardingLastShown: string | null; // ISO timestamp of last onboarding show
}

// ============ DERIVED TYPES ============

export interface ScheduledDose {
  medication: Medication;
  scheduledDate: string;
  scheduledTime: string;
  timeOfDay: TimeOfDay;
  status: DoseStatus;
  doseLogId: string | null;        // If already logged
}

export interface DayAggregate {
  date: string;
  totalDoses: number;
  takenCount: number;
  missedCount: number;
  skippedCount: number;
  pendingCount: number;
  adherencePercent: number;        // (taken / (taken + missed)) * 100
}

// ============ FORM TYPES ============

export interface MedicationFormData {
  name: string;
  dosage: string;
  dosageUnit: string;
  instructions: string;
  mealTiming: MealTiming;
  scheduleType: ScheduleType;
  scheduleTimes: string[];         // ["08:00", "20:00"]
  scheduleWeekdays: number[];      // [1,3,5]
  scheduleIntervalHours: number;
  startDate: Date;
  endDate: Date | null;
  hasEndDate: boolean;
  dependsOnMedicationId: string | null;
  dependsOnOffsetDays: number;
  color: string;
  // Notification settings
  notificationsEnabled: boolean;
  notificationSound: NotificationSound;
  vibrationEnabled: boolean;
  reminderAdvanceMinutes: number;
  // Refill settings
  currentSupply: number;
  supplyUnit: string;
  lowSupplyThreshold: number;
  lastRefillDate: Date | null;
}

// Per-medication notification settings (subset of MedicationFormData)
export interface MedicationNotificationSettings {
  notificationsEnabled: boolean;
  notificationSound: NotificationSound;
  vibrationEnabled: boolean;
  reminderAdvanceMinutes: number;
}
