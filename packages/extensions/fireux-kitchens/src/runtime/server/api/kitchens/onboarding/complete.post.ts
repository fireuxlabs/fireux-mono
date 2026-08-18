// Concurrent edit — 2026-07-21 17:15 CEST — Kitchen onboarding: expose atomic Kitchen activation.
import { defineEventHandler, readBody } from 'h3'
import { completeKitchenOnboarding } from '../../../kitchen/index/onboarding/onboarding'

export default defineEventHandler(async (event) =>
  completeKitchenOnboarding(event, await readBody(event))
)
