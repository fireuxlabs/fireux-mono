// Concurrent edit — 2026-07-21 16:57 CEST — Kitchen Finance surface: expose an authenticated aggregate-only gross-sales report.
import {
  createError,
  defineEventHandler,
  getQuery,
  setResponseHeaders,
  type H3Event,
} from 'h3'
import { requirePathSegment } from 'fireux-core/runtime/server/utils/ids/path.ts'
import {
  KitchenGrossSalesReportInputError,
  KitchenGrossSalesReportInvariantError,
  KitchenGrossSalesReportLimitError,
  readKitchenGrossSalesReport,
} from '../../../../../server/kitchen/sales/gross-sales-report.ts'
import { requireKitchenReportReader } from '../../../../../server/kitchen/operator-access.ts'

export default defineEventHandler(async (event: H3Event) => {
  const query = getQuery(event)
  const appId = requirePathSegment(query.app_id, 'App id')
  const kitchenId = requirePathSegment(query.kitchen_id, 'Kitchen id')
  const { db } = await requireKitchenReportReader(event, { appId, kitchenId })

  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'private, no-store',
  })

  try {
    return await readKitchenGrossSalesReport({
      db,
      appId,
      kitchenId,
      from: query.from,
      to: query.to,
    })
  } catch (error) {
    if (error instanceof KitchenGrossSalesReportInputError) {
      throw createError({ statusCode: 400, statusMessage: error.message })
    }
    if (error instanceof KitchenGrossSalesReportInvariantError) {
      throw createError({ statusCode: 409, statusMessage: error.message })
    }
    if (error instanceof KitchenGrossSalesReportLimitError) {
      throw createError({ statusCode: 422, statusMessage: error.message })
    }
    throw error
  }
})
