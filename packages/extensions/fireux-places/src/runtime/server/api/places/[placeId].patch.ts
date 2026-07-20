// Concurrent edit — 2026-07-20 21:17 CEST — Place-root authority pass: expose the authenticated sparse Place mutation route.
import { defineEventHandler, getRouterParam, readBody } from 'h3'
import { mutatePlace } from '../../place/mutate'

export default defineEventHandler(async event => {
  const placeId = String(getRouterParam(event, 'placeId') || '').trim()
  const body = await readBody(event)

  return mutatePlace(event, placeId, body || {})
})
