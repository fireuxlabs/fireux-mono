// Concurrent edit — 2026-07-21 14:08 CEST — Trusted Professional API: expose fixed-user structured profile mutation.
import { defineEventHandler, readBody } from 'h3'
import { updateProfessionalStructuredField } from '../../../../../user/server/professional/structured.ts'

export default defineEventHandler(async event => {
  const body = await readBody(event)
  return updateProfessionalStructuredField(event, body)
})
