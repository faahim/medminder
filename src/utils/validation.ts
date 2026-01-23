import { MedicationFormData } from '../types';

// ============ MEDICATION VALIDATION ============

export interface ValidationResult {
  isValid: boolean;
  errors: Partial<Record<keyof MedicationFormData, string>>;
}

export function validateMedicationForm(data: MedicationFormData): ValidationResult {
  const errors: Partial<Record<keyof MedicationFormData, string>> = {};

  // Name validation
  if (!data.name.trim()) {
    errors.name = 'Medication name is required';
  } else if (data.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters';
  } else if (data.name.length > 100) {
    errors.name = 'Name must be less than 100 characters';
  }

  // Dosage validation
  if (!data.dosage.trim()) {
    errors.dosage = 'Dosage is required';
  } else if (data.dosage.length > 50) {
    errors.dosage = 'Dosage must be less than 50 characters';
  }

  // Instructions validation (optional but has length limit)
  if (data.instructions && data.instructions.length > 500) {
    errors.instructions = 'Instructions must be less than 500 characters';
  }

  // Schedule times validation
  if (!data.scheduleTimes || data.scheduleTimes.length === 0) {
    errors.scheduleTimes = 'At least one scheduled time is required';
  }

  // Start date validation
  if (!data.startDate) {
    errors.startDate = 'Start date is required';
  }

  // End date validation (if provided)
  if (data.hasEndDate && data.endDate && data.endDate < data.startDate) {
    errors.endDate = 'End date must be after start date';
  }

  // Schedule type specific validations
  if (data.scheduleType === 'weekly' && (!data.scheduleWeekdays || data.scheduleWeekdays.length === 0)) {
    errors.scheduleWeekdays = 'At least one weekday must be selected for weekly schedule';
  }

  if (data.scheduleType === 'interval' && (!data.scheduleIntervalHours || data.scheduleIntervalHours < 1)) {
    errors.scheduleIntervalHours = 'Interval must be at least 1 hour';
  }

  // Color validation
  if (!data.color || !/^#[0-9A-Fa-f]{6}$/.test(data.color)) {
    errors.color = 'Invalid color format (must be hex color)';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// ============ DOSE TIME VALIDATION ============

export function validateTimeFormat(time: string): boolean {
  return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
}

// ============ DATE VALIDATION ============

export function validateDateFormat(dateStr: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
}

export function isValidDate(date: Date): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}
