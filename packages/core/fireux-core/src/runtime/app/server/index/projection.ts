import type { App } from '../../models/app.model.ts'
import type { AppSocialLinks } from '../../models/app-directory.model.ts'
import type { FirebaseTimestamp } from '../../../../types/firebase'
import type { AppDirectoryEntry } from '../../../models/utils/directory'
import { asTrimmedString } from '../../../server/utils/projection/normalize.ts'
import type { AppDetail } from '../../models/app-directory.model.ts'

const APP_STATUSES = new Set<App['status']>([
  'active',
  'inactive',
  'archived',
])

const APP_ROLES = new Set<App['role']>(['global', 'tenant', 'standalone'])

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

function asAppStatus(value: unknown): App['status'] | '' {
  const status = asTrimmedString(value) as App['status']
  return APP_STATUSES.has(status) ? status : ''
}

function asAppRole(value: unknown): App['role'] | '' {
  const role = asTrimmedString(value) as App['role']
  return APP_ROLES.has(role) ? role : ''
}

function asTimestamp(value: unknown): FirebaseTimestamp | null {
  if (!value && value !== 0) return null

  const record = asRecord(value)
  const seconds = Number(record.seconds ?? record._seconds)
  const nanoseconds = Number(record.nanoseconds ?? record._nanoseconds ?? 0)

  if (Number.isFinite(seconds) && Number.isFinite(nanoseconds)) {
    return {
      seconds: Math.trunc(seconds),
      nanoseconds: Math.min(999_999_999, Math.max(0, Math.trunc(nanoseconds))),
    }
  }

  const date =
    value instanceof Date
      ? value
      : typeof (value as any)?.toDate === 'function'
        ? (value as any).toDate()
        : typeof value === 'string' || typeof value === 'number'
          ? new Date(value)
          : null

  if (!(date instanceof Date) || !Number.isFinite(date.getTime())) return null

  const milliseconds = date.getTime()
  const wholeSeconds = Math.floor(milliseconds / 1000)
  return {
    seconds: wholeSeconds,
    nanoseconds: Math.trunc((milliseconds - wholeSeconds * 1000) * 1_000_000),
  }
}

function projectSocialLinks(value: unknown): AppSocialLinks {
  const source = asRecord(value)
  return {
    website: asTrimmedString(source.website),
    twitter: asTrimmedString(source.twitter),
    github: asTrimmedString(source.github),
    linkedin: asTrimmedString(source.linkedin),
    instagram: asTrimmedString(source.instagram),
    facebook: asTrimmedString(source.facebook),
    youtube: asTrimmedString(source.youtube),
    email: asTrimmedString(source.email),
  }
}

/** Pure, explicit App Detail view from a stored App document. */
export function projectAppDetail(
  raw: unknown,
  options: { id: string }
): AppDetail | null {
  const id = asTrimmedString(options.id)
  if (!id) return null

  const source = asRecord(raw)
  const media = asRecord(source.media)
  const created = asRecord(source.created)
  const createdAt = asTimestamp(created.at)

  return {
    id,
    project_id: asTrimmedString(source.project_id),
    ecosystem_id: asTrimmedString(source.ecosystem_id),
    slug: asTrimmedString(source.slug),
    status: asAppStatus(source.status),
    name: asTrimmedString(source.name),
    short_name: asTrimmedString(source.short_name),
    role: asAppRole(source.role),
    tagline: asTrimmedString(source.tagline),
    description: asTrimmedString(source.description),
    short_bio: asTrimmedString(source.short_bio),
    long_bio: asTrimmedString(source.long_bio),
    social_links: projectSocialLinks(source.social_links),
    media: {
      thumbnail_url: asTrimmedString(media.thumbnail_url),
      logo_url: asTrimmedString(media.logo_url),
      wordmark_light_url: asTrimmedString(media.wordmark_light_url),
      wordmark_dark_url: asTrimmedString(media.wordmark_dark_url),
      cover_url: asTrimmedString(media.cover_url),
    },
    ...(createdAt
      ? {
          created: {
            at: createdAt,
          },
        }
      : {}),
  }
}

export function toAppDirectoryEntry(app: AppDetail): AppDirectoryEntry {
  const slug = app.id

  return {
    id: app.id,
    project_id: app.project_id,
    ecosystem_id: app.ecosystem_id,
    slug,
    status: app.status || 'inactive',
    name: app.name,
    short_name: app.short_name,
    role: app.role,
    tagline: app.tagline,
    description: app.description,
    short_bio: app.short_bio,
    detail_url: `/apps/${encodeURIComponent(slug)}`,
    media: {
      logo_url: app.media.logo_url,
      thumbnail_url: app.media.thumbnail_url,
      wordmark_light_url: app.media.wordmark_light_url,
      wordmark_dark_url: app.media.wordmark_dark_url,
      cover_url: app.media.cover_url,
    },
  }
}
