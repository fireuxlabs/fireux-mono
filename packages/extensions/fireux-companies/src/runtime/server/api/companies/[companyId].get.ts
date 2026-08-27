import { defineEventHandler, getRouterParam, setResponseHeaders } from 'h3'
import type { CompanyDetailResponse } from '../../../place/models/company-collection.model.ts'
import { readCompanyDetail } from '../../../place/server/company/projection'

export default defineEventHandler(
  async (event): Promise<CompanyDetailResponse> => {
    const detail = await readCompanyDetail(getRouterParam(event, 'companyId'))
    setResponseHeaders(event, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control':
        'public, max-age=60, s-maxage=300, stale-while-revalidate=900',
    })
    return detail
  }
)
