import {
  defineEventHandler,
  setResponseHeader,
  getRouterParam,
  setResponseHeaders,
} from 'h3'

import type { BusinessDetailResponse } from '../../../business/models/business-collection.model.ts'
import { readBusinessDetail } from '../../../business/server/business/projection'

export default defineEventHandler(
  async (event): Promise<BusinessDetailResponse> => {
    setResponseHeader(event, 'Cache-Control', 'no-store')

    const detail = await readBusinessDetail(getRouterParam(event, 'businessId'))
    setResponseHeaders(event, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    })
    return detail
  }
)
