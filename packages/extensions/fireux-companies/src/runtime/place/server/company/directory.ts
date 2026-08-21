import { FieldPath } from 'firebase-admin/firestore'
import { createError } from 'h3'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { isFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import {
  COMPANY_DIRECTORY_MAX_PAGE_SIZE,
  COMPANY_DIRECTORY_MAX_SCAN_SIZE,
  COMPANY_DIRECTORY_PAGE_SIZE,
  COMPANY_DIRECTORY_SCAN_BATCH_SIZE,
  type CompanyDirectoryPage,
} from '../../models/company-directory.model.ts'
import { CompanyStorage } from '../../models/company.entity.ts'
import { canonicalCompanyRole } from './canonical'
import { normalizePlace } from 'fireux-places/runtime/place/utils/normalize-place'

const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '')
const encodeCursor = (value: string) =>
  Buffer.from(value, 'utf8').toString('base64url')

const pageSize = (value: unknown) => {
  const size = Number(value)
  return Number.isInteger(size) && size > 0
    ? Math.min(size, COMPANY_DIRECTORY_MAX_PAGE_SIZE)
    : COMPANY_DIRECTORY_PAGE_SIZE
}

const decodeCursor = (value: unknown) => {
  const cursor = text(value)
  if (!cursor || !/^[A-Za-z0-9_-]+$/.test(cursor)) return ''
  try {
    const id = Buffer.from(cursor, 'base64url').toString('utf8')
    return isFirestoreDocumentId(id) && encodeCursor(id) === cursor ? id : ''
  } catch {
    return ''
  }
}

export async function readCompanyDirectoryPage(input: {
  limit?: unknown
  cursor?: unknown
}): Promise<CompanyDirectoryPage> {
  const limit = pageSize(input.limit)
  const requestedCursor = text(input.cursor)
  const cursor = decodeCursor(requestedCursor)
  if (requestedCursor && !cursor) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Company cursor is invalid.',
    })
  }

  const db = getRuntimeFirestore()
  const companies: CompanyDirectoryPage['companies'] = []
  const places: CompanyDirectoryPage['places'] = []
  let afterId = cursor
  let scanned = 0
  let exhausted = false
  let nextCursor = ''

  while (
    companies.length < limit &&
    scanned < COMPANY_DIRECTORY_MAX_SCAN_SIZE &&
    !exhausted
  ) {
    const scanLimit = Math.min(
      COMPANY_DIRECTORY_SCAN_BATCH_SIZE,
      COMPANY_DIRECTORY_MAX_SCAN_SIZE - scanned
    )
    let companiesQuery = db
      .collection(CompanyStorage.collection)
      .orderBy(FieldPath.documentId())
      .limit(scanLimit)
    if (afterId) companiesQuery = companiesQuery.startAfter(afterId)

    const companySnapshot = await companiesQuery.get().catch(() => {
      throw createError({
        statusCode: 503,
        statusMessage: 'Company directory could not be read.',
      })
    })
    if (companySnapshot.empty) break

    const placeSnapshots = await db
      .getAll(
        ...companySnapshot.docs.map((document) =>
          db.collection('places').doc(document.id)
        )
      )
      .catch(() => {
        throw createError({
          statusCode: 503,
          statusMessage: 'Company locations could not be read.',
        })
      })
    const placesById = new Map(
      placeSnapshots.map((document) => [document.id, document])
    )

    for (const [index, company] of companySnapshot.docs.entries()) {
      scanned += 1
      afterId = company.id
      const place = placesById.get(company.id)
      const companyRecord = canonicalCompanyRole(
        company.id,
        company.data() || {}
      )
      const placeRecord = place?.exists
        ? normalizePlace(company.id, place.data() || {})
        : null
      if (companyRecord && placeRecord) {
        companies.push(companyRecord)
        places.push(placeRecord)
      }

      if (companies.length >= limit) {
        if (
          index < companySnapshot.docs.length - 1 ||
          companySnapshot.docs.length === scanLimit
        ) {
          nextCursor = encodeCursor(afterId)
        } else {
          exhausted = true
        }
        break
      }
    }

    if (companies.length >= limit) break
    if (companySnapshot.docs.length < scanLimit) exhausted = true
  }

  return {
    companies,
    places,
    ...(!exhausted && companies.length >= limit && nextCursor
      ? { nextCursor }
      : {}),
  }
}
