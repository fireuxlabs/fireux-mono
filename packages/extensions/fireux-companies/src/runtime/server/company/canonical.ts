import { isFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path.ts'
import type { Company } from '../../models/company.model'

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
    hasExactKeys(stamp, ['at']) &&
    isTimestampLike(stamp.at)
  )
}

/**
 * Validate the exact stored Company role marker and attach its same-id Place
 * identity for runtime use. Company owns no independent identity payload.
 */
export function canonicalCompanyRole(
  id: string,
  value: unknown
): Company | null {
  const company = record(value)
  if (
    !isFirestoreDocumentId(id) ||
    !company ||
    !hasExactKeys(company, ['created', 'updated']) ||
    !isCanonicalStamp(company.created) ||
    !isCanonicalStamp(company.updated)
  ) {
    return null
  }

  return {
    id,
    created: company.created as Company['created'],
    updated: company.updated as Company['updated'],
  }
}
