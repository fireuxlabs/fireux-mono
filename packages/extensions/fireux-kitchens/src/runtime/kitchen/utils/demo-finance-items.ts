import { requireFinancialMinorAmount } from 'fireux-finance/runtime/utils/money'
import type {
  KitchenDemoFinanceItemRollup,
  KitchenDemoFinanceSource,
} from './demo-finance.types.ts'

export const MAX_DAILY_ITEM_GROUPS = 100

export function itemKey(item: {
  menuId: string
  sourceItemId: string
  dishId: string
  label: string
  variantId?: string
  variantLabel?: string
}) {
  const parts = [
    item.menuId,
    item.sourceItemId,
    item.dishId,
    item.label,
    item.variantId ?? '',
    item.variantLabel ?? '',
  ].map((value) => String(value ?? '').trim())
  return parts.slice(0, 4).every(Boolean) ? parts.join(':') : ''
}

export function groupItems(
  days: readonly KitchenDemoFinanceSource['dailyGrossSales'][number][]
): KitchenDemoFinanceItemRollup[] {
  const totals = new Map<
    string,
    Omit<KitchenDemoFinanceItemRollup, 'sharePercent'>
  >()
  for (const day of days) {
    for (const item of day.items) {
      const id = itemKey(item)
      const current = totals.get(id)
      totals.set(id, {
        id,
        menuId: item.menuId,
        sourceItemId: item.sourceItemId,
        dishId: item.dishId,
        label: item.label,
        ...(item.itemKind ? { itemKind: item.itemKind } : {}),
        ...(item.variantId ? { variantId: item.variantId } : {}),
        ...(item.variantLabel ? { variantLabel: item.variantLabel } : {}),
        quantity: (current?.quantity ?? 0) + item.quantity,
        saleCount: (current?.saleCount ?? 0) + item.saleCount,
        lineGrossMinor: requireFinancialMinorAmount(
          (current?.lineGrossMinor ?? 0) + item.lineGrossMinor,
          {
            allowNegative: false,
            label: `Kitchen Demo item total for ${item.label}`,
          }
        ),
      })
    }
  }
  const itemSalesMinor = days.reduce(
    (total, day) => total + day.itemSalesMinor,
    0
  )
  return [...totals.values()]
    .sort(
      (left, right) =>
        right.lineGrossMinor - left.lineGrossMinor ||
        left.label.localeCompare(right.label)
    )
    .map((item) => ({
      ...item,
      sharePercent:
        Math.round((item.lineGrossMinor / itemSalesMinor) * 1_000) / 10,
    }))
}
