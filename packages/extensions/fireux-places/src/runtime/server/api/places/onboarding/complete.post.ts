// Concurrent edit — 2026-07-21 16:25 CEST — Place onboarding enrichment: expose trusted Place completion.
import { defineEventHandler, readBody } from 'h3'
import { completePlaceOnboarding } from '../../../place/onboarding'

export default defineEventHandler(async event =>
  completePlaceOnboarding(event, await readBody(event))
)
