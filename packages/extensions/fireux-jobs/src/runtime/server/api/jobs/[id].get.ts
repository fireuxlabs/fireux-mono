// Concurrent edit — 2026-07-21 12:53 CEST — Job detail: exact-load one eligible canonical Job.
// Concurrent edit — 2026-07-22 12:37 CEST — Shared Job spine alignment: exact-load canonical Company and Place display relationships.
// Concurrent edit — 2026-07-22 12:56 CEST — Job category scope: keep all-category public details enabled without a literal wildcard id.
import { defineEventHandler, setResponseHeaders } from 'h3'
import type { JobDetailResponse } from '../../../job/models/job-collection.model.ts'
import { readJobDetail } from '../../../job/server/identity/read.ts'

export default defineEventHandler(async (event): Promise<JobDetailResponse> => {
  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control':
      'public, max-age=60, s-maxage=300, stale-while-revalidate=900',
  })

  return readJobDetail(event, event.context.params?.id)
})
