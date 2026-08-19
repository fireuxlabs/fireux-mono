// Concurrent edit — 2026-07-21 14:30 CEST — Company public projection: require an exact canonical Company root before joining its same-id Place.
// Concurrent edit — 2026-07-21 15:05 CEST — Place provenance/privacy hardening: require a valid same-id pair and explicitly copy only card-safe Place reference fields.
// Concurrent edit — 2026-07-21 15:21 CEST — Misebox Nitro startup fix: resolve the Places server projection through its explicit TypeScript import.
// Concurrent edit — 2026-07-28 — Entity canon: validate the role marker once and return the canonical Place projection.
import { normalizePlace } from 'fireux-places/runtime/place/utils/normalize-place'
import { PlaceStorage } from 'fireux-places/runtime/place/models/place.model'
import { createError } from 'h3'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import type {
  PublicCompanyDetailProjection,
  PublicCompanyProjection,
} from '../../models/company-public.model.ts'
import { CompanyStorage } from '../../models/company.model.ts'
import { canonicalCompanyRole } from './canonical'

export function projectPublicCompany(
  id: string,
  companyValue: Record<string, unknown>,
  placeValue: Record<string, unknown>
): PublicCompanyProjection | null {
  if (!canonicalCompanyRole(id, companyValue)) return null
  const place = normalizePlace(id, placeValue)
  return place
}

export function projectPublicCompanyDetail(
  id: string,
  companyValue: Record<string, unknown>,
  placeValue: Record<string, unknown>
): PublicCompanyDetailProjection | null {
  if (!canonicalCompanyRole(id, companyValue)) return null
  return normalizePlace(id, placeValue)
}

export async function readPublicCompanyDetail(
  idValue: unknown
): Promise<PublicCompanyDetailProjection> {
  const id = requireFirestoreDocumentId(idValue, 'Company id')
  const db = getRuntimeFirestore()
  const [company, place] = await db
    .getAll(
      db.collection(CompanyStorage.collection).doc(id),
      db.collection(PlaceStorage.collection).doc(id)
    )
    .catch(() => {
      throw createError({
        statusCode: 503,
        statusMessage: 'Company could not be read.',
      })
    })
  const item =
    company.exists && place.exists
      ? projectPublicCompanyDetail(id, company.data() || {}, place.data() || {})
      : null
  if (!item) {
    throw createError({ statusCode: 404, statusMessage: 'Company not found.' })
  }
  return item
}
