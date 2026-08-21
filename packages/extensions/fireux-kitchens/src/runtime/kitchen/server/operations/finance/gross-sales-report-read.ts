import type { Firestore } from 'firebase-admin/firestore'
import type { KitchenGrossSalesReport } from '../../../models/finance-report.model.ts'
import {
  KITCHEN_GROSS_SALES_REPORT_MAX_SALES,
  record,
  requiredId,
} from './gross-sales-report-common'
import {
  requireKitchenGrossSalesReportLocalDateRange,
  requireKitchenGrossSalesReportPeriodRange,
  requireKitchenGrossSalesReportPresetRange,
} from './gross-sales-report-range'
import { aggregateKitchenGrossSalesReport } from './gross-sales-report-aggregate'

export async function readKitchenGrossSalesReport(input: {
  db: Firestore
  appId: string
  kitchenId: string
  period?: unknown
  preset?: unknown
  fromDate?: unknown
  toDate?: unknown
  timezone: unknown
  now?: Date
}): Promise<KitchenGrossSalesReport> {
  const appId = requiredId(input.appId, 'Kitchen Finance App id')
  const kitchenId = requiredId(input.kitchenId, 'Kitchen Finance Kitchen id')
  const selection =
    input.preset != null
      ? requireKitchenGrossSalesReportPresetRange({
          preset: input.preset,
          timezone: input.timezone,
          ...(input.now ? { now: input.now } : {}),
        })
      : input.fromDate != null || input.toDate != null
        ? requireKitchenGrossSalesReportLocalDateRange({
            fromDate: input.fromDate,
            toDate: input.toDate,
            timezone: input.timezone,
            ...(input.now ? { now: input.now } : {}),
          })
        : requireKitchenGrossSalesReportPeriodRange({
            period: input.period,
            timezone: input.timezone,
            ...(input.now ? { now: input.now } : {}),
          })
  const snapshot = await input.db
    .collection(`kitchens/${kitchenId}/sales`)
    .where('occurred_at', '>=', selection.range.fromTimestamp)
    .where('occurred_at', '<', selection.range.toTimestamp)
    .orderBy('occurred_at', 'asc')
    .limit(KITCHEN_GROSS_SALES_REPORT_MAX_SALES + 1)
    .get()
  const actorIds = [
    ...new Set(
      snapshot.docs.flatMap((row) => {
        const actorId = record(record(row.data()).actor).id
        return typeof actorId === 'string' && actorId.trim() ? [actorId] : []
      })
    ),
  ]
  const actorSnapshots = actorIds.length
    ? await input.db.getAll(
        ...actorIds.map((actorId) => input.db.collection('users').doc(actorId))
      )
    : []
  const actorDisplayNames = new Map(
    actorSnapshots.flatMap((actorSnapshot) => {
      if (!actorSnapshot.exists) return []
      const user = record(actorSnapshot.data())
      const identity = record(user.identity)
      const displayName = String(
        identity.display_name ?? user.display_name ?? user.name ?? ''
      )
        .trim()
        .slice(0, 120)
      return displayName ? [[actorSnapshot.id, displayName] as const] : []
    })
  )

  return aggregateKitchenGrossSalesReport({
    appId,
    kitchenId,
    range: selection.range,
    timezone: selection.timezone,
    rows: snapshot.docs,
    actorDisplayNames,
    generatedAt: selection.now,
  })
}
