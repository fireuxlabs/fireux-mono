// Concurrent edit — 2026-07-21 22:28 CEST — Workspace family alignment: expose the fixed-runtime Blank onboarding transaction.
import { defineEventHandler, readBody } from 'h3'
import { completeBlankOnboarding } from '../../../utils/blank/onboarding.ts'

export default defineEventHandler(async event =>
  completeBlankOnboarding(event, await readBody(event))
)
