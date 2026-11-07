import { APP_ROLES, APP_STATUSES, type App } from '../models/app.model.ts'

const APP_FIELDS = new Set([
  'ecosystem_id',
  'role',
  'status',
  'name',
  'short_name',
  'tagline',
  'description',
  'social_links',
  'media',
  'created',
  'updated',
])
const SOCIAL_LINK_FIELDS = [
  'website',
  'twitter',
  'github',
  'linkedin',
  'instagram',
  'facebook',
  'youtube',
  'email',
] as const
const MEDIA_FIELDS = [
  'thumbnail_url',
  'logo_url',
  'wordmark_light_url',
  'wordmark_dark_url',
  'cover_url',
] as const

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function hasOptionalStringFields(
  value: unknown,
  fields: readonly string[]
): value is Record<string, string | undefined> {
  if (!isRecord(value)) return false
  const keys = Object.keys(value)
  return (
    keys.every((field) => fields.includes(field)) &&
    keys.every((field) => typeof value[field] === 'string')
  )
}

function isStamp(value: unknown, allowAppId = false): value is App['created'] {
  if (!isRecord(value) || !isRecord(value.at)) return false
  if (
    typeof value.at.seconds !== 'number' ||
    typeof value.at.nanoseconds !== 'number'
  ) {
    return false
  }
  return (
    Object.keys(value).every(
      (key) => key === 'at' || key === 'by' || (allowAppId && key === 'app_id')
    ) &&
    (value.by === undefined || typeof value.by === 'string') &&
    (value.app_id === undefined ||
      (allowAppId && typeof value.app_id === 'string'))
  )
}

/** Read one canonical App document. Document identity is supplied by Firestore. */
export function readAppDocument(raw: unknown, id: string): App | null {
  if (!id || !isRecord(raw)) return null
  if (
    typeof raw.ecosystem_id !== 'string' ||
    !raw.ecosystem_id.trim() ||
    !APP_ROLES.some((role) => role === raw.role) ||
    !APP_STATUSES.some((status) => status === raw.status) ||
    typeof raw.name !== 'string' ||
    (raw.short_name !== undefined && typeof raw.short_name !== 'string') ||
    (raw.tagline !== undefined && typeof raw.tagline !== 'string') ||
    (raw.description !== undefined && typeof raw.description !== 'string') ||
    (raw.social_links !== undefined &&
      !hasOptionalStringFields(raw.social_links, SOCIAL_LINK_FIELDS)) ||
    (raw.media !== undefined &&
      !hasOptionalStringFields(raw.media, MEDIA_FIELDS)) ||
    !isStamp(raw.created, true) ||
    !isStamp(raw.updated)
  ) {
    return null
  }
  // Project canonical fields only. Unrelated stored metadata must neither
  // hide the App nor become an alternate relationship authority.
  const fields = Object.fromEntries(
    Object.entries(raw).filter(([key]) => APP_FIELDS.has(key))
  )
  const projectStamp = (stamp: App['created']) => ({
    at: { seconds: stamp.at.seconds, nanoseconds: stamp.at.nanoseconds },
    ...(stamp.by !== undefined ? { by: stamp.by } : {}),
  })
  return {
    ...fields,
    id,
    created: {
      ...projectStamp(raw.created),
      ...(raw.created.app_id !== undefined
        ? { app_id: raw.created.app_id }
        : {}),
    },
    updated: projectStamp(raw.updated),
  } as App
}
