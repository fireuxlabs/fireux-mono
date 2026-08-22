import { projectKitchenDemoFinanceReport } from '../../utils/demo-finance'
import type {
  KitchenDemoScenarioAssembly,
  KitchenDemoScenarioInput,
} from './types'
import { createKitchenDemoValidationContext } from './validation-context'

export function validateKitchenDemoServiceAndFinance(
  input: KitchenDemoScenarioInput,
  assembly: KitchenDemoScenarioAssembly
): string[] {
  const {
    menus,
    finance,
    services,
    completedOrders,
    miseRequirements,
    dishes,
    stationIds,
    prepItemIds,
    recipeIds,
  } = createKitchenDemoValidationContext(input, assembly)

  const hasInvalidService = (() => {
    if (!services.length && !completedOrders.length) return false
    const menuItemById = new Map(
      menus.flatMap((menu) =>
        menu.menuSections.flatMap(({ items }) =>
          items.map(
            (item) => [`${menu.kitchenMenu.id}:${item.id}`, item] as const
          )
        )
      )
    )
    const serviceIds = new Set(services.map((service) => service.id))
    const serviceDates = new Set(services.map((service) => service.date))
    const serviceOrderIds = services.flatMap((service) =>
      service.completedOrders.map((order) => order.id)
    )
    const completedOrderIds = completedOrders.map((order) => order.id)
    const completedOrderIdSet = new Set(completedOrderIds)
    const firstPlacedAtMs = Math.min(
      ...completedOrders.map((order) => Date.parse(order.placedAt))
    )
    const sourceCreatedAtMs = [
      ...menus.flatMap((menu) => [
        menu.rootMenu,
        menu.kitchenMenu,
        ...menu.dishes,
        ...menu.menuSections.flatMap((section) => [
          section.section,
          ...section.items,
        ]),
      ]),
      ...(input.team ?? []),
      ...input.stations,
    ].map((record) => Number(record.created.at.seconds) * 1_000)

    return (
      serviceIds.size !== services.length ||
      serviceDates.size !== services.length ||
      new Set(serviceOrderIds).size !== serviceOrderIds.length ||
      new Set(completedOrderIds).size !== completedOrderIds.length ||
      serviceOrderIds.length !== completedOrderIds.length ||
      serviceOrderIds.some((id) => !completedOrderIdSet.has(id)) ||
      !Number.isFinite(firstPlacedAtMs) ||
      sourceCreatedAtMs.some(
        (createdAt) =>
          !Number.isFinite(createdAt) || createdAt >= firstPlacedAtMs
      ) ||
      services.some(
        (service) =>
          service.kitchenId !== input.identity.kitchenId ||
          service.completedOrders.some(
            (order, index) =>
              order.kitchenId !== input.identity.kitchenId ||
              order.serviceId !== service.id ||
              order.serviceNumber !== index + 1 ||
              order.menuId !== input.identity.menuId ||
              order.status !== 'completed' ||
              order.currencyCode !== 'CHF' ||
              order.pricing.minorUnitDigits !== 2 ||
              order.pricing.deliveryFeeMinor !== 0 ||
              order.pricing.subtotalMinor <= 0 ||
              order.pricing.totalMinor <= 0 ||
              order.pricing.subtotalMinor + order.pricing.deliveryFeeMinor !==
                order.pricing.totalMinor ||
              order.items.length === 0 ||
              !order.placedAt.startsWith(service.date) ||
              !order.completedAt.startsWith(service.date) ||
              Date.parse(order.placedAt) >= Date.parse(order.completedAt) ||
              order.placedAt.slice(11, 16) < '11:30' ||
              order.completedAt.slice(11, 16) > '22:00' ||
              (service.date < '2026-03-29'
                ? !order.completedAt.endsWith('+01:00')
                : !order.completedAt.endsWith('+02:00')) ||
              order.items.some((item) => {
                const menuItem = menuItemById.get(
                  `${order.menuId}:${item.sourceItemId}`
                )
                const dish = dishes.get(item.dishId)
                const priceOption = item.variantLabel
                  ? menuItem?.price_options.find(
                      (option) => option.label === item.variantLabel
                    )
                  : undefined
                const expectedUnitPriceMinor = Math.round(
                  Number(priceOption?.price ?? menuItem?.price ?? 0) * 100
                )
                return (
                  item.menuId !== order.menuId ||
                  !dish ||
                  !menuItem ||
                  menuItem.dish_id !== item.dishId ||
                  dish.name !== item.label ||
                  (menuItem.price_options.length > 0 &&
                    (!priceOption ||
                      item.variantId !==
                        priceOption.label
                          .toLowerCase()
                          .replaceAll(' ', '-'))) ||
                  item.unitPriceMinor <= 0 ||
                  item.quantity <= 0 ||
                  item.lineTotalMinor <= 0 ||
                  expectedUnitPriceMinor !== item.unitPriceMinor ||
                  item.unitPriceMinor * item.quantity !== item.lineTotalMinor
                )
              }) ||
              order.items.reduce(
                (total, item) => total + item.lineTotalMinor,
                0
              ) !== order.pricing.subtotalMinor
          )
      )
    )
  })()

  const hasInvalidFinance = (() => {
    if (!finance) return completedOrders.length > 0
    try {
      projectKitchenDemoFinanceReport(finance, '90d')
      const teamById = new Map(
        (input.team ?? []).map((member) => [member.id, member])
      )
      const sourceOrderById = new Map(
        completedOrders.map((order) => [order.id, order])
      )
      const seenFinanceOrderIds = new Set<string>()
      if (finance.dailyGrossSales.length !== services.length) return true

      for (const [dayIndex, day] of finance.dailyGrossSales.entries()) {
        const service = services[dayIndex]
        if (
          !service ||
          day.date !== service.date ||
          day.transactions.length !== service.completedOrders.length
        ) {
          return true
        }
        for (const transaction of day.transactions) {
          const closer = teamById.get(transaction.closedByTeamMemberId)
          const sourceOrder = sourceOrderById.get(transaction.orderId)
          if (
            !closer ||
            closer.display_name !== transaction.closedBy ||
            !sourceOrder ||
            seenFinanceOrderIds.has(transaction.orderId) ||
            transaction.orderNumber !== sourceOrder.orderNumber ||
            transaction.serviceId !== sourceOrder.serviceId ||
            transaction.serviceNumber !== sourceOrder.serviceNumber ||
            transaction.placedAt !== sourceOrder.placedAt ||
            transaction.occurredAt !== sourceOrder.completedAt ||
            transaction.orderType !== sourceOrder.orderType ||
            transaction.channel !== sourceOrder.channel ||
            transaction.status !== sourceOrder.status ||
            transaction.closedByTeamMemberId !==
              sourceOrder.closedByTeamMemberId ||
            transaction.signedAmountMinor !== sourceOrder.pricing.totalMinor ||
            transaction.grossSalesMinor !== sourceOrder.pricing.totalMinor ||
            transaction.source.kind !== 'completed_order' ||
            transaction.source.id !== sourceOrder.id ||
            transaction.source.serviceId !== sourceOrder.serviceId ||
            transaction.source.serviceNumber !== sourceOrder.serviceNumber ||
            transaction.counterparty !== 'Guest' ||
            !transaction.summary ||
            transaction.items.length !== sourceOrder.items.length ||
            transaction.items.some((item, index) => {
              const sourceItem = sourceOrder.items[index]
              return (
                item.menuId !== sourceItem?.menuId ||
                item.sourceItemId !== sourceItem?.sourceItemId ||
                item.dishId !== sourceItem?.dishId ||
                item.itemKind !== sourceItem?.itemKind ||
                item.label !== sourceItem?.label ||
                item.unitPriceMinor !== sourceItem?.unitPriceMinor ||
                item.quantity !== sourceItem?.quantity ||
                item.lineGrossMinor !== sourceItem?.lineTotalMinor ||
                item.variantId !== sourceItem?.variantId ||
                item.variantLabel !== sourceItem?.variantLabel
              )
            })
          ) {
            return true
          }
          seenFinanceOrderIds.add(transaction.orderId)
        }
      }
      if (seenFinanceOrderIds.size !== completedOrders.length) return true

      const recentTransactions =
        finance.dailyGrossSales.at(-1)?.transactions.slice(-3) ?? []
      const completedOrderById = new Map(
        input.orders
          .filter((order) => order.status === 'completed')
          .map((order) => [order.id, order])
      )
      if (
        recentTransactions.length !== 3 ||
        completedOrderById.size !== recentTransactions.length
      ) {
        return true
      }
      for (const transaction of recentTransactions) {
        const order = completedOrderById.get(transaction.orderId)
        if (
          !order ||
          order.order_number !== transaction.orderNumber ||
          order.service_id !== transaction.serviceId ||
          order.service_number !== transaction.serviceNumber ||
          order.order_type !== transaction.orderType ||
          order.channel !== transaction.channel ||
          order.updated.by !== transaction.closedByTeamMemberId ||
          order.pricing.subtotal.amount_minor !== transaction.grossSalesMinor ||
          order.pricing.total.amount_minor !== transaction.grossSalesMinor ||
          order.items.length !== transaction.items.length ||
          order.items.some((item, index) => {
            const transactionItem = transaction.items[index]
            return (
              item.source_item_id !== transactionItem?.sourceItemId ||
              item.dish_id !== transactionItem?.dishId ||
              item.item_kind !== transactionItem?.itemKind ||
              item.label !== transactionItem?.label ||
              Math.round(Number(item.unit_price || 0) * 100) !==
                transactionItem?.unitPriceMinor ||
              item.quantity !== transactionItem?.quantity ||
              Math.round(Number(item.unit_price || 0) * 100) * item.quantity !==
                transactionItem?.lineGrossMinor
            )
          })
        ) {
          return true
        }
      }
      return false
    } catch {
      return true
    }
  })()

  const hasInvalidMiseRequirement = miseRequirements.some((requirement) => {
    if (
      !stationIds.has(requirement.station) ||
      !Number.isFinite(requirement.amount.quantity) ||
      requirement.amount.quantity <= 0
    ) {
      return true
    }
    return requirement.source.kind === 'prep_item'
      ? !prepItemIds.has(requirement.source.prepItemId)
      : !recipeIds.has(requirement.source.recipeId)
  })

  return [
    hasInvalidService && 'service',
    hasInvalidFinance && 'finance',
    hasInvalidMiseRequirement && 'mise requirements',
  ].filter((item): item is string => Boolean(item))
}
