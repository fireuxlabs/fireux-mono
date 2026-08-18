// Concurrent edit — 2026-07-21 17:15 CEST — Kitchen onboarding: expose the bounded authenticated preview.
import { defineEventHandler, readBody } from 'h3'
import { previewKitchenOnboarding } from '../../../kitchen/index/onboarding/onboarding'

export default defineEventHandler(async (event) =>
  previewKitchenOnboarding(event, await readBody(event))
)
