import { FieldPath } from 'firebase-admin/firestore'
import { createError } from 'h3'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { isFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { PlaceStorage } from 'fireux-places/runtime/place/models/place.model'
import {
  COMPANY_DIRECTORY_MAX_PAGE_SIZE,
  COMPANY_DIRECTORY_MAX_SCAN_SIZE,
  COMPANY_DIRECTORY_PAGE_SIZE,
  COMPANY_DIRECTORY_SCAN_BATCH_SIZE,
  type CompanyDirectoryPage,
} from '../../models/company-directory.model.ts'
import { CompanyStorage } from '../../models/company.model.ts'
import { projectCompanyDirectoryEntry } from './projection'

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
  const items: CompanyDirectoryPage['items'] = []
  let afterId = cursor
  let scanned = 0
  let exhausted = false
  let nextCursor = ''

  while (
    items.length < limit &&
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

    const companies = await companiesQuery.get().catch(() => {
      throw createError({
        statusCode: 503,
        statusMessage: 'Company directory could not be read.',
      })
    })
    if (companies.empty) break

    const places = await db
      .getAll(
        ...companies.docs.map((document) =>
          db.collection(PlaceStorage.collection).doc(document.id)
        )
      )
      .catch(() => {
        throw createError({
          statusCode: 503,
          statusMessage: 'Company locations could not be read.',
        })
      })
    const placesById = new Map(
      places.map((document) => [document.id, document])
    )

    for (const [index, company] of companies.docs.entries()) {
      scanned += 1
      afterId = company.id
      const place = placesById.get(company.id)
      const item = place?.exists
        ? projectCompanyDirectoryEntry(
            company.id,
            company.data() || {},
            place.data() || {}
          )
        : null
      if (item) items.push(item)

      if (items.length >= limit) {
        if (
          index < companies.docs.length - 1 ||
          companies.docs.length === scanLimit
        ) {
          nextCursor = encodeCursor(afterId)
        } else {
          exhausted = true
        }
        break
      }
    }

    if (items.length >= limit) break
    if (companies.docs.length < scanLimit) exhausted = true
  }

  return {
    items,
    ...(!exhausted && items.length >= limit && nextCursor
      ? { nextCursor }
      : {}),
  }
}
