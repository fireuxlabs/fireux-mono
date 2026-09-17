import { defineEventHandler, getRouterParam, setResponseHeader } from 'h3'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { fetchVerifiedGooglePlaceDetails } from '../../../../place/server/integration/google/details'
import { resolveTimezone } from '../../../../place/server/index/onboarding/values'
import { readGoogleRegularHours } from '../../../../place/utils/google-hours'
import type { GooglePlaceReview } from '../../../../place/models/google-review'

/** Transient provider comparison. No Firestore read or write and no persistent provider snapshot. */
export default defineEventHandler(async (event): Promise<GooglePlaceReview> => {
  await requireFirebaseBearerUser(event)
  const placeId = requireFirestoreDocumentId(
    getRouterParam(event, 'placeId'),
    'Place id'
  )
  setResponseHeader(event, 'Cache-Control', 'private, no-store')
  const { payload, openingHours, attributions } =
    await fetchVerifiedGooglePlaceDetails(event, placeId, true)
  const timezone = await resolveTimezone(event, payload)
  const { hours, status } = readGoogleRegularHours(openingHours)
  return {
    placeId,
    ...(typeof payload.name === 'string' ? { name: payload.name } : {}),
    ...(typeof payload.phone === 'string' ? { phone: payload.phone } : {}),
    ...(typeof payload.website === 'string'
      ? { website: payload.website }
      : {}),
    ...(timezone ? { timezone } : {}),
    business_hours: hours,
    hoursStatus: status,
    attributions,
  }
})
