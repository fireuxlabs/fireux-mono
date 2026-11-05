import { readFireuxEntityManagement } from 'fireux-core/runtime/app/utils/entity-management'
import { isFirestoreDocumentId } from 'fireux-core/runtime/utils/firestore-document-id'
import type { Business } from '../models/business.model.ts'

const record = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null

const hasExactKeys = (value: Record<string, unknown>, keys: string[]) => {
  const actual = Object.keys(value).sort()
  const expected = [...keys].sort()
  return (
    actual.length === expected.length &&
    actual.every((key, index) => key === expected[index])
  )
}

const isTimestampLike = (value: unknown) => {
  const timestamp = record(value)
  if (!timestamp) return false
  if (typeof timestamp.toMillis === 'function') {
    try {
      return Number.isFinite(timestamp.toMillis())
    } catch {
      return false
    }
  }
  return (
    typeof timestamp.seconds === 'number' &&
    Number.isInteger(timestamp.seconds) &&
    typeof timestamp.nanoseconds === 'number' &&
    Number.isInteger(timestamp.nanoseconds) &&
    timestamp.nanoseconds >= 0 &&
    timestamp.nanoseconds < 1_000_000_000
  )
}

const isCanonicalStamp = (value: unknown) => {
  const stamp = record(value)
  return Boolean(
    stamp &&
    Object.keys(stamp).every((key) => ['at', 'by', 'app_id'].includes(key)) &&
    isTimestampLike(stamp.at)
  )
}

/**
 * Validate the independent Business root. Location records retain their own authority.
 */
export function normalizeBusiness(
  id: string,
  value: unknown
): Business | null {
  const business = record(value)
  if (
    !isFirestoreDocumentId(id) ||
    !business ||
    !hasExactKeys(business, ['name', 'description', 'email', 'phone', 'website', 'place_ids', 'management', 'created', 'updated']) ||
    typeof business.name !== 'string' || !business.name.trim() || business.name.length > 120 ||
    !['description', 'email', 'phone', 'website'].every((key) => typeof business[key] === 'string') ||
    !Array.isArray(business.place_ids) || business.place_ids.length > 20 ||
    !business.place_ids.every((id) => typeof id === 'string' && isFirestoreDocumentId(id)) ||
    new Set(business.place_ids).size !== business.place_ids.length ||
    !readFireuxEntityManagement(business.management) ||
    !isCanonicalStamp(business.created) ||
    !isCanonicalStamp(business.updated)
  ) {
    return null
  }

  return {
    id,
    name: business.name as string,
    description: business.description as string,
    email: business.email as string,
    phone: business.phone as string,
    website: business.website as string,
    place_ids: business.place_ids as string[],
    management: readFireuxEntityManagement(business.management)!,
    created: business.created as Business['created'],
    updated: business.updated as Business['updated'],
  }
}
