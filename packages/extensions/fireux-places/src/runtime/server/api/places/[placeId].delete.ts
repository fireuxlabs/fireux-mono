// Concurrent edit — 2026-07-22 12:58 CEST — Place detail deletion: expose the trusted root removal route.
import { defineEventHandler, getRouterParam } from 'h3'
import { removePlace } from '../../place/remove'

export default defineEventHandler(event => {
  const placeId = String(getRouterParam(event, 'placeId') || '').trim()
  return removePlace(event, placeId)
})
