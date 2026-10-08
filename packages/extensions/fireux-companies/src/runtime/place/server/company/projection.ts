import type { DocumentSnapshot } from 'firebase-admin/firestore'
import { normalizePlace } from 'fireux-places/runtime/place/utils/normalize-place'
import { createError } from 'h3'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import type { CompanyDetailResponse } from '../../models/company-collection.model.ts'
import { CompanyStorage } from '../../models/company.entity.ts'
import { canonicalCompanyRole } from './canonical'

export function projectCompany(
  id: string,
  companyValue: Record<string, unknown>
) {
  return canonicalCompanyRole(id, companyValue)
}

export async function readCompanyDetail(
  idValue: unknown
): Promise<CompanyDetailResponse> {
  const id = requireFirestoreDocumentId(idValue, 'Company id')
  const db = getRuntimeFirestore()
  const [company, place] = (await db
    .getAll(
      db.collection(CompanyStorage.collection).doc(id),
      db.collection('places').doc(id)
    )
    .catch(() => {
      throw createError({
        statusCode: 503,
        statusMessage: 'Company could not be read.',
      })
    })) as [DocumentSnapshot, DocumentSnapshot]
  const companyRecord =
    company.exists && place.exists
      ? projectCompany(id, company.data() || {})
      : null
  const placeRecord = place.exists
    ? normalizePlace(id, place.data() || {})
    : null
  if (!companyRecord || !placeRecord) {
    throw createError({ statusCode: 404, statusMessage: 'Company not found.' })
  }
  return { company: companyRecord, place: placeRecord }
}
