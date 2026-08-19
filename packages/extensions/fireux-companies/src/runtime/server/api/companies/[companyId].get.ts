// Concurrent edit — 2026-07-21 14:41 CEST — Company public projection: exact-load one complete pair without caching materialization misses.
// Concurrent edit — 2026-07-21 15:20 CEST — Misebox Nitro startup fix: resolve the Place model through its explicit TypeScript server import.
import { defineEventHandler, getRouterParam, setResponseHeaders } from 'h3'
import type { PublicCompanyDetailResponse } from '../../../place/models/company-public.model.ts'
import { readPublicCompanyDetail } from '../../../place/server/company/public-projection'

export default defineEventHandler(
  async (event): Promise<PublicCompanyDetailResponse> => {
    const item = await readPublicCompanyDetail(
      getRouterParam(event, 'companyId')
    )
    setResponseHeaders(event, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control':
        'public, max-age=60, s-maxage=300, stale-while-revalidate=900',
    })
    return { item }
  }
)
