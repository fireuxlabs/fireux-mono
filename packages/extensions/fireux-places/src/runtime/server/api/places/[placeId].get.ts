// Concurrent edit — 2026-07-21 14:41 CEST — Place public projection: exact-load one Place without caching negative materialization races.
import {
  createError,
  defineEventHandler,
  getRouterParam,
  setResponseHeaders,
} from 'h3'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path.ts'
import type { PublicPlaceDetailResponse } from '../../../models/place-public.model'
import { PlaceStorage } from '../../../models/place.model'
import { projectPublicPlace } from '../../place/public-projection'

export default defineEventHandler(async (event): Promise<PublicPlaceDetailResponse> => {
  const locator = requireFirestoreDocumentId(getRouterParam(event, 'placeId'), 'Place id')
  const db = getRuntimeFirestore()
  const exact = await db.collection(PlaceStorage.collection).doc(locator).get().catch(() => {
    throw createError({ statusCode: 503, statusMessage: 'Place could not be read.' })
  })
  if (exact.exists) {
    const item = projectPublicPlace(exact.id, exact.data() || {})
    if (item) return success(event, item)
    throw createError({ statusCode: 404, statusMessage: 'Place not found.' })
  }

  const bySlug = await db
    .collection(PlaceStorage.collection)
    .where('slug', '==', locator.toLowerCase())
    .limit(2)
    .get()
    .catch(() => {
      throw createError({ statusCode: 503, statusMessage: 'Place could not be read.' })
    })
  const item = bySlug.size === 1
    ? projectPublicPlace(bySlug.docs[0].id, bySlug.docs[0].data() || {})
    : null
  if (!item) throw createError({ statusCode: 404, statusMessage: 'Place not found.' })
  return success(event, item)
})

function success(
  event: Parameters<typeof setResponseHeaders>[0],
  item: PublicPlaceDetailResponse['item']
): PublicPlaceDetailResponse {
  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=900',
  })
  return { item }
}
