/**
 * Common validation utilities for LMS Portal
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates a person's name (First Name, Middle Name, Last Name)
 * - Required check (if isRequired is true)
 * - Length check (2-50 chars)
 * - Character check: only alphabetic characters, spaces, hyphens, apostrophes, periods
 */
export function validateName(
  name: string | null | undefined,
  fieldName: string = 'Name',
  isRequired: boolean = true
): ValidationResult {
  const trimmed = (name || '').trim();

  if (!trimmed) {
    if (isRequired) {
      return { isValid: false, error: `${fieldName} is required.` };
    }
    return { isValid: true };
  }

  if (trimmed.length < (isRequired ? 2 : 1)) {
    return { isValid: false, error: `${fieldName} must be at least ${isRequired ? 2 : 1} character(s) long.` };
  }

  if (trimmed.length > 50) {
    return { isValid: false, error: `${fieldName} must not exceed 50 characters.` };
  }

  // Regex allows letters (Unicode & English), spaces, hyphens, apostrophes, and periods
  const nameRegex = /^[A-Za-z\s'\-.]+$/;
  if (!nameRegex.test(trimmed)) {
    return {
      isValid: false,
      error: `${fieldName} must contain only letters, spaces, hyphens, and apostrophes. Numbers and special symbols are not allowed.`,
    };
  }

  return { isValid: true };
}

/**
 * Validates Department Name
 * - Required
 * - Length 2-100 characters
 * - Valid characters: letters, numbers, spaces, hyphens, ampersands, slashes, periods
 */
export function validateDepartment(department: string | null | undefined): ValidationResult {
  const trimmed = (department || '').trim();

  if (!trimmed) {
    return { isValid: false, error: 'Department name is required.' };
  }

  if (trimmed.length < 2) {
    return { isValid: false, error: 'Department name must be at least 2 characters long.' };
  }

  if (trimmed.length > 100) {
    return { isValid: false, error: 'Department name must not exceed 100 characters.' };
  }

  const deptRegex = /^[A-Za-z0-9\s'&\-./]+$/;
  if (!deptRegex.test(trimmed)) {
    return {
      isValid: false,
      error: 'Department name contains invalid characters. Only letters, numbers, spaces, &, -, ., / are allowed.',
    };
  }

  return { isValid: true };
}

/**
 * Validates Email Address
 * - Required
 * - Standard email regex (user@domain.ext)
 */
export function validateEmail(email: string | null | undefined): ValidationResult {
  const trimmed = (email || '').trim();

  if (!trimmed) {
    return { isValid: false, error: 'Email address is required.' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return { isValid: false, error: 'Please enter a valid email address (e.g. user@corporate.com).' };
  }

  return { isValid: true };
}

/**
 * Validates Date (e.g. Joining Date)
 * - Date must not be in the future (must not be greater than today's date)
 */
export function validateDateNotFuture(
  dateInput: string | Date | null | undefined,
  fieldName: string = 'Date'
): ValidationResult {
  if (!dateInput) {
    return { isValid: false, error: `${fieldName} is required.` };
  }

  const dateObj = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(dateObj.getTime())) {
    return { isValid: false, error: `Invalid ${fieldName.toLowerCase()} format.` };
  }

  // Set today's date threshold to end of today (23:59:59.999) in local time
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  if (dateObj > todayEnd) {
    return {
      isValid: false,
      error: `${fieldName} cannot be in the future (must not be greater than today's date).`,
    };
  }

  return { isValid: true };
}

/**
 * Comprehensive Employee Form Validation
 */
export function validateEmployeeData(data: {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  department: string;
  joiningDate: string | Date;
}): ValidationResult {
  // 1. Validate First Name
  const fnRes = validateName(data.firstName, 'First Name', true);
  if (!fnRes.isValid) return fnRes;

  // 2. Validate Middle Name (optional)
  if (data.middleName && data.middleName.trim()) {
    const mnRes = validateName(data.middleName, 'Middle Name', false);
    if (!mnRes.isValid) return mnRes;
  }

  // 3. Validate Last Name
  const lnRes = validateName(data.lastName, 'Last Name', true);
  if (!lnRes.isValid) return lnRes;

  // 4. Validate Email
  const emailRes = validateEmail(data.email);
  if (!emailRes.isValid) return emailRes;

  // 5. Validate Department
  const deptRes = validateDepartment(data.department);
  if (!deptRes.isValid) return deptRes;

  // 6. Validate Joining Date
  const dateRes = validateDateNotFuture(data.joiningDate, 'Joining Date');
  if (!dateRes.isValid) return dateRes;

  return { isValid: true };
}
