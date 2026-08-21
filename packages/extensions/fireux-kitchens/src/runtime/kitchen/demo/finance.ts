import {
  DEANOS_KITCHEN_DEMO_AS_OF_DATE,
  DEANOS_KITCHEN_DEMO_CURRENCY_CODE,
  DEANOS_KITCHEN_DEMO_TIMEZONE,
  deanosKitchenDemoServices,
  type KitchenDemoCompletedOrder,
} from './operations/Orders/history'
import { deanosKitchenDemoTeam } from './team'

export type KitchenDemoFinanceItemDay = {
  menuId: string
  sourceItemId: string
  dishId: string
  label: string
  itemKind: 'food' | 'drink'
  variantId?: string
  variantLabel?: string
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
  transactions: readonly KitchenDemoFinanceTransaction[]
}

export type KitchenDemoFinanceTransaction = {
  source: {
    kind: 'completed_order'
    id: string
    serviceId: string
    serviceNumber: number
  }
  orderId: string
  orderNumber: string
  serviceId: string
  serviceNumber: number
  placedAt: string
  occurredAt: string
  orderType: KitchenDemoCompletedOrder['orderType']
  channel: KitchenDemoCompletedOrder['channel']
  status: KitchenDemoCompletedOrder['status']
  closedByTeamMemberId: string
  closedBy: string
  signedAmountMinor: number
  counterparty: string
  summary: string
  itemQuantity: number
  grossSalesMinor: number
  items: {
    menuId: string
    sourceItemId: string
    dishId: string
    itemKind: 'food' | 'drink'
    label: string
    unitPriceMinor: number
    quantity: number
    lineGrossMinor: number
    variantId?: string
    variantLabel?: string
  }[]
}

export type KitchenDemoFinance = {
  asOfDate: string
  currencyCode: string
  timezone: string
  dailyGrossSales: readonly KitchenDemoGrossSalesDay[]
}

const teamById = new Map(
  deanosKitchenDemoTeam.map((member) => [member.id, member] as const)
)

const transactionFromOrder = (
  order: KitchenDemoCompletedOrder
): KitchenDemoFinanceTransaction => {
  const closedBy = teamById.get(order.closedByTeamMemberId)?.display_name
  if (!closedBy) {
    throw new Error(
      `Deanos completed Order ${order.id} has no matching Team closer.`
    )
  }

  const itemQuantity = order.items.reduce(
    (total, item) => total + item.quantity,
    0
  )
  const firstItem = order.items[0]

  return {
    source: {
      kind: 'completed_order',
      id: order.id,
      serviceId: order.serviceId,
      serviceNumber: order.serviceNumber,
    },
    orderId: order.id,
    orderNumber: order.orderNumber,
    serviceId: order.serviceId,
    serviceNumber: order.serviceNumber,
    placedAt: order.placedAt,
    occurredAt: order.completedAt,
    orderType: order.orderType,
    channel: order.channel,
    status: order.status,
    closedByTeamMemberId: order.closedByTeamMemberId,
    closedBy,
    signedAmountMinor: order.pricing.totalMinor,
    counterparty: 'Guest',
    summary:
      order.items.length === 1
        ? `${firstItem.label} · ${itemQuantity} item${itemQuantity === 1 ? '' : 's'}`
        : `${firstItem.label} + ${order.items.length - 1} · ${itemQuantity} items`,
    itemQuantity,
    grossSalesMinor: order.pricing.totalMinor,
    items: order.items.map((item) => ({
      menuId: item.menuId,
      sourceItemId: item.sourceItemId,
      dishId: item.dishId,
      itemKind: item.itemKind,
      label: item.label,
      unitPriceMinor: item.unitPriceMinor,
      quantity: item.quantity,
      lineGrossMinor: item.lineTotalMinor,
      ...(item.variantId ? { variantId: item.variantId } : {}),
      ...(item.variantLabel ? { variantLabel: item.variantLabel } : {}),
    })),
  }
}

const dayFromCompletedOrders = (
  date: string,
  completedOrders: readonly KitchenDemoCompletedOrder[]
): KitchenDemoGrossSalesDay => {
  const itemById = new Map<string, KitchenDemoFinanceItemDay>()

  for (const order of completedOrders) {
    const seenItemIds = new Set<string>()
    for (const item of order.items) {
      const key = [
        item.menuId,
        item.sourceItemId,
        item.dishId,
        item.itemKind,
        item.label,
        item.variantId ?? '',
      ].join(':')
      const current = itemById.get(key) ?? {
        menuId: item.menuId,
        sourceItemId: item.sourceItemId,
        dishId: item.dishId,
        label: item.label,
        itemKind: item.itemKind,
        ...(item.variantId ? { variantId: item.variantId } : {}),
        ...(item.variantLabel ? { variantLabel: item.variantLabel } : {}),
        quantity: 0,
        saleCount: 0,
        lineGrossMinor: 0,
      }
      current.quantity += item.quantity
      current.lineGrossMinor += item.lineTotalMinor
      if (!seenItemIds.has(key)) {
        current.saleCount += 1
        seenItemIds.add(key)
      }
      itemById.set(key, current)
    }
  }

  const transactions = completedOrders.map(transactionFromOrder)
  const grossSalesMinor = transactions.reduce(
    (total, transaction) => total + transaction.signedAmountMinor,
    0
  )
  const itemQuantity = transactions.reduce(
    (total, transaction) => total + transaction.itemQuantity,
    0
  )

  return {
    date,
    saleCount: completedOrders.length,
    grossSalesMinor,
    itemQuantity,
    itemSalesMinor: grossSalesMinor,
    deliveryFeesMinor: 0,
    items: [...itemById.values()],
    transactions,
  }
}

/**
 * Deterministic sales projection for the fictional Deanos Demo Kitchen.
 *
 * Kitchen-owned completed Order records are the only source. This projection
 * does not create KitchenSales, FinancialFacts, Firestore documents, customer
 * performance, refunds, supplier invoices, payroll, rent, or Test data.
 */
export const deanosKitchenDemoFinance: KitchenDemoFinance = {
  asOfDate: DEANOS_KITCHEN_DEMO_AS_OF_DATE,
  currencyCode: DEANOS_KITCHEN_DEMO_CURRENCY_CODE,
  timezone: DEANOS_KITCHEN_DEMO_TIMEZONE,
  dailyGrossSales: deanosKitchenDemoServices.map((service) =>
    dayFromCompletedOrders(service.date, service.completedOrders)
  ),
}
