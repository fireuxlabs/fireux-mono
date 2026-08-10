import type { EcosystemStatus } from '../../../models/core/ecosystem.model'
import type { EcosystemDirectoryEntry } from '../../../models/utils/directory'
import { asTrimmedString } from './public-dto.helpers'
import type { PublicEcosystemDto } from './public-dto.types'

const ECOSYSTEM_STATUSES = new Set<EcosystemStatus>([
  'draft',
  'active',
  'paused',
  'archived',
])

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

function asStatus(value: unknown): EcosystemStatus {
  const status = asTrimmedString(value) as EcosystemStatus
  return ECOSYSTEM_STATUSES.has(status) ? status : 'draft'
}

export function projectEcosystemDirectoryEntry(
  raw: unknown,
  options: { id: string; appCount: number }
): EcosystemDirectoryEntry | null {
  const source = asRecord(raw)
  const id = asTrimmedString(options.id)
  if (!id) return null
  const ecosystem = projectPublicEcosystem(source, { id })
  if (!ecosystem) return null

  return {
    ...ecosystem,
    detail_url: `/ecosystems/${encodeURIComponent(id)}`,
    app_count: Math.max(0, Math.trunc(Number(options.appCount) || 0)),
  }
}

/** Pure, bounded projection from Ecosystem or EcosystemMeta storage. */
export function projectPublicEcosystem(
  raw: unknown,
  options: { id: string }
): PublicEcosystemDto | null {
  const source = asRecord(raw)
  const id = asTrimmedString(options.id)
  if (!id) return null

  return {
    id,
    status: asStatus(source.status),
    name: asTrimmedString(source.name) || id,
    description: asTrimmedString(source.description),
    assets: {
      image: asTrimmedString(asRecord(source.assets).image),
    },
    website_url: asTrimmedString(source.website_url),
  }
}
