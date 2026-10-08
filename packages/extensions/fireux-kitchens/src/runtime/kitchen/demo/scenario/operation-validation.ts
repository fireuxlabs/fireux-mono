import { deanosKitchenDemoOrderNumber } from '../operations/Orders/history'
import type {
  KitchenDemoScenarioAssembly,
  KitchenDemoScenarioInput,
} from './types'
import { createKitchenDemoValidationContext } from './validation-context'

export function validateKitchenDemoOperations(
  input: KitchenDemoScenarioInput,
  assembly: KitchenDemoScenarioAssembly
): string[] {
  const { menus, services, dishes, menuIds, stationIds } =
    createKitchenDemoValidationContext(input, assembly)

  const hasInvalidStation =
    stationIds.size !== input.stations.length ||
    input.stations.some(
      (station) =>
        station.kitchen_id !== input.identity.kitchenId ||
        !station.id ||
        !station.name
    )

  const team = [...(input.team ?? [])]

  const teamIds = new Set(team.map((member) => member.id))

  const kitchenTeamIds = input.access.teamIds

  const kitchenOperatorIds = input.access.operatorIds

  const hasInvalidTeam =
    teamIds.size !== team.length ||
    team.some((member) => !member.id || !member.name) ||
    kitchenTeamIds.length !== team.length ||
    new Set(kitchenTeamIds).size !== teamIds.size ||
    kitchenTeamIds.some((id) => !teamIds.has(id)) ||
    new Set(kitchenOperatorIds).size !== kitchenOperatorIds.length ||
    kitchenOperatorIds.some((id) => !teamIds.has(id)) ||
    input.access.kitchenId !== input.identity.kitchenId

  const hasInvalidOrder = (() => {
    const itemByMenuAndId = new Map(
      menus.flatMap((menu) =>
        menu.menuSections.flatMap(({ items }) =>
          items.map(
            (item) => [`${menu.kitchenMenu.id}:${item.id}`, item] as const
          )
        )
      )
    )
    const serviceNumbers = input.orders.map((order) => order.service_number)
    const sortedServiceNumbers = [...serviceNumbers].sort((a, b) => a - b)
    const hasInvalidCurrentSequence =
      services.length > 0 &&
      (new Set(serviceNumbers).size !== serviceNumbers.length ||
        sortedServiceNumbers.some(
          (number, index) => number !== sortedServiceNumbers[0]! + index
        ))

    return (
      hasInvalidCurrentSequence ||
      input.orders.some((order) => {
        const expectedSubtotalMinor = order.items.reduce((total, item) => {
          const menuItem = item.source_item_id
            ? itemByMenuAndId.get(`${order.menu_id}:${item.source_item_id}`)
            : undefined
          const priceOption = item.variant_label
            ? menuItem?.price_options.find(
                (option) => option.label === item.variant_label
              )
            : undefined
          const addOnMinor = (item.add_ons ?? []).reduce(
            (sum, addOn) => sum + Math.round(Number(addOn.price ?? 0) * 100),
            0
          )
          const expectedUnitMinor =
            Math.round(
              Number(priceOption?.price ?? menuItem?.price ?? 0) * 100
            ) + addOnMinor
          const unitPriceMinor = Math.round(Number(item.unit_price ?? 0) * 100)
          if (
            !menuItem ||
            !dishes.has(item.dish_id) ||
            menuItem.dish_id !== item.dish_id ||
            (menuItem.price_options.length > 0 &&
              (!priceOption ||
                item.variant_id !==
                  priceOption.label.toLowerCase().replaceAll(' ', '-'))) ||
            expectedUnitMinor !== unitPriceMinor ||
            !Number.isSafeInteger(item.quantity) ||
            item.quantity <= 0
          ) {
            return Number.NaN
          }
          return total + unitPriceMinor * item.quantity
        }, 0)
        const currentService = services.at(-1)

        return (
          order.kitchen_id !== input.identity.kitchenId ||
          !menuIds.has(order.menu_id) ||
          !order.items.length ||
          !Number.isSafeInteger(expectedSubtotalMinor) ||
          order.pricing.subtotal.amount_minor !== expectedSubtotalMinor ||
          order.pricing.delivery_fee.amount_minor !== 0 ||
          order.pricing.total.amount_minor !== expectedSubtotalMinor ||
          Boolean(
            currentService &&
              (order.service_id !== currentService.id ||
                order.order_number !==
                  deanosKitchenDemoOrderNumber(
                    currentService.date,
                    order.service_number
                  ))
          ) ||
          Boolean(
            order.payment.amount_chf !== undefined &&
              Math.round(order.payment.amount_chf * 100) !==
                order.pricing.total.amount_minor
          ) ||
          Boolean(
            order.updated.by &&
              order.updated.by !== 'menu' &&
              order.updated.by !== 'demo-operator' &&
              !teamIds.has(order.updated.by)
          )
        )
      })
    )
  })()

  return [
    hasInvalidStation && 'stations',
    hasInvalidTeam && 'team',
    hasInvalidOrder && 'orders',
  ].filter((item): item is string => Boolean(item))
}
