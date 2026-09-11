import { defineLiveReadHandler } from 'fireux-core/runtime/server/utils/http/defineLiveReadHandler'
// Concurrent edit — 2026-07-21 12:53 CEST — Job Directory: cursor-scan eligible roots.
// Concurrent edit — 2026-07-22 12:37 CEST — Shared Job spine alignment: hydrate bounded canonical Company and Place relationships.
// Concurrent edit — 2026-07-22 12:56 CEST — Job category scope: keep all-category public indexes enabled without a literal wildcard id.
import { getQuery, setResponseHeaders } from 'h3'
import type { JobDirectoryPage } from '../../job/models/job-collection.model.ts'
import { readJobDirectoryPage } from '../../job/server/index/read.ts'

export default defineLiveReadHandler(
  async (event): Promise<JobDirectoryPage> => {
    setResponseHeaders(event, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control':
        'public, max-age=60, s-maxage=300, stale-while-revalidate=900',
    })

    const query = getQuery(event)
    return readJobDirectoryPage(event, {
      cursor: query.cursor,
      limit: query.limit,
    })
  }
)
