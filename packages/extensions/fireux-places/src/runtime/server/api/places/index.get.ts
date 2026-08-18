// Concurrent edit — 2026-07-21 14:28 CEST — Place public projection: expose bounded list, prefix-search, and exact-id batches without raw root reads.
// Concurrent edit — 2026-07-21 15:05 CEST — Place provenance/privacy hardening: page canonical ids only into the coarse public reference projection and emit cursors only for projected ids.
import { FieldPath } from 'firebase-admin/firestore'
import {
  createError,
  defineEventHandler,
  getQuery,
  setResponseHeaders,
} from 'h3'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { isFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import {
  PUBLIC_PLACE_EXACT_MAX_IDS,
  PUBLIC_PLACE_INDEX_MAX_PAGE_SIZE,
  PUBLIC_PLACE_INDEX_MAX_SCAN_SIZE,
  PUBLIC_PLACE_INDEX_PAGE_SIZE,
  PUBLIC_PLACE_INDEX_SCAN_BATCH_SIZE,
  type PublicPlaceIndexPage,
} from '../../../place/models/place-public.model.ts'
import { PlaceStorage } from '../../../place/models/place.model.ts'
import { projectPublicPlace } from '../../../place/server/identity/public-projection'

const text = (value: unknown) => typeof value === 'string' ? value.trim() : ''
const encodeCursor = (value: string) => Buffer.from(value, 'utf8').toString('base64url')

const pageSize = (value: unknown) => {
  const size = Number(value)
  return Number.isInteger(size) && size > 0
    ? Math.min(size, PUBLIC_PLACE_INDEX_MAX_PAGE_SIZE)
    : PUBLIC_PLACE_INDEX_PAGE_SIZE
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

const normalizedSearch = (value: unknown) => text(value)
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')

const requestedIds = (value: unknown) => {
  const raw = text(value)
  if (!raw) return []
  const ids = Array.from(new Set(raw.split(',').map(id => id.trim()).filter(Boolean)))
  if (
    ids.length > PUBLIC_PLACE_EXACT_MAX_IDS ||
    ids.some(id => !isFirestoreDocumentId(id))
  ) {
    throw createError({ statusCode: 400, statusMessage: 'Place ids are invalid.' })
  }
  return ids
}

export default defineEventHandler(async (event): Promise<PublicPlaceIndexPage> => {
  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=900',
  })

  const query = getQuery(event)
  const q = normalizedSearch(query.q)
  const ids = requestedIds(query.ids)
  const requestedCursor = text(query.cursor)
  if ((q && ids.length) || ((q || ids.length) && requestedCursor)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Place query modes cannot be combined.',
    })
  }

  const db = getRuntimeFirestore()
  if (ids.length) {
    const snapshots = await db.getAll(
      ...ids.map(id => db.collection(PlaceStorage.collection).doc(id))
    ).catch(() => {
      throw createError({ statusCode: 503, statusMessage: 'Places could not be read.' })
    })
    const byId = new Map(
      snapshots.map(snapshot => [
        snapshot.id,
        snapshot.exists
          ? projectPublicPlace(snapshot.id, snapshot.data() || {})
          : null,
      ])
    )
    return {
      items: ids
        .map(id => byId.get(id) ?? null)
        .filter((item): item is NonNullable<typeof item> => Boolean(item)),
    }
  }

  if (q) {
    if (q.length > 200) {
      throw createError({ statusCode: 400, statusMessage: 'Place search is too long.' })
    }
    const snapshot = await db
      .collection(PlaceStorage.collection)
      .where('search_term', '>=', q)
      .where('search_term', '<=', `${q}\uf8ff`)
      .orderBy('search_term')
      .limit(10)
      .get()
      .catch(() => {
        throw createError({ statusCode: 503, statusMessage: 'Place search failed.' })
      })
    return {
      items: snapshot.docs
        .map(document => projectPublicPlace(document.id, document.data() || {}))
        .filter((item): item is NonNullable<typeof item> => Boolean(item))
        .slice(0, 5),
    }
  }

  const limit = pageSize(query.limit)
  const cursor = decodeCursor(requestedCursor)
  if (requestedCursor && !cursor) {
    throw createError({ statusCode: 400, statusMessage: 'Place cursor is invalid.' })
  }

  const items: PublicPlaceIndexPage['items'] = []
  let afterId = cursor
  let scanned = 0
  let exhausted = false
  let nextCursor = ''

  while (items.length < limit && scanned < PUBLIC_PLACE_INDEX_MAX_SCAN_SIZE && !exhausted) {
    const scanLimit = Math.min(
      PUBLIC_PLACE_INDEX_SCAN_BATCH_SIZE,
      PUBLIC_PLACE_INDEX_MAX_SCAN_SIZE - scanned
    )
    let placesQuery = db
      .collection(PlaceStorage.collection)
      .orderBy(FieldPath.documentId())
      .limit(scanLimit)
    if (afterId) placesQuery = placesQuery.startAfter(afterId)

    const snapshot = await placesQuery.get().catch(() => {
      throw createError({ statusCode: 503, statusMessage: 'Place directory could not be read.' })
    })
    if (snapshot.empty) break

    for (const [index, document] of snapshot.docs.entries()) {
      scanned += 1
      afterId = document.id
      const item = projectPublicPlace(document.id, document.data() || {})
      if (item) items.push(item)
      if (items.length >= limit) {
        if (index < snapshot.docs.length - 1 || snapshot.docs.length === scanLimit) {
          nextCursor = encodeCursor(afterId)
        } else {
          exhausted = true
        }
        break
      }
    }

    if (items.length >= limit) break
    if (snapshot.docs.length < scanLimit) exhausted = true
  }

  return {
    items,
    ...(!exhausted && items.length >= limit && nextCursor ? { nextCursor } : {}),
  }
})
