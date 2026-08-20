// Concurrent edit — 2026-07-21 22:30 CEST — Workspace alignment — Property: expose fixed-runtime atomic Property onboarding.
import { defineEventHandler, readBody } from 'h3'
import { completePropertyOnboarding } from '../../../../property/server/index/onboarding.ts'

export default defineEventHandler(async event =>
  completePropertyOnboarding(event, await readBody(event))
)
