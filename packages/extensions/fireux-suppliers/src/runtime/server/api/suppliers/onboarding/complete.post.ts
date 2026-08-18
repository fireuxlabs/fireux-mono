// Concurrent edit — 2026-07-21 22:34 CEST — Supplier atomic onboarding: expose the authenticated completion transaction.
import { defineEventHandler, readBody } from 'h3'
import { completeSupplierOnboarding } from '../../../supplier/index/onboarding.ts'

export default defineEventHandler(async event =>
  completeSupplierOnboarding(event, await readBody(event))
)
