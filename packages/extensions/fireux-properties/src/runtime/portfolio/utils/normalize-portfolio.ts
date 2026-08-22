import { readFireuxEntityManagement } from 'fireux-core/runtime/utils/entity-management'
import type { Portfolio, PortfolioUpdateInput } from '../models/portfolio.model.ts'

const record = (value: unknown): Record<string, any> | null =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, any>)
    : null
const text = (value: unknown) => String(value ?? '').trim()

export function normalizePortfolio(idValue: unknown, value: unknown): Portfolio | null {
  const id = text(idValue)
  const source = record(value)
  const management = readFireuxEntityManagement(source?.management)
  const slug = text(source?.slug)
  const created = record(source?.created)
  const updated = record(source?.updated)
  if (!id || !source || !management || !text(source.name) || slug !== id || !created || !updated) return null
  return {
    id,
    management,
    name: text(source.name),
    tagline: text(source.tagline),
    image_url: text(source.image_url),
    slug,
    owner_label: text(source.owner_label),
    status: source.status === 'archived' ? 'archived' : 'active',
    strategy_label: text(source.strategy_label),
    region_label: text(source.region_label),
    notes: text(source.notes),
    created: created as Portfolio['created'],
    updated: updated as Portfolio['updated'],
  }
}

const UPDATE_FIELDS = [
  'name', 'tagline', 'image_url', 'slug', 'owner_label', 'status',
  'strategy_label', 'region_label', 'notes',
] as const

export function normalizePortfolioUpdate(value: unknown): PortfolioUpdateInput {
  const source = record(value)
  if (!source) return {}
  return Object.fromEntries(
    UPDATE_FIELDS.filter(field => field in source).map(field => [field, source[field]])
  ) as PortfolioUpdateInput
}
