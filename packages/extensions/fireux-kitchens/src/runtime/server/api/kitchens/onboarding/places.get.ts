import { defineEventHandler, setResponseHeaders } from 'h3'
import { listKitchenOnboardingPlaces } from '../../../kitchen/onboarding-places'

export default defineEventHandler(async event => {
  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'private, no-store',
  })
  return listKitchenOnboardingPlaces(event)
})
