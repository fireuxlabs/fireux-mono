// Concurrent edit — 2026-07-21 14:08 CEST — Werkbox Firebase hardening: expose authenticated idempotent Place materialization.
import { defineEventHandler, readBody } from 'h3'
import { ensurePlace } from '../../place/ensure'

export default defineEventHandler(async event => {
  const body = await readBody(event)
  return ensurePlace(event, body)
})
