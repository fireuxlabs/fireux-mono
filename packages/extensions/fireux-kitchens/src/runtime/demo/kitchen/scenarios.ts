// Concurrent edit — 2026-07-22 13:15 CEST — Demo World pass: replace disconnected target fixtures with one coherent fictional Kitchen world.
// Concurrent edit — 2026-07-22 12:40 CEST — Demo World correction: preserve Deanos and Garden Room as two coherent Demo worlds.
// Concurrent edit — 2026-07-22 14:12 CEST — Demo surface selectors: name the Menu, Kiosk and Service scenarios independently.
// Concurrent edit — 2026-07-22 13:11 CEST — Demo Kitchen identity pass: default to Misebox Restaurant and retain Deanos Smash Burger as the service contrast.
// Concurrent edit — 2026-07-22 13:48 CEST — Kiosk Demo selector pass: give each Demo Kitchen a distinct package-owned Menu theme.
// Concurrent edit — 2026-07-22 13:56 CEST — Kiosk theme contrast pass: separate refined dining from bold counter-service typography and colour.
// Concurrent edit — 2026-07-22 18:03 CEST — Deanos modernisation pass: align the Demo brand palette and typography with its new campaign photography.
// Concurrent edit — 2026-07-22 18:12 CEST — Pizza Demo pass: add a reusable green-and-yellow pizzeria presentation world.
import { KITCHEN_MISE_WORKFLOW_STAGES } from '../../models/kitchen/mise.model'
import {
  deanosKitchenDemoMenu,
  deanosPartyDemoMenu,
  deanosXmasDemoMenu,
  miseboxRestaurantKitchenDemoMenu,
  pizzaTheActionKitchenDemoMenu,
} from './operations/Menus'
import { deanosKitchenDemoMenuModes } from './operations/Menus/availability'
import {
  deanosKitchenDemoIdentity,
  miseboxRestaurantKitchenDemoIdentity,
  pizzaTheActionKitchenDemoIdentity,
} from './core/fixtures'
import {
  deanosKitchenDemoFinance,
  type KitchenDemoFinance,
} from './finance'
import {
  deanosKitchenDemoDishFinance,
  type KitchenDemoDishFinance,
} from './operations/Dishes/finance'
import {
  deanosKitchenDemoIngredientLinks,
  deanosKitchenDemoSupplierIngredientLinks,
  miseboxRestaurantKitchenDemoIngredientLinks,
  miseboxRestaurantKitchenDemoSupplierIngredientLinks,
  pizzaTheActionKitchenDemoIngredientLinks,
  pizzaTheActionKitchenDemoSupplierIngredientLinks,
} from './operations/Ingredients'
import {
  deanosKitchenDemoMiseTasks,
  deanosKitchenDemoOrders,
  deanosKitchenDemoStations,
  miseboxRestaurantKitchenDemoMiseTasks,
  miseboxRestaurantKitchenDemoOrders,
  miseboxRestaurantKitchenDemoStations,
  pizzaTheActionKitchenDemoMiseTasks,
  pizzaTheActionKitchenDemoOrders,
  pizzaTheActionKitchenDemoStations,
} from './operations'
import {
  deanosKitchenDemoMise,
  deanosKitchenDemoMenuItemComponentDeltas,
  deanosKitchenDemoPrepItems,
  deanosKitchenDemoRecipes,
  deanosKitchenDemoSpecs,
  type KitchenDemoDishSpec,
  type KitchenDemoMenuItemComponentDelta,
  type KitchenDemoMiseRequirement,
  type KitchenDemoPrepItem,
  type KitchenDemoProductionRecipe,
} from './production'
import type {
  KitchenDemoIdentity,
  KitchenDemoMenu,
  KitchenDemoScenario,
  KitchenDemoScenarioDescriptor,
} from './core/types'
import {
  KITCHEN_DEMO_MENU_MODES,
  type KitchenDemoMenuMode,
} from '../../utils/kitchen/demo-menu-cascade'
import {
  projectKitchenDemoFinanceReport,
} from '../../utils/kitchen/demo-finance'
import {
  deanosKitchenDemoTeam,
  type KitchenDemoTeamMember,
} from './team'
import {
  deanosKitchenDemoCompletedOrders,
  deanosKitchenDemoOrderNumber,
  deanosKitchenDemoServices,
  type KitchenDemoCompletedOrder,
  type KitchenDemoService,
} from './operations/Orders/history'
import {
  deanosKitchenDemoTarget,
  miseboxRestaurantKitchenDemoTarget,
  pizzaTheActionKitchenDemoTarget,
} from './core/targets'

