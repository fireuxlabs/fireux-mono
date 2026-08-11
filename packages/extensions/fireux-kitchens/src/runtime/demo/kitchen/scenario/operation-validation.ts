import { KITCHEN_MISE_WORKFLOW_STAGES } from '../../../models/kitchen/mise.model'
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
  const {
    menus,
    services,
    miseRequirements,
    dishes,
    ingredientIds,
    prepItemIds,
    recipeIds,
    menuIds,
    stationIds,
  } = createKitchenDemoValidationContext(input, assembly)

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
          || task.prep_item_ids.some(id => !prepItemIds.has(id))
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

  return [
    hasInvalidStation && 'stations',
    hasInvalidTeam && 'team',
    hasInvalidOrder && 'orders',
    hasInvalidMiseTask && 'mise tasks',
  ].filter((item): item is string => Boolean(item))
}
