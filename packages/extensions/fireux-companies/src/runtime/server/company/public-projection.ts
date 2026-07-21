// Concurrent edit — 2026-07-21 14:30 CEST — Company public projection: require an exact canonical Company root before joining its same-id Place.
// Concurrent edit — 2026-07-21 15:05 CEST — Place provenance/privacy hardening: require a valid same-id pair and explicitly copy only card-safe Place reference fields.
import { isFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path.ts'
import { projectPublicPlace } from 'fireux-places/runtime/server/place/public-projection'
import type { PublicCompanyProjection } from '../../models/company-public.model'

const record = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null

const hasExactKeys = (value: Record<string, unknown>, keys: string[]) => {
  const actual = Object.keys(value).sort()
  const expected = [...keys].sort()
  return actual.length === expected.length && actual.every((key, index) => key === expected[index])
}

const isTimestampLike = (value: unknown) => {
  const stamp = record(value)
  if (!stamp) return false
  if (typeof stamp.toMillis === 'function') {
    try {
      return Number.isFinite(stamp.toMillis())
    } catch {
      return false
    }
  }
  return (
    typeof stamp.seconds === 'number' &&
    Number.isInteger(stamp.seconds) &&
    typeof stamp.nanoseconds === 'number' &&
    Number.isInteger(stamp.nanoseconds) &&
    stamp.nanoseconds >= 0 &&
    stamp.nanoseconds < 1_000_000_000
  )
}

const isCanonicalStamp = (value: unknown) => {
  const stamp = record(value)
  return Boolean(stamp && hasExactKeys(stamp, ['at']) && isTimestampLike(stamp.at))
}

export function projectPublicCompany(
  id: string,
  companyValue: Record<string, unknown>,
  placeValue: Record<string, unknown>
): PublicCompanyProjection | null {
  if (
    !isFirestoreDocumentId(id) ||
    !hasExactKeys(companyValue, ['created', 'updated']) ||
    !isCanonicalStamp(companyValue.created) ||
    !isCanonicalStamp(companyValue.updated)
  ) {
    return null
  }

  const place = projectPublicPlace(id, placeValue)
  if (!place) return null

  return {
    id: place.id,
    name: place.name,
    place_type: place.place_type,
    ...(place.short_name ? { short_name: place.short_name } : {}),
    ...(place.brand_tagline ? { brand_tagline: place.brand_tagline } : {}),
    ...(place.short_address ? { short_address: place.short_address } : {}),
    ...(place.image_url ? { image_url: place.image_url } : {}),
    ...(place.image_shade ? { image_shade: place.image_shade } : {}),
    ...(place.verified ? { verified: true } : {}),
    ...(place.slug ? { slug: place.slug } : {}),
  }
}
