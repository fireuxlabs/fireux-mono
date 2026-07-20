// @fireux-script
// last_used: 2026-07-20
// usage_note: pure App/Ecosystem directory projection and reconciliation classification helpers.
// Concurrent edit — 2026-07-19 17:08 CEST — Directory Authority Cutover: parity-safe projection and derived-count classification.
// Concurrent edit — 2026-07-20 11:26 CEST — Directory Live Provisioning Pass: record live precondition classification use.

import { createHash } from 'node:crypto'
import { isDeepStrictEqual } from 'node:util'

export const PLATFORM_DIRECTORY_RECONCILIATION_VERSION =
  'platform-directory-reconciliation/v1'

export const DIRECTORY_RECONCILIATION_CLASSIFICATIONS = [
  'MATCHED',
  'MISSING_PLATFORM',
  'MISSING_OWNER',
  'PUBLIC_DRIFT',
  'DERIVED_COUNT_DRIFT',
  'RELATION_DRIFT',
  'OWNER_ID_UNRESOLVED',
  'ORPHAN_PLATFORM',
  'ORPHAN_OWNER',
  'INACTIVE_OWNER',
  'UNREADABLE_OWNER',
  'UNREADABLE_PLATFORM',
  'AMBIGUOUS',
]

const APP_STATUSES = new Set(['draft', 'active', 'paused', 'archived'])
const APP_ROLES = new Set([
  'global',
  'tenant',
  'standalone',
  'ecosystem',
  'system',
])
const ECOSYSTEM_STATUSES = new Set(['draft', 'active', 'paused', 'archived'])

const text = (value) => (typeof value === 'string' ? value.trim() : '')

const record = (value) =>
  value && typeof value === 'object' && !Array.isArray(value) ? value : {}

const nonNegativeInteger = (value) => {
  const number = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(number) ? Math.max(0, Math.trunc(number)) : 0
}

const appStatus = (value) => {
  const status = text(value)
  return APP_STATUSES.has(status) ? status : 'draft'
}

const appRole = (value) => {
  const role = text(value)
  return APP_ROLES.has(role) ? role : ''
}

const ecosystemStatus = (value) => {
  const status = text(value)
  return ECOSYSTEM_STATUSES.has(status) ? status : 'draft'
}

export function projectAppDirectoryEntry(raw, idValue) {
  const id = text(idValue)
  if (!id) return null

  const source = record(raw)
  const media = record(source.media)
  const derived = record(source.derived)
  const slug = text(source.slug) || id

  return {
    id,
    ecosystem_id: text(source.ecosystem_id),
    slug,
    status: appStatus(source.status),
    app_name: text(source.app_name),
    app_short_name: text(source.app_short_name),
    role: appRole(source.role),
    tagline: text(source.tagline),
    description: text(source.description),
    short_bio: text(source.short_bio),
    detail_url: `/apps/${encodeURIComponent(slug)}`,
    derived: {
      user_count: nonNegativeInteger(derived.user_count),
    },
    media: {
      logo_url: text(media.logo_url),
      thumbnail_url: text(media.thumbnail_url),
      wordmark_light_url: text(media.wordmark_light_url),
      wordmark_dark_url: text(media.wordmark_dark_url),
      cover_url: text(media.cover_url),
    },
  }
}

export function projectEcosystemDirectoryEntry(raw, idValue, appCount = 0) {
  const id = text(idValue)
  if (!id) return null

  const source = record(raw)
  const slug = text(source.slug) || id

  return {
    id,
    slug,
    status: ecosystemStatus(source.status),
    name: text(source.name) || id,
    description: text(source.description),
    image_url: text(source.image_url),
    website_url: text(source.website_url) || text(source.source_url),
    detail_url: `/ecosystems/${encodeURIComponent(slug)}`,
    app_count: nonNegativeInteger(appCount),
  }
}

export function appRelationIssues(raw, expected) {
  if (!raw) return []
  const source = record(raw)
  const issues = []
  const projectId = text(source.project_id)
  const ecosystemId = text(source.ecosystem_id)

  if (projectId !== text(expected.projectId)) {
    issues.push('project_id')
  }

  if (ecosystemId !== text(expected.ecosystemId)) {
    issues.push('ecosystem_id')
  }

  return issues
}

export function ecosystemRelationIssues(raw, expected) {
  if (!raw) return []
  return text(record(raw).project_id) === text(expected.projectId)
    ? []
    : ['project_id']
}

export function extractPlatformAppMetadata(raw) {
  const repo = record(record(raw).fireux_repo)
  const launchOrder = Number(repo.launch_order)

  return {
    launch_order: Number.isFinite(launchOrder) ? launchOrder : 0,
  }
}

function collectDiffs(owner, platform, prefix = '') {
  if (isDeepStrictEqual(owner, platform)) return []

  const ownerRecord = record(owner)
  const platformRecord = record(platform)
  const keys = new Set([
    ...Object.keys(ownerRecord),
    ...Object.keys(platformRecord),
  ])

  if (!keys.size) {
    return [prefix || '$']
  }

  return [...keys]
    .sort()
    .flatMap((key) => {
      const ownerValue = ownerRecord[key]
      const platformValue = platformRecord[key]
      const path = prefix ? `${prefix}.${key}` : key

      if (
        ownerValue &&
        platformValue &&
        typeof ownerValue === 'object' &&
        typeof platformValue === 'object' &&
        !Array.isArray(ownerValue) &&
        !Array.isArray(platformValue)
      ) {
        return collectDiffs(ownerValue, platformValue, path)
      }

      return isDeepStrictEqual(ownerValue, platformValue) ? [] : [path]
    })
}

export function publicFieldDiffs(owner, platform) {
  if (!owner || !platform) return []
  return collectDiffs(owner, platform)
}

export function publicProjectionHash(value) {
  if (!value) return ''
  return createHash('sha256')
    .update(JSON.stringify(value))
    .digest('hex')
}

export function classifyExpectedDirectoryRecord(options) {
  if (options.ownerReadable === false) return 'UNREADABLE_OWNER'
  if (options.platformReadable === false) return 'UNREADABLE_PLATFORM'
  if (!options.owner && !options.platform) return 'MISSING_OWNER'
  if (!options.owner) return 'MISSING_OWNER'
  if (!options.platform) return 'MISSING_PLATFORM'
  if (options.relationIssues?.length) return 'RELATION_DRIFT'
  if (text(options.ownerStatus) !== 'active') return 'INACTIVE_OWNER'
  if (options.derivedCountIssues?.length) return 'DERIVED_COUNT_DRIFT'
  if (options.publicDiffs?.length) return 'PUBLIC_DRIFT'
  return 'MATCHED'
}

export function summarizeDirectoryRows(rows) {
  const summary = Object.fromEntries(
    DIRECTORY_RECONCILIATION_CLASSIFICATIONS.map((classification) => [
      classification,
      0,
    ])
  )

  for (const row of rows) {
    const classification = text(row?.classification)
    if (classification in summary) summary[classification] += 1
  }

  return summary
}
