import { deanosKitchenDemoIdentity } from './core/fixtures'

export type KitchenDemoFinanceItemDay = {
  menuId: string
  sourceItemId: string
  dishId: string
  label: string
  itemKind: 'food' | 'drink'
  quantity: number
  saleCount: number
  lineGrossMinor: number
}

export type KitchenDemoGrossSalesDay = {
  date: string
  saleCount: number
  grossSalesMinor: number
  itemQuantity: number
  itemSalesMinor: number
  deliveryFeesMinor: number
  items: readonly KitchenDemoFinanceItemDay[]
}

export type KitchenDemoFinance = {
  asOfDate: string
  currencyCode: string
  timezone: string
  dailyGrossSales: readonly KitchenDemoGrossSalesDay[]
}

const deanosKitchenDemoFinanceAsOfDate = '2026-07-26'
const deanosFinanceItemMix = [
  {
    sourceItemId: 'deanos-classic-item',
    dishId: 'deanos-classic',
    label: 'Deanos Classic',
    itemKind: 'food',
    grossWeight: 22,
    quantityRatio: 0.36,
  },
  {
    sourceItemId: 'double-trouble-item',
    dishId: 'double-trouble',
    label: 'Double Trouble',
    itemKind: 'food',
    grossWeight: 18,
    quantityRatio: 0.22,
  },
  {
    sourceItemId: 'hot-honey-chicken-item',
    dishId: 'hot-honey-chicken',
    label: 'Hot Honey Chicken',
    itemKind: 'food',
    grossWeight: 14,
    quantityRatio: 0.18,
  },
  {
    sourceItemId: 'swiss-melt-item',
    dishId: 'swiss-melt',
    label: 'Swiss Melt',
    itemKind: 'food',
    grossWeight: 12,
    quantityRatio: 0.16,
  },
  {
    sourceItemId: 'skin-on-fries-item',
    dishId: 'skin-on-fries',
    label: 'Skin-on fries',
    itemKind: 'food',
    grossWeight: 11,
    quantityRatio: 0.55,
  },
  {
    sourceItemId: 'dirty-deanos-fries-item',
    dishId: 'dirty-deanos-fries',
    label: 'Dirty Deanos fries',
    itemKind: 'food',
    grossWeight: 8,
    quantityRatio: 0.12,
  },
  {
    sourceItemId: 'onion-rings-item',
    dishId: 'onion-rings',
    label: 'Crispy onion rings',
    itemKind: 'food',
    grossWeight: 6,
    quantityRatio: 0.25,
  },
  {
    sourceItemId: 'cherry-vanilla-shake-item',
    dishId: 'cherry-vanilla-shake',
    label: 'Cherry vanilla shake',
    itemKind: 'drink',
    grossWeight: 5,
    quantityRatio: 0.16,
  },
  {
    sourceItemId: 'house-lemonade-item',
    dishId: 'house-lemonade',
    label: 'House lemonade',
    itemKind: 'drink',
    grossWeight: 4,
    quantityRatio: 0.22,
  },
] as const

/**
 * Deterministic, aggregate-only sales for the fictional Deanos Demo Kitchen.
 *
 * The 180 daily buckets support current and prior 7, 30 and 90-day windows
 * from one reconciled source. Daily item rollups use real Deanos Demo menu
 * identity and reconcile exactly to each day's gross sales, but remain
 * read-only presentation fixtures rather than KitchenSale records,
 * FinancialFacts, Firestore documents, customer performance, or
 * Test-environment data.
 */
export const deanosKitchenDemoFinance: KitchenDemoFinance = {
  asOfDate: '2026-07-26',
  currencyCode: 'CHF',
  timezone: 'Europe/Zurich',
  dailyGrossSales: buildDeanosDailyGrossSales(),
}

function buildDeanosDailyGrossSales(): KitchenDemoGrossSalesDay[] {
  const asOf = Date.parse(`${deanosKitchenDemoFinanceAsOfDate}T00:00:00.000Z`)
  const baseSaleCountByWeekday = [55, 35, 37, 40, 45, 59, 68]
  const averageSaleMinorByWeekday = [
    2_740,
    2_490,
    2_510,
    2_540,
    2_600,
    2_790,
    2_860,
  ]

  return Array.from({ length: 180 }, (_, index) => {
    const date = new Date(asOf - (179 - index) * 86_400_000)
    const weekday = date.getUTCDay()
    const saleCount =
      baseSaleCountByWeekday[weekday]
      + Math.floor(index / 45)
      - 2
      + (index * 7) % 9
      - 4
      + (index % 29 === 0 ? 9 : 0)
    const averageSaleMinor =
      averageSaleMinorByWeekday[weekday]
      + (index * 37) % 180
      - 90
    const grossSalesMinor =
      saleCount * averageSaleMinor + (index * 113) % 700
    const items = buildDeanosDailyItemRollups({
      dayIndex: index,
      grossSalesMinor,
      saleCount,
    })

    return {
      date: date.toISOString().slice(0, 10),
      saleCount,
      grossSalesMinor,
      itemQuantity: items.reduce(
        (total, item) => total + item.quantity,
        0
      ),
      itemSalesMinor: grossSalesMinor,
      deliveryFeesMinor: 0,
      items,
    }
  })
}

function buildDeanosDailyItemRollups(input: {
  dayIndex: number
  grossSalesMinor: number
  saleCount: number
}): KitchenDemoFinanceItemDay[] {
  const weights = deanosFinanceItemMix.map((item, itemIndex) =>
    item.grossWeight + (input.dayIndex + itemIndex * 3) % 7 - 3
  )
  const totalWeight = weights.reduce((total, weight) => total + weight, 0)
  let allocatedMinor = 0

  return deanosFinanceItemMix.map((item, itemIndex) => {
    const quantity = Math.max(
      1,
      Math.round(
        input.saleCount * item.quantityRatio
        + (input.dayIndex + itemIndex * 2) % 3
        - 1
      )
    )
    const lineGrossMinor = itemIndex === deanosFinanceItemMix.length - 1
      ? input.grossSalesMinor - allocatedMinor
      : Math.floor(input.grossSalesMinor * weights[itemIndex] / totalWeight)
    allocatedMinor += lineGrossMinor

    return {
      menuId: deanosKitchenDemoIdentity.menuId,
      sourceItemId: item.sourceItemId,
      dishId: item.dishId,
      label: item.label,
      itemKind: item.itemKind,
      quantity,
      saleCount: Math.min(
        input.saleCount,
        quantity,
        Math.max(1, Math.round(quantity * 0.82))
      ),
      lineGrossMinor,
    }
  })
}
