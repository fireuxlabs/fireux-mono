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
import {
  resolveKitchenOperationHours,
} from '../../../../../utils/kitchen-spine.ts'

const validTimezone = (value: unknown) => {
  if (
    typeof value !== 'string'
    || !value
    || value !== value.trim()
  ) return false
  try {
    new Intl.DateTimeFormat('en', { timeZone: value }).format()
    return true
  } catch {
    return false
  }
}

export default defineEventHandler(async (event: H3Event) => {
  const query = getQuery(event)
  const appId = requirePathSegment(query.app_id, 'App id')
  const kitchenId = requirePathSegment(query.kitchen_id, 'Kitchen id')
  const { db, rootKitchen, rootPlace } = await requireKitchenReportReader(
    event,
    { appId, kitchenId }
  )
  const resolvedHours = resolveKitchenOperationHours(rootKitchen, rootPlace)
  const effectiveHours =
    resolvedHours.source === 'custom'
    && !validTimezone(resolvedHours.timezone)
      ? resolveKitchenOperationHours({}, rootPlace)
      : resolvedHours

  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'private, no-store',
  })

  try {
    return await readKitchenGrossSalesReport({
      db,
      appId,
      kitchenId,
      period: query.period,
      preset: query.preset,
      fromDate: query.from_date,
      toDate: query.to_date,
      timezone: effectiveHours.timezone,
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
