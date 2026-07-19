import type { EcosystemStatus } from '../../../models/system/ecosystem.model'
import type { EcosystemDirectoryEntry } from '../../../models/core/supporting/directory'
import { asTrimmedString } from './public-dto.helpers'

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
  const slug = asTrimmedString(source.slug) || id
  if (!id || !slug) return null

  return {
    id,
    slug,
    status: asStatus(source.status),
    name: asTrimmedString(source.name) || id,
    description: asTrimmedString(source.description),
    image_url: asTrimmedString(source.image_url),
    // Narrow legacy adapter: old canonical rows used source_url.
    website_url:
      asTrimmedString(source.website_url) || asTrimmedString(source.source_url),
    detail_url: `/ecosystems/${encodeURIComponent(slug)}`,
    app_count: Math.max(0, Math.trunc(Number(options.appCount) || 0)),
  }
}
