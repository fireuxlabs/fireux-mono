import {
  defineEventHandler,
  setResponseHeader,
  getQuery,
  setResponseHeaders,
} from 'h3'

// Concurrent edit — 2026-07-21 12:53 CEST — Job Directory: cursor-scan eligible roots.
// Concurrent edit — 2026-07-22 12:37 CEST — Shared Job spine alignment: hydrate bounded canonical Company and Place relationships.
// Concurrent edit — 2026-07-22 12:56 CEST — Job category scope: keep all-category public indexes enabled without a literal wildcard id.

import type { JobDirectoryPage } from '../../job/models/job-collection.model.ts'
import { readJobDirectoryPage } from '../../job/server/index/read.ts'

export default defineEventHandler(async (event): Promise<JobDirectoryPage> => {
  setResponseHeader(event, 'Cache-Control', 'no-store')

  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  })

  const query = getQuery(event)
  return readJobDirectoryPage(event, {
    cursor: query.cursor,
    limit: query.limit,
  })
})
