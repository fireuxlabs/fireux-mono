import { normalizePlace } from 'fireux-places/runtime/place/utils/normalize-place'
import { PlaceStorage } from 'fireux-places/runtime/place/models/place.model'
import { createError } from 'h3'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import type {
  CompanyDetail,
  CompanyDirectoryEntry,
} from '../../models/company-directory.model.ts'
import { CompanyStorage } from '../../models/company.model.ts'
import { canonicalCompanyRole } from './canonical'

export function projectCompanyDirectoryEntry(
  id: string,
  companyValue: Record<string, unknown>,
  placeValue: Record<string, unknown>
): CompanyDirectoryEntry | null {
  if (!canonicalCompanyRole(id, companyValue)) return null
  const place = normalizePlace(id, placeValue)
  return place
}

export function projectCompanyDetail(
  id: string,
  companyValue: Record<string, unknown>,
  placeValue: Record<string, unknown>
): CompanyDetail | null {
  if (!canonicalCompanyRole(id, companyValue)) return null
  return normalizePlace(id, placeValue)
}

export async function readCompanyDetail(
  idValue: unknown
): Promise<CompanyDetail> {
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
      ? projectCompanyDetail(id, company.data() || {}, place.data() || {})
      : null
  if (!item) {
    throw createError({ statusCode: 404, statusMessage: 'Company not found.' })
  }
  return item
}
