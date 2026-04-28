import crypto from 'crypto';

/**
 * Generates a SHA-256 hash of request data for idempotency comparison
 */
export function hashRequest(data: unknown): string {
  const stringified = JSON.stringify(data);
  return crypto.createHash('sha256').update(stringified).digest('hex');
}

/**
 * Validates expense data
 */
export interface ValidateExpenseInput {
  amount?: unknown;
  category?: unknown;
  description?: unknown;
  date?: unknown;
}

export interface ValidationError {
  field: string;
  message: string;
}

export function validateExpense(data: ValidateExpenseInput): ValidationError[] {
  const errors: ValidationError[] = [];

  // Validate amount
  if (typeof data.amount !== 'number') {
    errors.push({ field: 'amount', message: 'Amount must be a number' });
  } else if (data.amount <= 0) {
    errors.push({ field: 'amount', message: 'Amount must be greater than 0' });
  } else if (!Number.isInteger(data.amount) || data.amount < 0) {
    errors.push({ field: 'amount', message: 'Amount must be a positive integer (paise)' });
  }

  // Validate category
  if (typeof data.category !== 'string' || data.category.trim() === '') {
    errors.push({ field: 'category', message: 'Category is required and must be a non-empty string' });
  }

  // Validate description (optional but if provided, must be string)
  if (data.description !== undefined && typeof data.description !== 'string') {
    errors.push({ field: 'description', message: 'Description must be a string' });
  }

  // Validate date
  if (typeof data.date !== 'string') {
    errors.push({ field: 'date', message: 'Date must be an ISO string' });
  } else {
    const dateObj = new Date(data.date);
    if (isNaN(dateObj.getTime())) {
      errors.push({ field: 'date', message: 'Date must be a valid ISO string' });
    }
  }

  return errors;
}

/**
 * Converts paise to rupees for display
 */
export function paiseToRupees(paise: number): number {
  return paise / 100;
}

/**
 * Converts rupees to paise for storage
 */
export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}
