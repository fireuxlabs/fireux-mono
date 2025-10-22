// ~/composables/app/utils/useAppValidation.ts

/**
 * APP VALIDATION UTILITIES
 *
 * Validation functions for app-level fields that can be updated at runtime.
 * These are separated from the update composable for better maintainability.
 */

// Types for app editable fields
export interface AppSocialLinks {
  website?: string
  twitter?: string
  facebook?: string
  instagram?: string
  linkedin?: string
  youtube?: string
}

/**
 * Validates app description field
 */
export function validateAppDescription(value: string): string | null {
  const trimmedValue = value.trim()

  if (trimmedValue.length > 500) {
    return 'Description must be less than 500 characters'
  }

  // Description can be empty (optional field)
  return null
}

/**
 * Validates admin IDs array
 */
export function validateAdminIds(adminIds: string[]): string | null {
  if (!Array.isArray(adminIds)) {
    return 'Admin IDs must be an array'
  }

  if (adminIds.length === 0) {
    return 'At least one admin is required'
  }

  // Validate that all IDs are non-empty strings
  for (const id of adminIds) {
    if (typeof id !== 'string' || !id.trim()) {
      return 'All admin IDs must be non-empty strings'
    }

    // Basic UID validation (Firebase UIDs are typically 28 characters)
    if (id.length !== 28) {
      return 'Invalid admin ID format (must be 28 characters)'
    }
  }

  return null
}

/**
 * Validates a single URL
 */
export function validateUrl(url: string, platform: string): string | null {
  if (!url || !url.trim()) {
    return null // Empty URLs are allowed
  }

  try {
    const urlObj = new URL(url.trim())

    // Ensure it's http or https
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return `${platform} URL must use http or https protocol`
    }

    return null
  } catch {
    return `Invalid ${platform} URL format`
  }
}

/**
 * Validates social links object
 */
export function validateSocialLinks(
  socialLinks: AppSocialLinks
): string | null {
  if (!socialLinks || typeof socialLinks !== 'object') {
    return 'Social links must be an object'
  }

  // Validate each URL if provided
  const platforms = [
    'website',
    'twitter',
    'facebook',
    'instagram',
    'linkedin',
    'youtube',
  ] as const

  for (const platform of platforms) {
    const url = socialLinks[platform]
    if (url) {
      const validationError = validateUrl(url, platform)
      if (validationError) {
        return validationError
      }
    }
  }

  return null
}

/**
 * Main validation function that validates all app fields
 */
export function validateAppField(field: string, value: any): string | null {
  switch (field) {
    case 'description':
      return validateAppDescription(value)
    case 'admin_ids':
      return validateAdminIds(value)
    case 'social_links':
      return validateSocialLinks(value)
    default:
      return `Unknown app field: ${field}`
  }
}