const scenario = (input: {
  identity: KitchenDemoIdentity
  appSupport: KitchenDemoScenario['appSupport']
  kitchen: KitchenDemoScenario['kitchen']
  place: KitchenDemoScenario['place']
  menu: KitchenDemoMenu
  menuModes?: Readonly<Record<string, KitchenDemoMenuMode>>
  additionalMenus?: KitchenDemoMenu[]
  dishSpecs?: KitchenDemoDishSpec[]
  dishFinance?: KitchenDemoDishFinance[]
  finance?: KitchenDemoFinance
  team?: readonly KitchenDemoTeamMember[]
  services?: readonly KitchenDemoService[]
  completedOrders?: readonly KitchenDemoCompletedOrder[]
  kitchenIngredients?: KitchenDemoScenario['kitchenIngredients']
  menuItemComponentDeltas?: KitchenDemoMenuItemComponentDelta[]
  miseRequirements?: KitchenDemoMiseRequirement[]
  orders: KitchenDemoScenario['orders']
  prepItems?: KitchenDemoPrepItem[]
  recipes?: KitchenDemoProductionRecipe[]
  stations: KitchenDemoScenario['stations']
  supplierIngredientLinks?: KitchenDemoScenario['supplierIngredientLinks']
  miseTasks: KitchenDemoScenario['miseTasks']
}): KitchenDemoScenario => {
  const menus = [input.menu, ...(input.additionalMenus ?? [])]
  const menuModes = Object.fromEntries(
    menus.map((menu) => {
      const menuId = String(menu.kitchenMenu.id || '').trim()
      return [menuId, input.menuModes?.[menuId] ?? 'on']
    })
  ) satisfies Record<string, KitchenDemoMenuMode>
  const kitchenIngredients = [...(input.kitchenIngredients ?? [])]
  const supplierIngredientLinks = [...(input.supplierIngredientLinks ?? [])]
  const dishSpecs = [...(input.dishSpecs ?? [])]
  const dishFinance = [...(input.dishFinance ?? [])]
  const finance = input.finance ?? null
  const services = [...(input.services ?? [])]
  const completedOrders = [...(input.completedOrders ?? [])]
  const miseRequirements = [...(input.miseRequirements ?? [])]
  const menuItemComponentDeltas = [
    ...(input.menuItemComponentDeltas ?? []),
  ]
  const prepItems = [...(input.prepItems ?? [])]
  const recipes = [...(input.recipes ?? [])]
  const dishes = new Map(
    menus
      .flatMap(menu => menu.dishes)
      .map(dish => [dish.id, dish])
  )
  const ingredientIds = new Set(
    kitchenIngredients.map(ingredient => ingredient.ingredient_id)
  )
  const hasDuplicateIngredients =
    ingredientIds.size !== kitchenIngredients.length
  const hasInvalidSupplierLink = supplierIngredientLinks.some(
    link =>
      link.kitchen_id !== input.identity.kitchenId ||
      !ingredientIds.has(link.ingredient_id) ||
      !link.supplier_id
  )
  const hasInvalidRecipeLine = recipes.some(recipe =>
    !Number.isFinite(recipe.yield.quantity)
    || recipe.yield.quantity <= 0
    || recipe.ingredients.some(
      ingredient =>
        !ingredientIds.has(ingredient.ingredientId) ||
        !Number.isFinite(ingredient.quantity) ||
        ingredient.quantity <= 0
    )
  )
  const prepItemIds = new Set(prepItems.map(prepItem => prepItem.id))
  const recipeIds = new Set(recipes.map(recipe => recipe.id))
  const menuIds = new Set(menus.map(menu => menu.kitchenMenu.id))
  const hasInvalidMenuMode =
    Object.keys(input.menuModes ?? {}).some(menuId => !menuIds.has(menuId))
    || Object.values(menuModes).some(mode =>
      !KITCHEN_DEMO_MENU_MODES.includes(mode)
    )
  const stationIds = new Set(input.stations.map(station => station.id))
  const dishSpecDishIds = dishSpecs.map(spec => spec.dishId)
  const hasDuplicateProductionIds =
    prepItemIds.size !== prepItems.length
    || recipeIds.size !== recipes.length
    || new Set(dishSpecDishIds).size !== dishSpecDishIds.length
  const hasInvalidPrepItem = prepItems.some(prepItem =>
    !stationIds.has(prepItem.station)
    || !ingredientIds.has(prepItem.input.ingredientId)
    || !Number.isFinite(prepItem.input.quantity)
    || prepItem.input.quantity <= 0
    || !Number.isFinite(prepItem.yield.quantity)
    || prepItem.yield.quantity <= 0
  )
  const hasInvalidDishSpec = dishSpecs.some(spec => {
    if (!dishes.has(spec.dishId) || !stationIds.has(spec.station)) return true

    const componentIds = new Set(spec.components.map(component => component.id))
    if (componentIds.size !== spec.components.length) return true

    return spec.components.some((component) => {
      if (!Number.isFinite(component.quantity) || component.quantity <= 0) {
        return true
      }
      if (component.source === 'ingredient') {
        return !ingredientIds.has(component.ingredientId)
      }
      if (component.source === 'prep_item') {
        return !prepItemIds.has(component.prepItemId)
      }
      return !recipeIds.has(component.recipeId)
    })
  })
  const menuItemByScopedId = new Map(
    menus.flatMap(menu =>
      menu.menuSections.flatMap(({ section, items }) =>
        items.map(item => [
          `${menu.kitchenMenu.id}:${section.id}:${item.id}`,
          item,
        ] as const)
      )
    )
  )
  const menuItemDeltaIds = new Set(
    menuItemComponentDeltas.map(delta => delta.id)
  )
  const hasInvalidMenuItemDelta =
    menuItemDeltaIds.size !== menuItemComponentDeltas.length
    || menuItemComponentDeltas.some((delta) => {
      const item = menuItemByScopedId.get(
        `${delta.menuId}:${delta.sectionId}:${delta.menuItemId}`
      )
      if (!item) return true

      const hasChoice = delta.choice.kind === 'price_option'
        ? Boolean(delta.choice.id) && item.price_options.some(
            option => option.label === delta.choice.label
          )
        : item.add_ons.some(addOn => addOn.id === delta.choice.id)
      if (!hasChoice) return true
      if (
        delta.componentMultiplier !== undefined
        && (
          !Number.isFinite(delta.componentMultiplier)
          || delta.componentMultiplier <= 1
          || delta.components.length > 0
        )
      ) {
        return true
      }

      const componentIds = new Set(
        delta.components.map(component => component.id)
      )
      if (componentIds.size !== delta.components.length) return true

      return delta.components.some((component) => {
        if (!Number.isFinite(component.quantity) || component.quantity <= 0) {
          return true
        }
        if (component.source === 'ingredient') {
          return !ingredientIds.has(component.ingredientId)
        }
        if (component.source === 'prep_item') {
          return !prepItemIds.has(component.prepItemId)
        }
        return !recipeIds.has(component.recipeId)
      })
    })
  const hasMissingMenuItemDelta =
    dishSpecs.length > 0
    && menus.some(menu =>
      menu.menuSections.some(({ section, items }) =>
        items.some((item) => {
          const baseOption = item.price_options[0]
          if (!baseOption || item.price_options.length < 2) return false
          return item.price_options.slice(1).some((option) => {
            const delta = menuItemComponentDeltas.find(candidate =>
              candidate.menuId === menu.kitchenMenu.id
              && candidate.sectionId === section.id
              && candidate.menuItemId === item.id
              && candidate.choice.kind === 'price_option'
              && candidate.choice.label === option.label
            )
            if (!delta) return true
            const multiplier = option.quantity / baseOption.quantity
            return multiplier > 1
              && delta.components.length === 0
              && delta.componentMultiplier !== multiplier
          })
        })
      )
    )
  const hasIncompleteDishSpecs =
    dishSpecs.length > 0
    && (
      dishSpecs.length !== dishes.size
      || [...dishes.keys()].some(dishId => !dishSpecDishIds.includes(dishId))
    )
  const dishFinanceDishIds = dishFinance.map(entry => entry.dishId)
  const hasInvalidDishFinance =
    new Set(dishFinanceDishIds).size !== dishFinanceDishIds.length
    || dishFinance.some(entry =>
      !dishes.has(entry.dishId)
      || !Number.isSafeInteger(entry.quantitySold)
      || entry.quantitySold <= 0
    )
    || dishFinance.some(entry => {
      const sourceQuantity = completedOrders.reduce(
        (total, order) =>
          total + order.items
            .filter(item => item.dishId === entry.dishId)
            .reduce((quantity, item) => quantity + item.quantity, 0),
        0
      )
      return entry.quantitySold !== sourceQuantity
    })
  const hasInvalidService = (() => {
    if (!services.length && !completedOrders.length) return false
    const menuItemById = new Map(
      menus.flatMap(menu =>
        menu.menuSections.flatMap(({ items }) =>
          items.map(item => [
            `${menu.kitchenMenu.id}:${item.id}`,
            item,
          ] as const)
        )
      )
    )
    const serviceIds = new Set(services.map(service => service.id))
    const serviceDates = new Set(services.map(service => service.date))
    const serviceOrderIds = services.flatMap(service =>
      service.completedOrders.map(order => order.id)
    )
    const completedOrderIds = completedOrders.map(order => order.id)
    const completedOrderIdSet = new Set(completedOrderIds)
    const firstPlacedAtMs = Math.min(
      ...completedOrders.map(order => Date.parse(order.placedAt))
    )
    const sourceCreatedAtMs = [
      input.kitchen,
      ...menus.flatMap(menu => [
        menu.rootMenu,
        menu.kitchenMenu,
        ...menu.dishes,
        ...menu.menuSections.flatMap(section => [
          section.section,
          ...section.items,
        ]),
      ]),
      ...(input.team ?? []),
      ...input.stations,
    ].map(record => Number(record.created.at.seconds) * 1_000)

    return (
      serviceIds.size !== services.length
      || serviceDates.size !== services.length
      || new Set(serviceOrderIds).size !== serviceOrderIds.length
      || new Set(completedOrderIds).size !== completedOrderIds.length
      || serviceOrderIds.length !== completedOrderIds.length
      || serviceOrderIds.some(id => !completedOrderIdSet.has(id))
      || !Number.isFinite(firstPlacedAtMs)
      || sourceCreatedAtMs.some(createdAt =>
        !Number.isFinite(createdAt) || createdAt >= firstPlacedAtMs
      )
      || services.some(service =>
        service.kitchenId !== input.identity.kitchenId
        || service.completedOrders.some((order, index) =>
          order.kitchenId !== input.identity.kitchenId
          || order.serviceId !== service.id
          || order.serviceNumber !== index + 1
          || order.menuId !== input.identity.menuId
          || order.status !== 'completed'
          || order.currencyCode !== 'CHF'
          || order.pricing.minorUnitDigits !== 2
          || order.pricing.deliveryFeeMinor !== 0
          || order.pricing.subtotalMinor <= 0
          || order.pricing.totalMinor <= 0
          || order.pricing.subtotalMinor
            + order.pricing.deliveryFeeMinor !== order.pricing.totalMinor
          || order.items.length === 0
          || !order.placedAt.startsWith(service.date)
          || !order.completedAt.startsWith(service.date)
          || Date.parse(order.placedAt) >= Date.parse(order.completedAt)
          || order.placedAt.slice(11, 16) < '11:30'
          || order.completedAt.slice(11, 16) > '22:00'
          || (
            service.date < '2026-03-29'
              ? !order.completedAt.endsWith('+01:00')
              : !order.completedAt.endsWith('+02:00')
          )
          || order.items.some((item) => {
            const menuItem = menuItemById.get(
              `${order.menuId}:${item.sourceItemId}`
            )
            const dish = dishes.get(item.dishId)
            const priceOption = item.variantLabel
              ? menuItem?.price_options.find(
                  option => option.label === item.variantLabel
                )
              : undefined
            const expectedUnitPriceMinor = Math.round(
              Number(priceOption?.price ?? menuItem?.price ?? 0) * 100
            )
            return item.menuId !== order.menuId
              || !dish
              || !menuItem
              || menuItem.dish_id !== item.dishId
              || dish.name !== item.label
              || (
                menuItem.price_options.length > 0
                && (
                  !priceOption
                  || item.variantId
                    !== priceOption.label.toLowerCase().replaceAll(' ', '-')
                )
              )
              || item.unitPriceMinor <= 0
              || item.quantity <= 0
              || item.lineTotalMinor <= 0
              || expectedUnitPriceMinor !== item.unitPriceMinor
              || item.unitPriceMinor * item.quantity !== item.lineTotalMinor
          })
          || order.items.reduce(
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
        (input.team ?? []).map(member => [member.id, member])
      )
      const sourceOrderById = new Map(
        completedOrders.map(order => [order.id, order])
      )
      const seenFinanceOrderIds = new Set<string>()
      if (finance.dailyGrossSales.length !== services.length) return true

      for (const [dayIndex, day] of finance.dailyGrossSales.entries()) {
        const service = services[dayIndex]
        if (
          !service
          || day.date !== service.date
          || day.transactions.length !== service.completedOrders.length
        ) {
          return true
        }
        for (const transaction of day.transactions) {
          const closer = teamById.get(transaction.closedByTeamMemberId)
          const sourceOrder = sourceOrderById.get(transaction.orderId)
          if (
            !closer
            || closer.display_name !== transaction.closedBy
            || !sourceOrder
            || seenFinanceOrderIds.has(transaction.orderId)
            || transaction.orderNumber !== sourceOrder.orderNumber
            || transaction.serviceId !== sourceOrder.serviceId
            || transaction.serviceNumber !== sourceOrder.serviceNumber
            || transaction.placedAt !== sourceOrder.placedAt
            || transaction.occurredAt !== sourceOrder.completedAt
            || transaction.orderType !== sourceOrder.orderType
            || transaction.channel !== sourceOrder.channel
            || transaction.status !== sourceOrder.status
            || transaction.closedByTeamMemberId
              !== sourceOrder.closedByTeamMemberId
            || transaction.signedAmountMinor !== sourceOrder.pricing.totalMinor
            || transaction.grossSalesMinor !== sourceOrder.pricing.totalMinor
            || transaction.source.kind !== 'completed_order'
            || transaction.source.id !== sourceOrder.id
            || transaction.source.serviceId !== sourceOrder.serviceId
            || transaction.source.serviceNumber !== sourceOrder.serviceNumber
            || transaction.counterparty !== 'Guest'
            || !transaction.summary
            || transaction.items.length !== sourceOrder.items.length
            || transaction.items.some((item, index) => {
              const sourceItem = sourceOrder.items[index]
              return (
                item.menuId !== sourceItem?.menuId
                || item.sourceItemId !== sourceItem?.sourceItemId
                || item.dishId !== sourceItem?.dishId
                || item.itemKind !== sourceItem?.itemKind
                || item.label !== sourceItem?.label
                || item.unitPriceMinor !== sourceItem?.unitPriceMinor
                || item.quantity !== sourceItem?.quantity
                || item.lineGrossMinor !== sourceItem?.lineTotalMinor
                || item.variantId !== sourceItem?.variantId
                || item.variantLabel !== sourceItem?.variantLabel
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
          .filter(order => order.status === 'completed')
          .map(order => [order.id, order])
      )
      if (
        recentTransactions.length !== 3
        || completedOrderById.size !== recentTransactions.length
      ) {
        return true
      }
      for (const transaction of recentTransactions) {
        const order = completedOrderById.get(transaction.orderId)
        if (
          !order
          || order.order_number !== transaction.orderNumber
          || order.service_id !== transaction.serviceId
          || order.service_number !== transaction.serviceNumber
          || order.order_type !== transaction.orderType
          || order.channel !== transaction.channel
          || order.updated.by !== transaction.closedByTeamMemberId
          || order.pricing.subtotal.amount_minor !== transaction.grossSalesMinor
          || order.pricing.total.amount_minor !== transaction.grossSalesMinor
          || order.items.length !== transaction.items.length
          || order.items.some((item, index) => {
            const transactionItem = transaction.items[index]
            return (
              item.source_item_id !== transactionItem?.sourceItemId
              || item.dish_id !== transactionItem?.dishId
              || item.item_kind !== transactionItem?.itemKind
              || item.label !== transactionItem?.label
              || Math.round(Number(item.unit_price || 0) * 100)
                !== transactionItem?.unitPriceMinor
              || item.quantity !== transactionItem?.quantity
              || Math.round(Number(item.unit_price || 0) * 100)
                * item.quantity !== transactionItem?.lineGrossMinor
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
  const hasInvalidMiseRequirement = miseRequirements.some(
    requirement => {
      if (
        !stationIds.has(requirement.station)
        || !Number.isFinite(requirement.amount.quantity)
        || requirement.amount.quantity <= 0
      ) {
        return true
      }
      return requirement.source.kind === 'prep_item'
        ? !prepItemIds.has(requirement.source.prepItemId)
        : !recipeIds.has(requirement.source.recipeId)
    }
  )
  const hasInvalidStation =
    stationIds.size !== input.stations.length
    || input.stations.some(station =>
      station.kitchen_id !== input.identity.kitchenId
      || !station.id
      || !station.name
    )
  const team = [...(input.team ?? [])]
  const teamIds = new Set(team.map(member => member.id))
  const kitchenTeamIds = input.appSupport.team_ids
  const kitchenOperatorIds = input.appSupport.operator_ids
  const hasInvalidTeam =
    teamIds.size !== team.length
    || team.some(member =>
      member.kitchen_id !== input.identity.kitchenId
      || !member.id
      || !member.display_name
      || member.station_ids.some(stationId => !stationIds.has(stationId))
    )
    || kitchenTeamIds.length !== team.length
    || new Set(kitchenTeamIds).size !== teamIds.size
    || kitchenTeamIds.some(id => !teamIds.has(id))
    || new Set(kitchenOperatorIds).size !== kitchenOperatorIds.length
    || kitchenOperatorIds.some(id => !teamIds.has(id))
    || input.appSupport.id !== input.identity.kitchenId
    || input.appSupport.join_requests.length !== 0
  const hasInvalidOrder = (() => {
    const itemByMenuAndId = new Map(
      menus.flatMap(menu =>
        menu.menuSections.flatMap(({ items }) =>
          items.map(item => [
            `${menu.kitchenMenu.id}:${item.id}`,
            item,
          ] as const)
        )
      )
    )
    const serviceNumbers = input.orders.map(order => order.service_number)
    const sortedServiceNumbers = [...serviceNumbers].sort((a, b) => a - b)
    const hasInvalidCurrentSequence =
      services.length > 0
      && (
        new Set(serviceNumbers).size !== serviceNumbers.length
        || sortedServiceNumbers.some((number, index) =>
          number !== sortedServiceNumbers[0] + index
        )
      )

    return hasInvalidCurrentSequence || input.orders.some((order) => {
      const expectedSubtotalMinor = order.items.reduce((total, item) => {
        const menuItem = item.source_item_id
          ? itemByMenuAndId.get(`${order.menu_id}:${item.source_item_id}`)
          : undefined
        const priceOption = item.variant_label
          ? menuItem?.price_options.find(
              option => option.label === item.variant_label
            )
          : undefined
        const addOnMinor = (item.add_ons ?? []).reduce(
          (sum, addOn) => sum + Math.round(Number(addOn.price ?? 0) * 100),
          0
        )
        const expectedUnitMinor = Math.round(
          Number(priceOption?.price ?? menuItem?.price ?? 0) * 100
        ) + addOnMinor
        const unitPriceMinor = Math.round(Number(item.unit_price ?? 0) * 100)
        if (
          !menuItem
          || !dishes.has(item.dish_id)
          || menuItem.dish_id !== item.dish_id
          || (
            menuItem.price_options.length > 0
            && (
              !priceOption
              || item.variant_id
                !== priceOption.label.toLowerCase().replaceAll(' ', '-')
            )
          )
          || expectedUnitMinor !== unitPriceMinor
          || !Number.isSafeInteger(item.quantity)
          || item.quantity <= 0
        ) {
          return Number.NaN
        }
        return total + unitPriceMinor * item.quantity
      }, 0)
      const currentService = services.at(-1)

      return order.kitchen_id !== input.identity.kitchenId
        || !menuIds.has(order.menu_id)
        || !order.items.length
        || !Number.isSafeInteger(expectedSubtotalMinor)
        || order.pricing.subtotal.amount_minor !== expectedSubtotalMinor
        || order.pricing.delivery_fee.amount_minor !== 0
        || order.pricing.total.amount_minor !== expectedSubtotalMinor
        || Boolean(
          currentService
          && (
            order.service_id !== currentService.id
            || order.order_number !== deanosKitchenDemoOrderNumber(
              currentService.date,
              order.service_number
            )
          )
        )
        || Boolean(
          order.payment.amount_chf !== undefined
          && Math.round(order.payment.amount_chf * 100)
            !== order.pricing.total.amount_minor
        )
        || Boolean(
          order.updated.by
          && order.updated.by !== 'menu'
          && order.updated.by !== 'demo-operator'
          && !teamIds.has(order.updated.by)
        )
    })
  })()
  const miseTaskIds = new Set(input.miseTasks.map(task => task.id))
  const hasInvalidMiseTask =
    miseTaskIds.size !== input.miseTasks.length
    || input.miseTasks.some((task) => {
      const checklistIds = task.checklist.map(item => item.id)
      return task.kitchen_id !== input.identity.kitchenId
        || !task.id
        || !menuIds.has(task.menu_id)
        || !stationIds.has(task.station)
        || Boolean(
          task.workflow_stage
          && !KITCHEN_MISE_WORKFLOW_STAGES.includes(task.workflow_stage)
        )
        || task.ingredient_ids.some(id => !ingredientIds.has(id))
        || task.mise_ids.some(id => !prepItemIds.has(id))
        || Boolean(task.recipe_id && !recipeIds.has(task.recipe_id))
        || Boolean(
          task.recipe_id
          && miseRequirements.some(requirement =>
            requirement.source.kind === 'recipe'
            && requirement.source.recipeId === task.recipe_id
            && requirement.station !== task.station
          )
        )
        || Boolean(
          task.menu_id === input.identity.menuId
          && services.length > 0
          && (
            task.status !== 'done'
            || task.checklist.some(item => !item.done)
          )
        )
        || new Set(checklistIds).size !== checklistIds.length
        || task.checklist.some(item => !item.id || !item.label)
    })

  const invalidRelationships = [
    hasDuplicateIngredients && 'duplicate ingredients',
    hasInvalidMenuMode && 'menu modes',
    hasInvalidSupplierLink && 'supplier links',
    hasInvalidRecipeLine && 'recipe lines',
    hasDuplicateProductionIds && 'production ids',
    hasInvalidPrepItem && 'prep items',
    hasInvalidDishSpec && 'dish specs',
    hasInvalidMenuItemDelta && 'menu item deltas',
    hasMissingMenuItemDelta && 'menu item delta coverage',
    hasIncompleteDishSpecs && 'incomplete dish specs',
    hasInvalidDishFinance && 'dish finance',
    hasInvalidService && 'service',
    hasInvalidFinance && 'finance',
    hasInvalidMiseRequirement && 'mise requirements',
    hasInvalidStation && 'stations',
    hasInvalidTeam && 'team',
    hasInvalidOrder && 'orders',
    hasInvalidMiseTask && 'mise tasks',
  ].filter((item): item is string => Boolean(item))

  if (invalidRelationships.length) {
    throw new Error(
      `Kitchen Demo production relationships are invalid for ${input.identity.kitchenId}: ${invalidRelationships.join(', ')}.`
    )
  }

  return {
    appId: input.identity.appId,
    appSupport: input.appSupport,
    kitchen: input.kitchen,
    place: input.place,
    menus,
    menuModes,
    kitchenIngredients,
    supplierIngredientLinks,
    rootMenu: input.menu.rootMenu,
    kitchenMenu: input.menu.kitchenMenu,
    dishes: [...dishes.values()],
    dishSpecs,
    dishFinance,
    finance,
    team,
    services,
    completedOrders,
    menuItemComponentDeltas,
    menuSections: input.menu.menuSections,
    miseRequirements,
    orders: input.orders,
    prepItems,
    recipes,
    stations: input.stations,
    miseTasks: input.miseTasks,
  }
}

export const deanosKitchenDemoScenario = scenario({
  identity: deanosKitchenDemoIdentity,
  appSupport: deanosKitchenDemoTarget.appSupport,
  kitchen: deanosKitchenDemoTarget.kitchen,
  place: deanosKitchenDemoTarget.place,
  menu: deanosKitchenDemoMenu,
  menuModes: deanosKitchenDemoMenuModes,
  additionalMenus: [
    deanosPartyDemoMenu,
    deanosXmasDemoMenu,
  ],
  dishSpecs: deanosKitchenDemoSpecs,
  dishFinance: deanosKitchenDemoDishFinance,
  finance: deanosKitchenDemoFinance,
  team: deanosKitchenDemoTeam,
  services: deanosKitchenDemoServices,
  completedOrders: deanosKitchenDemoCompletedOrders,
  kitchenIngredients: deanosKitchenDemoIngredientLinks,
  menuItemComponentDeltas: deanosKitchenDemoMenuItemComponentDeltas,
  miseRequirements: deanosKitchenDemoMise,
  orders: deanosKitchenDemoOrders,
  prepItems: deanosKitchenDemoPrepItems,
  recipes: deanosKitchenDemoRecipes,
  stations: deanosKitchenDemoStations,
  supplierIngredientLinks: deanosKitchenDemoSupplierIngredientLinks,
  miseTasks: deanosKitchenDemoMiseTasks,
})

export const pizzaTheActionKitchenDemoScenario = scenario({
  identity: pizzaTheActionKitchenDemoIdentity,
  appSupport: pizzaTheActionKitchenDemoTarget.appSupport,
  kitchen: pizzaTheActionKitchenDemoTarget.kitchen,
  place: pizzaTheActionKitchenDemoTarget.place,
  menu: pizzaTheActionKitchenDemoMenu,
  kitchenIngredients: pizzaTheActionKitchenDemoIngredientLinks,
  orders: pizzaTheActionKitchenDemoOrders,
  stations: pizzaTheActionKitchenDemoStations,
  supplierIngredientLinks: pizzaTheActionKitchenDemoSupplierIngredientLinks,
  miseTasks: pizzaTheActionKitchenDemoMiseTasks,
})

export const miseboxRestaurantKitchenDemoScenario = scenario({
  identity: miseboxRestaurantKitchenDemoIdentity,
  appSupport: miseboxRestaurantKitchenDemoTarget.appSupport,
  kitchen: miseboxRestaurantKitchenDemoTarget.kitchen,
  place: miseboxRestaurantKitchenDemoTarget.place,
  menu: miseboxRestaurantKitchenDemoMenu,
  kitchenIngredients: miseboxRestaurantKitchenDemoIngredientLinks,
  orders: miseboxRestaurantKitchenDemoOrders,
  stations: miseboxRestaurantKitchenDemoStations,
  supplierIngredientLinks:
    miseboxRestaurantKitchenDemoSupplierIngredientLinks,
  miseTasks: miseboxRestaurantKitchenDemoMiseTasks,
})

export const defaultKitchenDemoScenario = miseboxRestaurantKitchenDemoScenario
export const featuredMenuDemoScenario = defaultKitchenDemoScenario
export const featuredKioskDemoScenario = defaultKitchenDemoScenario
export const featuredServiceDemoScenario: KitchenDemoScenario = {
  ...deanosKitchenDemoScenario,
  orders: deanosKitchenDemoOrders,
}

export const kitchenDemoScenarios: KitchenDemoScenario[] = [
  defaultKitchenDemoScenario,
  deanosKitchenDemoScenario,
  pizzaTheActionKitchenDemoScenario,
]

export const kitchenDemoScenarioDescriptors: KitchenDemoScenarioDescriptor[] = [
  {
    kitchenId: miseboxRestaurantKitchenDemoIdentity.kitchenId,
    maturity: 'operational',
    operationCoverage: [
      'dishes',
      'ingredients',
      'menus',
      'mise',
      'orders',
      'stations',
      'suppliers',
      'tables',
    ],
    presentation: ['menu', 'kiosk', 'service'],
  },
  {
    kitchenId: deanosKitchenDemoIdentity.kitchenId,
    maturity: 'operational',
    operationCoverage: [
      'dishes',
      'ingredients',
      'menus',
      'mise',
      'orders',
      'recipes',
      'stations',
      'suppliers',
      'tables',
    ],
    presentation: ['menu', 'kiosk', 'service'],
  },
  {
    kitchenId: pizzaTheActionKitchenDemoIdentity.kitchenId,
    maturity: 'operational',
    operationCoverage: [
      'dishes',
      'ingredients',
      'menus',
      'mise',
      'orders',
      'stations',
      'suppliers',
      'tables',
    ],
    presentation: ['menu', 'kiosk', 'service'],
  },
]

const scenarioIds = kitchenDemoScenarios.map(value => value.kitchen.id).sort()
const descriptorIds = kitchenDemoScenarioDescriptors
  .map(value => value.kitchenId)
  .sort()
if (
  scenarioIds.length !== descriptorIds.length
  || scenarioIds.some((value, index) => value !== descriptorIds[index])
) {
  throw new Error('Every Kitchen Demo scenario requires one maturity descriptor.')
}

const miseboxDemoSupplierIds = [
  'alpine-foodservice',
  'bern-market-garden',
  'pantry-house',
]
const sameStringSet = (left: string[], right: string[]) => {
  const normalizedLeft = [...new Set(left)].sort()
  const normalizedRight = [...new Set(right)].sort()
  return (
    normalizedLeft.length === normalizedRight.length
    && normalizedLeft.every((value, index) => value === normalizedRight[index])
  )
}

if (
  kitchenDemoScenarios.length !== 3
  || kitchenDemoScenarios.some(scenario =>
    !scenario.menus.length
    || !scenario.dishes.length
    || !scenario.kitchenIngredients.length
    || !scenario.supplierIngredientLinks.length
    || !scenario.orders.length
    || !scenario.stations.length
    || !scenario.miseTasks.length
    || Number(scenario.kitchen.tables.count) <= 0
    || !sameStringSet(
      scenario.supplierIngredientLinks.map(link => link.supplier_id),
      miseboxDemoSupplierIds
    )
  )
) {
  throw new Error(
    'The Misebox Demo World requires exactly three operational Kitchens connected to the same three Suppliers.'
  )
}

export type { KitchenDemoScenario } from './core/types'
