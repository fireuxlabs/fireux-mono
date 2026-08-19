import {
  createError,
  defineEventHandler,
  getRouterParam,
  setResponseHeaders,
} from 'h3'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import type { PlaceDetailResponse } from '../../../place/models/place-read.model.ts'
import { readPlace } from '../../../place/server/identity/read'

export default defineEventHandler(
  async (event): Promise<PlaceDetailResponse> => {
    const locator = requireFirestoreDocumentId(
      getRouterParam(event, 'placeId'),
      'Place id'
    )
    const place = await readPlace(locator).catch(() => {
      throw createError({
        statusCode: 503,
        statusMessage: 'Place could not be read.',
      })
    })
    if (!place)
      throw createError({ statusCode: 404, statusMessage: 'Place not found.' })
    return success(event, place)
  }
)

function success(
  event: Parameters<typeof setResponseHeaders>[0],
  place: PlaceDetailResponse['place']
): PlaceDetailResponse {
  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control':
      'public, max-age=60, s-maxage=300, stale-while-revalidate=900',
  })
  return { place }
}
