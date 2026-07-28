// Concurrent edit — 2026-07-21 14:30 CEST — Company public projection: require an exact canonical Company root before joining its same-id Place.
// Concurrent edit — 2026-07-21 15:05 CEST — Place provenance/privacy hardening: require a valid same-id pair and explicitly copy only card-safe Place reference fields.
// Concurrent edit — 2026-07-21 15:21 CEST — Misebox Nitro startup fix: resolve the Places server projection through its explicit TypeScript import.
// Concurrent edit — 2026-07-28 — Entity canon: validate the role marker once and return the canonical Place projection.
import { projectPublicPlace } from 'fireux-places/runtime/server/place/public-projection.ts'
import type { PublicCompanyProjection } from '../../models/company-public.model'
import { canonicalCompanyRole } from './canonical'

export function projectPublicCompany(
  id: string,
  companyValue: Record<string, unknown>,
  placeValue: Record<string, unknown>
): PublicCompanyProjection | null {
  if (!canonicalCompanyRole(id, companyValue)) return null
  const place = projectPublicPlace(id, placeValue)
  return place
}
