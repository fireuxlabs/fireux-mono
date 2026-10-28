import {
  defineEventHandler,
  setResponseHeader,
  getRouterParam,
  setResponseHeaders,
} from 'h3'

import type { CompanyDetailResponse } from '../../../place/models/company-collection.model.ts'
import { readCompanyDetail } from '../../../place/server/company/projection'

export default defineEventHandler(
  async (event): Promise<CompanyDetailResponse> => {
    setResponseHeader(event, 'Cache-Control', 'no-store')

    const detail = await readCompanyDetail(getRouterParam(event, 'companyId'))
    setResponseHeaders(event, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    })
    return detail
  }
)
