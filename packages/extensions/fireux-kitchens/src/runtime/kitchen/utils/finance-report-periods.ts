/** Supported bounded report windows shared by reporting and its preview. */
export const KitchenFinanceReportPeriodDays = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
} as const
export type KitchenFinanceReportPeriod =
  keyof typeof KitchenFinanceReportPeriodDays
