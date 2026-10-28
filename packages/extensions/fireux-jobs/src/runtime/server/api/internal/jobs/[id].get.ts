import { defineEventHandler, setResponseHeader, getRouterParam } from 'h3'

// Concurrent edit — 2026-07-21 14:08 CEST — Trusted Jobs API: exact-load only the signed-in author's Job.

import { getAuthorJob } from '../../../../job/server/identity/author.ts'

export default defineEventHandler((event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  return getAuthorJob(event, getRouterParam(event, 'id'))
})
