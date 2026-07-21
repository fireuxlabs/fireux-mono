// Concurrent edit — 2026-07-21 16:25 CEST — Place onboarding enrichment: expose authenticated default suggestions.
import { defineEventHandler, readBody } from 'h3'
import { previewPlaceOnboarding } from '../../../place/onboarding'

export default defineEventHandler(async event =>
  previewPlaceOnboarding(event, await readBody(event))
)
