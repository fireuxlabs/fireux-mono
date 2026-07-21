// Concurrent edit — 2026-07-21 14:08 CEST — Trusted Jobs API: patch only validated mutable fields on the signed-in author's Job.
import { createError, defineEventHandler, getRouterParam, readBody } from 'h3'
import { patchAuthorJob } from '../../../job/author.ts'

export default defineEventHandler(async event => {
  const body = await readBody(event)
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw createError({ statusCode: 400, statusMessage: 'A Job patch is required.' })
  }
  return patchAuthorJob(
    event,
    getRouterParam(event, 'id'),
    (body as Record<string, unknown>).patch
  )
})
