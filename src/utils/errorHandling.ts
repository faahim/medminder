// ============ ERROR CLASSES ============

export class DatabaseError extends Error {
  constructor(message: string, public originalError?: unknown) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public fields: Record<string, string>
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotificationError extends Error {
  constructor(message: string, public originalError?: unknown) {
    super(message);
    this.name = 'NotificationError';
  }
}

export class MedicationNotFoundError extends Error {
  constructor(id: string) {
    super(`Medication with ID ${id} not found`);
    this.name = 'MedicationNotFoundError';
  }
}

export class DoseLogNotFoundError extends Error {
  constructor(id: string) {
    super(`Dose log with ID ${id} not found`);
    this.name = 'DoseLogNotFoundError';
  }
}

// ============ ERROR HANDLING UTILITIES ============

export function isDatabaseError(error: unknown): error is DatabaseError {
  return error instanceof DatabaseError;
}

export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

export function isNotificationError(error: unknown): error is NotificationError {
  return error instanceof NotificationError;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

export function logError(error: unknown, context?: string): void {
  const errorMessage = getErrorMessage(error);
  const contextStr = context ? `[${context}] ` : '';
  
  console.error(`${contextStr}${errorMessage}`, error);

  // In production, you might send this to a logging service
  // Example: Analytics.logError(errorMessage, context);
}

export async function safeAsync<T>(
  fn: () => Promise<T>,
  fallback: T,
  onError?: (error: unknown) => void
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (onError) {
      onError(error);
    }
    return fallback;
  }
}

export function withErrorHandler<T extends (...args: any[]) => any>(
  fn: T,
  context?: string
): T {
  return ((...args: Parameters<T>) => {
    try {
      const result = fn(...args);
      
      // Handle async functions
      if (result instanceof Promise) {
        return result.catch((error) => {
          logError(error, context);
          throw error;
        });
      }
      
      return result;
    } catch (error) {
      logError(error, context);
      throw error;
    }
  }) as T;
}
