// ~/composables/firestore/AppUser/utils/useAppUserFormatting.ts

/**
 * APP USER FORMATTING UTILITIES
 *
 * Formatting functions for app user fields before saving to Firestore.
 * These ensure consistent data format across the application.
 */

/**
 * Formats display name for storage
 */
export function formatDisplayName(value: string): string {
  return value.trim()
}

/**
 * Formats handle for storage
 */
export function formatHandle(value: string): string {
  return value.trim().toLowerCase()
}

/**
 * Formats email for storage
 */
export function formatEmail(value: string): string {
  return value.trim().toLowerCase()
}

/**
 * Formats bio for storage
 */
export function formatBio(value: string): string {
  return value.trim()
}

/**
 * Formats phone for storage
 */
export function formatPhone(value: string): string {
  return value.trim()
}

/**
 * Formats full name object for storage
 */
export function formatFullName(values: {
  first_name: string
  middle_name?: string
  last_name: string
}): {
  first_name: string
  middle_name?: string
  last_name: string
} {
  const formatted: any = {
    first_name: values.first_name.trim(),
    last_name: values.last_name.trim(),
  }

  if (values.middle_name && values.middle_name.trim()) {
    formatted.middle_name = values.middle_name.trim()
  }

  return formatted
}

/**
 * Formats address object for storage
 */
export function formatAddress(values: {
  street?: string
  city?: string
  state?: string
  country?: string
  postal_code?: string
}): {
  street?: string
  city?: string
  state?: string
  country?: string
  postal_code?: string
} {
  const formatted: any = {}

  if (values.street && values.street.trim()) {
    formatted.street = values.street.trim()
  }

  if (values.city && values.city.trim()) {
    formatted.city = values.city.trim()
  }

  if (values.state && values.state.trim()) {
    formatted.state = values.state.trim()
  }

  if (values.country && values.country.trim()) {
    formatted.country = values.country.trim()
  }

  if (values.postal_code && values.postal_code.trim()) {
    formatted.postal_code = values.postal_code.trim()
  }

  if (values.country && values.country.trim()) {
    formatted.country = values.country.trim()
  }

  return formatted
}
