import { createError } from 'h3'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalize-slug'

export type MemberRole = 'admin' | 'user' | 'dev'

export type PortfolioDraft = {
  name: string
  tagline: string
  imageUrl: string
  slug: string
  ownerLabel: string
  status: 'active' | 'archived'
  strategyLabel: string
  regionLabel: string
  notes: string
}

export type PortfolioOnboardingCompleteResult = {
  ok: true
  portfolio_id: string
  created_root: boolean
  created_team_member: boolean
}

export const text = (value: unknown) => String(value ?? '').trim()

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value)

export const record = (value: unknown): Record<string, unknown> =>
  isRecord(value) ? value : {}

export function fail(statusCode: number, statusMessage: string): never {
  throw createError({ statusCode, statusMessage })
}

export function request(
  value: unknown,
  allowed: readonly string[],
  label: string
) {
  if (!isRecord(value)) fail(400, `${label} must be an object.`)

  const supported = new Set(allowed)
  const unsupported = Object.keys(value).find((key) => !supported.has(key))
  if (unsupported) {
    fail(400, `${label} contains unsupported field: ${unsupported}.`)
  }
  return value
}

export function boundedText(
  value: unknown,
  maxLength: number,
  label: string,
  required = false
) {
  if (value !== undefined && typeof value !== 'string') fail(400, `${label} must be a string.`)
  const resolved = text(value)
  if (required && !resolved) fail(400, `${label} is required.`)
  if (resolved.length > maxLength) fail(400, `${label} is too long.`)
  return resolved
}

export function portfolioDraft(value: unknown): PortfolioDraft {
  const root = request(value, ['identity'], 'Portfolio input')
  const source = request(
    root.identity,
    [
      'name',
      'tagline',
      'image_url',
      'slug',
      'owner_label',
      'status',
      'strategy_label',
      'region_label',
      'notes',
    ],
    'Portfolio input'
  )
  const name = boundedText(source.name, 160, 'Portfolio name', true)
  const slug = normalizeSlug(
    boundedText(source.slug, 240, 'Portfolio slug') || name
  )
  if (!slug) fail(400, 'Portfolio slug is required.')
  requireFirestoreDocumentId(slug, 'Portfolio id')

  if (source.status !== undefined && typeof source.status !== 'string') fail(400, 'Portfolio status must be a string.')
  const status = text(source.status) || 'active'
  if (status !== 'active' && status !== 'archived') {
    fail(400, 'Portfolio status is invalid.')
  }

  return {
    name,
    tagline: boundedText(source.tagline, 240, 'Portfolio tagline'),
    imageUrl: boundedText(source.image_url, 2048, 'Portfolio image URL'),
    slug,
    ownerLabel: boundedText(source.owner_label, 160, 'Portfolio owner label'),
    status,
    strategyLabel: boundedText(
      source.strategy_label,
      160,
      'Portfolio strategy label'
    ),
    regionLabel: boundedText(
      source.region_label,
      160,
      'Portfolio region label'
    ),
    notes: boundedText(source.notes, 4000, 'Portfolio notes'),
  }
}
