import type { EcosystemDirectoryEntry } from '../../../models/utils/directory.ts'
import type {
  Ecosystem,
  EcosystemStatus,
} from '../../models/ecosystem.model.ts'

const ECOSYSTEM_STATUSES = new Set<EcosystemStatus>([
  'draft',
  'active',
  'paused',
  'archived',
])

const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

export function projectEcosystemDirectoryEntry(
  raw: unknown,
  options: { id: string; appCount: number }
): EcosystemDirectoryEntry | null {
  const source = record(raw)
  const id = text(options.id)
  const name = text(source.name)
  const status = text(source.status) as EcosystemStatus
  if (!id || !name || !ECOSYSTEM_STATUSES.has(status)) return null

  return {
    id,
    status,
    name,
    description: text(source.description),
    image_url: text(source.image_url),
    website_url: text(source.website_url),
    detail_url: `/ecosystems/${encodeURIComponent(id)}`,
    app_count: Math.max(0, Math.trunc(options.appCount)),
  }
}

export function toEcosystemDirectoryEntry(
  ecosystem: Ecosystem,
  appCount: number
): EcosystemDirectoryEntry {
  return {
    id: ecosystem.id,
    status: ecosystem.status,
    name: ecosystem.name,
    description: ecosystem.description,
    image_url: ecosystem.image_url,
    website_url: ecosystem.website_url,
    detail_url: `/ecosystems/${encodeURIComponent(ecosystem.id)}`,
    app_count: Math.max(0, Math.trunc(appCount)),
  }
}
