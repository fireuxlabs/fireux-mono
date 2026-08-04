import type { AppSocialLinks } from '../../../../../../../models/utils/app'

/** Validates app description field */
export function validateAppDescription(value: string): string | null {
  const trimmedValue = value.trim()
  if (trimmedValue.length > 500)
    return 'Description must be less than 500 characters'
  return null
}

/** Validates a single URL */
export function validateUrl(url: string, platform: string): string | null {
  if (!url || !url.trim()) return null
  try {
    const urlObj = new URL(url.trim())
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return `${platform} URL must use http or https protocol`
    }
    return null
  } catch {
    return `Invalid ${platform} URL format`
  }
}

/** Validates social links object */
export function validateSocialLinks(
  socialLinks: AppSocialLinks
): string | null {
  if (!socialLinks || typeof socialLinks !== 'object') {
    return 'Social links must be an object'
  }

  const platforms = [
    'website',
    'instagram',
    'twitter',
    'linkedin',
    'github',
    'facebook',
    'youtube',
  ] as const

  for (const platform of platforms) {
    const url = socialLinks[platform]
    if (typeof url === 'string' && url.trim()) {
      const validationError = validateUrl(url, platform)
      if (validationError) return validationError
    }
  }

  return null
}

/** Main validation function that validates all app fields */
export function validateAppField(field: string, value: any): string | null {
  switch (field) {
    case 'description':
      return validateAppDescription(value)
    case 'social_links':
      return validateSocialLinks(value)
    default:
      return `Unknown app field: ${field}`
  }
}
