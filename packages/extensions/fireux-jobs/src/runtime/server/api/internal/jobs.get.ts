import { defineEventHandler, setResponseHeader } from 'h3'

// Concurrent edit — 2026-07-21 14:08 CEST — Trusted Jobs API: expose only the signed-in author's bounded Job collection.
import { listAuthorJobs } from '../../../job/server/identity/author.ts'

export default defineEventHandler((event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  return listAuthorJobs(event)
})
