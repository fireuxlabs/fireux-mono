// ~/composables/app/utils/useAppFormatting.ts

/**
 * APP FORMATTING UTILITIES
 *
 * Formatting functions for app-level fields before saving to Firestore.
 * These ensure consistent data format across the application.
 */

import type { AppSocialLinks } from './useAppValidation'

/**
 * Formats app description for storage
 */
export function formatAppDescription(value: string): string {
  return value.trim()
}

/**
 * Formats admin IDs array for storage
 */
export function formatAdminIds(adminIds: string[]): string[] {
  return adminIds.map((id) => id.trim()).filter((id) => id.length > 0) // Remove empty strings
}

/**
 * Formats a single URL for storage
 */
export function formatUrl(url: string): string {
  const trimmed = url.trim()

  // Add https:// if no protocol is specified
  if (trimmed && !trimmed.match(/^https?:\/\//)) {
    return `https://${trimmed}`
  }

  return trimmed
}

/**
 * Formats social links object for storage
 */
export function formatSocialLinks(socialLinks: AppSocialLinks): AppSocialLinks {
  const formatted: AppSocialLinks = {}

  // Format each URL and only include non-empty ones
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
    if (url && url.trim()) {
      formatted[platform] = formatUrl(url)
    }
  }

  return formatted
}

/**
 * Main formatting function that formats any app field
 */
export function formatAppField(field: string, value: any): any {
  switch (field) {
    case 'description':
      return formatAppDescription(value)
    case 'admin_ids':
      return formatAdminIds(value)
    case 'social_links':
      return formatSocialLinks(value)
    default:
      return value // Return as-is for unknown fields
  }
}
