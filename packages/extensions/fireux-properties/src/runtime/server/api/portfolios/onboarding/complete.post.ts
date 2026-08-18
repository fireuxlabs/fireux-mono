// Concurrent edit — 2026-07-21 22:29 CEST — Portfolio atomic attachment: expose fixed-runtime trusted onboarding completion.
import { defineEventHandler, readBody } from 'h3'
import { completePortfolioOnboarding } from '../../../portfolio/index/onboarding/onboarding.ts'

export default defineEventHandler(async event =>
  completePortfolioOnboarding(event, await readBody(event))
)
