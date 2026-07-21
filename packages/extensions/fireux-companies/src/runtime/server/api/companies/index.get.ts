// Concurrent edit — 2026-07-21 14:30 CEST — Company public projection: expose only bounded complete same-id Company and Place pairs.
// Concurrent edit — 2026-07-21 15:05 CEST — Place provenance/privacy hardening: page canonical Company ids into coarse pairs and emit cursors only for projected ids.
// Concurrent edit — 2026-07-21 15:20 CEST — Misebox Nitro startup fix: resolve the Place model through its explicit TypeScript server import.
import { FieldPath } from 'firebase-admin/firestore'
import {
  createError,
  defineEventHandler,
  getQuery,
  setResponseHeaders,
} from 'h3'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import { isFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path.ts'
import { PlaceStorage } from 'fireux-places/runtime/models/place.model.ts'
import {
  PUBLIC_COMPANY_INDEX_MAX_PAGE_SIZE,
  PUBLIC_COMPANY_INDEX_MAX_SCAN_SIZE,
  PUBLIC_COMPANY_INDEX_PAGE_SIZE,
  PUBLIC_COMPANY_INDEX_SCAN_BATCH_SIZE,
  type PublicCompanyIndexPage,
} from '../../../models/company-public.model'
import { CompanyStorage } from '../../../models/company.model'
import { projectPublicCompany } from '../../company/public-projection'

const text = (value: unknown) => typeof value === 'string' ? value.trim() : ''
const encodeCursor = (value: string) => Buffer.from(value, 'utf8').toString('base64url')

const pageSize = (value: unknown) => {
  const size = Number(value)
  return Number.isInteger(size) && size > 0
    ? Math.min(size, PUBLIC_COMPANY_INDEX_MAX_PAGE_SIZE)
    : PUBLIC_COMPANY_INDEX_PAGE_SIZE
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

export default defineEventHandler(async (event): Promise<PublicCompanyIndexPage> => {
  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=900',
  })

  const query = getQuery(event)
  const limit = pageSize(query.limit)
  const requestedCursor = text(query.cursor)
  const cursor = decodeCursor(requestedCursor)
  if (requestedCursor && !cursor) {
    throw createError({ statusCode: 400, statusMessage: 'Company cursor is invalid.' })
  }

  const db = getRuntimeFirestore()
  const items: PublicCompanyIndexPage['items'] = []
  let afterId = cursor
  let scanned = 0
  let exhausted = false
  let nextCursor = ''

  while (items.length < limit && scanned < PUBLIC_COMPANY_INDEX_MAX_SCAN_SIZE && !exhausted) {
    const scanLimit = Math.min(
      PUBLIC_COMPANY_INDEX_SCAN_BATCH_SIZE,
      PUBLIC_COMPANY_INDEX_MAX_SCAN_SIZE - scanned
    )
    let companiesQuery = db
      .collection(CompanyStorage.collection)
      .orderBy(FieldPath.documentId())
      .limit(scanLimit)
    if (afterId) companiesQuery = companiesQuery.startAfter(afterId)

    const companies = await companiesQuery.get().catch(() => {
      throw createError({ statusCode: 503, statusMessage: 'Company directory could not be read.' })
    })
    if (companies.empty) break

    const places = await db.getAll(
      ...companies.docs.map(document => db.collection(PlaceStorage.collection).doc(document.id))
    ).catch(() => {
      throw createError({ statusCode: 503, statusMessage: 'Company locations could not be read.' })
    })
    const placesById = new Map(places.map(document => [document.id, document]))

    for (const [index, company] of companies.docs.entries()) {
      scanned += 1
      afterId = company.id
      const place = placesById.get(company.id)
      const item = place?.exists
        ? projectPublicCompany(
            company.id,
            company.data() || {},
            place.data() || {}
          )
        : null
      if (item) items.push(item)

      if (items.length >= limit) {
        if (index < companies.docs.length - 1 || companies.docs.length === scanLimit) {
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
    ...(!exhausted && items.length >= limit && nextCursor ? { nextCursor } : {}),
  }
})
