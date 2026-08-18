// Concurrent edit — 2026-07-21 14:08 CEST — Werkbox Firebase hardening: expose authenticated same-id Company materialization.
import { defineEventHandler, readBody } from 'h3'
import { materializeCompany } from '../../../place/server/company/materialize'

export default defineEventHandler(async event => {
  const body = await readBody(event)
  return materializeCompany(event, body)
})
