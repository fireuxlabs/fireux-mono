// Concurrent edit — 2026-07-21 14:08 CEST — Werkbox Firebase hardening: expose authenticated same-id Business materialization.
import { defineEventHandler, readBody } from 'h3'
import { materializeBusiness } from '../../../business/server/business/materialize'

export default defineEventHandler(async event => {
  const body = await readBody(event)
  return materializeBusiness(event, body)
})
