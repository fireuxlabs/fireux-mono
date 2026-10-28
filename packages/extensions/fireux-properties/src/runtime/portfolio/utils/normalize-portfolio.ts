import { readFireuxEntityManagement } from 'fireux-core/runtime/app/utils/entity-management'
import { isFirestoreDocumentId } from 'fireux-core/runtime/utils/firestore-document-id'
import type { Portfolio } from '../models/portfolio.model.ts'

const record = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown> : null
const onlyKeys = (value: Record<string, unknown>, keys: readonly string[]) =>
  Object.keys(value).every(key => keys.includes(key))
const limits = {
  name: 160, tagline: 240, image_url: 2048, slug: 240, owner_label: 160,
  strategy_label: 160, region_label: 160, notes: 4000,
} as const
const stamp = (value: unknown, keys: string[]) => {
  const source = record(value)
  return Boolean(source && onlyKeys(source, keys) && record(source.at) &&
    ['by', 'app_id'].every(key => source[key] === undefined || typeof source[key] === 'string'))
}

export function normalizePortfolio(idValue: unknown, value: unknown): Portfolio | null {
  if (typeof idValue !== 'string' || !isFirestoreDocumentId(idValue)) return null
  const id = idValue.trim(), source = record(value), identity = record(source?.identity)
  const management = readFireuxEntityManagement(source?.management)
  if (!source || !onlyKeys(source, ['context','id','management','identity','created','updated']) ||
      (source.id !== undefined && source.id !== id) || !management || !identity ||
      !onlyKeys(identity, [...Object.keys(limits), 'status']) ||
      Object.entries(limits).some(([key, limit]) => typeof identity[key] !== 'string' ||
        (identity[key] as string).length > limit) ||
      !(identity.name as string).trim() || (identity.slug as string).trim() !== id ||
      !['active','archived'].includes(identity.status as string) ||
      !stamp(source.created, ['at','by','app_id']) || !stamp(source.updated, ['at','by'])) return null
  if (source.context !== undefined && (typeof source.context !== 'string' || source.context.length > 32000)) return null
  return {
    ...(typeof source.context === 'string' ? { context: source.context } : {}),
    id, management,
    identity: {
      name: (identity.name as string).trim(), tagline: (identity.tagline as string).trim(),
      image_url: (identity.image_url as string).trim(), slug: id,
      owner_label: (identity.owner_label as string).trim(), status: identity.status as Portfolio['identity']['status'],
      strategy_label: (identity.strategy_label as string).trim(), region_label: (identity.region_label as string).trim(),
      notes: (identity.notes as string).trim(),
    },
    created: source.created as Portfolio['created'], updated: source.updated as Portfolio['updated'],
  }
}
