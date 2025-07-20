// ~/composables/firestore/AppUser/utils/useAppUserValidation.ts

/**
 * APP USER VALIDATION UTILITIES
 *
 * Validation functions for app user fields that can be updated at runtime.
 * These are separated from the update composable for better maintainability.
 */

// Enum for single field updates (for compatibility with existing code)
export enum AppUserSingleField {
  DISPLAY_NAME = 'display_name',
  HANDLE = 'handle',
  EMAIL = 'email',
}

/**
 * Validates display name field
 */
export function validateDisplayName(value: string): string | null {
  const trimmedValue = value.trim()

  if (!trimmedValue) {
    return 'Display name cannot be empty'
  }

  if (trimmedValue.length < 2) {
    return 'Display name must be at least 2 characters long'
  }

  if (trimmedValue.length > 50) {
    return 'Display name must be less than 50 characters'
  }

  // Check for valid characters (letters, numbers, spaces, basic punctuation)
  if (!/^[a-zA-Z0-9\s\-_.']+$/.test(trimmedValue)) {
    return 'Display name contains invalid characters'
  }

  return null
}

/**
 * Validates handle field
 */
export function validateHandle(value: string): string | null {
  const trimmedValue = value.trim()

  if (!trimmedValue) {
    return 'Handle cannot be empty'
  }

  if (trimmedValue.length < 3) {
    return 'Handle must be at least 3 characters long'
  }

  if (trimmedValue.length > 30) {
    return 'Handle must be less than 30 characters'
  }

  // Handle should be alphanumeric with underscores/hyphens only
  if (!/^[a-zA-Z0-9_-]+$/.test(trimmedValue)) {
    return 'Handle can only contain letters, numbers, underscores, and hyphens'
  }

  // Handle should start with a letter or number
  if (!/^[a-zA-Z0-9]/.test(trimmedValue)) {
    return 'Handle must start with a letter or number'
  }

  return null
}

/**
 * Validates email field
 */
export function validateEmail(value: string): string | null {
  const trimmedValue = value.trim()

  if (!trimmedValue) {
    return 'Email cannot be empty'
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(trimmedValue)) {
    return 'Please enter a valid email address'
  }

  if (trimmedValue.length > 254) {
    return 'Email address is too long'
  }

  return null
}

/**
 * Validates bio field
 */
export function validateBio(value: string): string | null {
  const trimmedValue = value.trim()

  if (trimmedValue.length > 500) {
    return 'Bio must be less than 500 characters'
  }

  // Bio can be empty (optional field)
  return null
}

/**
 * Validates phone field
 */
export function validatePhone(value: string): string | null {
  const trimmedValue = value.trim()

  // Phone is optional, so empty is allowed
  if (!trimmedValue) {
    return null
  }

  // Basic phone validation
  if (!/^[\+]?[1-9][\d]{0,15}$/.test(trimmedValue.replace(/\s/g, ''))) {
    return 'Please enter a valid phone number'
  }

  return null
}

/**
 * Validates full name object
 */
export function validateFullName(values: {
  first_name: string
  middle_name?: string
  last_name: string
}): string | null {
  if (!values.first_name?.trim()) {
    return 'First name is required'
  }

  if (!values.last_name?.trim()) {
    return 'Last name is required'
  }

  if (values.first_name.trim().length > 50) {
    return 'First name must be less than 50 characters'
  }

  if (values.last_name.trim().length > 50) {
    return 'Last name must be less than 50 characters'
  }

  if (values.middle_name && values.middle_name.trim().length > 50) {
    return 'Middle name must be less than 50 characters'
  }

  return null
}

/**
 * Validates address object
 */
export function validateAddress(values: {
  street?: string
  city?: string
  state?: string
  country?: string
  postal_code?: string
}): string | null {
  // Address fields are optional, but if provided should be reasonable length
  if (values.street && values.street.trim().length > 200) {
    return 'Street address must be less than 200 characters'
  }

  if (values.city && values.city.trim().length > 100) {
    return 'City must be less than 100 characters'
  }

  if (values.state && values.state.trim().length > 100) {
    return 'State must be less than 100 characters'
  }

  if (values.country && values.country.trim().length > 100) {
    return 'Country must be less than 100 characters'
  }

  if (values.postal_code && values.postal_code.trim().length > 20) {
    return 'Postal code must be less than 20 characters'
  }

  return null
}

/**
 * Main validation function for single fields (backwards compatibility)
 */
export function validateSingleField(
  field: AppUserSingleField,
  value: string
): string | null {
  switch (field) {
    case AppUserSingleField.DISPLAY_NAME:
      return validateDisplayName(value)
    case AppUserSingleField.HANDLE:
      return validateHandle(value)
    case AppUserSingleField.EMAIL:
      return validateEmail(value)
    default:
      return null
  }
}
