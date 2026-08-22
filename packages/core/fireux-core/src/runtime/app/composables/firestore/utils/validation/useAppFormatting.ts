import {
  createEmptyAppSocialLinks,
} from '../factories/createEmptyAppSocialLinks'
import type { App } from '../../../../models/app.model.ts'

const HTTPS_PROTOCOL_REGEX = /^https?:\/\//

/** Formats app description for storage */
export function formatAppDescription(value: string): string {
  return value.trim()
}

/** Formats a single URL for storage */
export function formatUrl(url: string): string {
  const trimmed = url.trim()
  if (trimmed && !HTTPS_PROTOCOL_REGEX.exec(trimmed)) {
    return `https://${trimmed}`
  }
  return trimmed
}

/** Formats social links object for storage */
export function formatSocialLinks(socialLinks: App['social_links']): App['social_links'] {
  const formatted: App['social_links'] = createEmptyAppSocialLinks()
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
    const trimmed = (socialLinks[platform] ?? '').trim()
    formatted[platform] = trimmed ? formatUrl(trimmed) : ''
  }

  // Email is stored as a raw string (not a URL).
  formatted.email = (socialLinks.email ?? '').trim()

  return formatted
}

/** Main formatting function that formats any app field */
export function formatAppField(field: string, value: any): any {
  switch (field) {
    case 'description':
      return formatAppDescription(value)
    case 'social_links':
      return formatSocialLinks(value)
    default:
      return value
  }
}
