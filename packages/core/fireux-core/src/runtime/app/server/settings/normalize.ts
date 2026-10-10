import type { DocumentData } from 'firebase-admin/firestore'
import { createError } from 'h3'

const TEXT_FIELDS = {
  name: 60,
  short_name: 40,
  tagline: 160,
  description: 500,
} as const
const MEDIA_FIELDS = new Set([
  'media.thumbnail_url',
  'media.logo_url',
  'media.wordmark_light_url',
  'media.wordmark_dark_url',
  'media.cover_url',
])

function fail(statusCode: number, statusMessage: string): never {
  throw createError({ statusCode, statusMessage })
}

function cleanUrl(value: unknown, label = 'App media'): string {
  const text = String(value ?? '').trim()
  if (!text) return ''
  let url: URL
  try {
    url = new URL(text)
  } catch {
    return fail(400, `${label} must use a valid HTTPS URL.`)
  }
  if (url.protocol !== 'https:') fail(400, `${label} must use HTTPS.`)
  return url.toString()
}

const SOCIAL_LINK_KEYS = [
  'website',
  'twitter',
  'github',
  'linkedin',
  'instagram',
  'facebook',
  'youtube',
] as const

function cleanSocialLinks(value: unknown): DocumentData {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    fail(400, 'App social_links must be an object.')
  }
  const input = value as Record<string, unknown>
  const links: DocumentData = {}
  for (const key of SOCIAL_LINK_KEYS) links[key] = cleanUrl(input[key])
  links.email = String(input.email ?? '')
    .trim()
    .slice(0, 320)
  return links
}

export function normalizeAppSettings(body: unknown): DocumentData {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    fail(400, 'App settings payload must be an object.')
  }
  const input = body as Record<string, unknown>
  const patch: DocumentData = {}
  for (const [field, value] of Object.entries(input)) {
    if (field === 'social_links.website') {
      patch[field] = cleanUrl(value, 'App address')
      continue
    }
    if (Object.hasOwn(TEXT_FIELDS, field)) {
      const limit = TEXT_FIELDS[field as keyof typeof TEXT_FIELDS]
      const text = String(value ?? '')
        .trim()
        .slice(0, limit)
      if ((field === 'name' || field === 'short_name') && !text) {
        fail(400, `${field} is required.`)
      }
      patch[field] = text
      continue
    }
    if (MEDIA_FIELDS.has(field)) {
      patch[field] = cleanUrl(value)
      continue
    }
    if (field === 'social_links') {
      patch[field] = cleanSocialLinks(value)
      continue
    }
    fail(400, `App setting is not editable: ${field}`)
  }
  if (!Object.keys(patch).length) fail(400, 'No App settings were supplied.')
  return patch
}
