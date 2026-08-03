// Concurrent edit — 2026-07-21 12:53 CEST — Public Jobs projection: cursor-scan roots and emit only eligible safe DTOs.
// Concurrent edit — 2026-07-22 12:37 CEST — Shared Job spine alignment: hydrate bounded canonical Company and Place relationships.
// Concurrent edit — 2026-07-22 12:56 CEST — Job category scope: keep all-category public indexes enabled without a literal wildcard id.
import { defineEventHandler, getQuery, setResponseHeaders } from 'h3'
import type { PublicJobIndexPage } from '../../../models/job-public.model.ts'
import { readPublicJobIndexPage } from '../../job/public-index.ts'

export default defineEventHandler(
  async (event): Promise<PublicJobIndexPage> => {
    setResponseHeaders(event, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control':
        'public, max-age=60, s-maxage=300, stale-while-revalidate=900',
    })

    const query = getQuery(event)
    return readPublicJobIndexPage(event, {
      cursor: query.cursor,
      limit: query.limit,
    })
  }
)
