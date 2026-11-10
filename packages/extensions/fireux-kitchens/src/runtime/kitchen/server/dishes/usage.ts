import { createError } from 'h3'
import { readRecordString } from 'fireux-core/runtime/server/utils/records/read'
import type { GuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import {
  serverKitchenMenusTarget,
  serverKitchenMenuSectionsTarget,
  serverKitchenMenuItemsTarget,
} from '../mutation-targets'
import { kitchenPromotionsTarget } from '../promotions/target'
import type { DishUsage } from '../../models/dish-usage.model'

type UsageReader = Pick<GuardedServerTransaction, 'readAll' | 'query'>
const text = (value: unknown) => (typeof value === 'string' ? value : '')

/** All saved references count, including paused Promotions and archived placements. */
export async function readDishUsage(
  reader: UsageReader,
  kitchenId: string,
  dishId: string
): Promise<DishUsage[]> {
  async function all(target: Parameters<UsageReader['readAll']>[0]) {
    const rows = await reader.readAll(target, 1000)
    if (rows.length === 1000)
      throw createError({
        statusCode: 409,
        statusMessage: 'Too many records to verify Dish usage safely.',
      })
    return rows
  }
  async function usesDish(target: Parameters<UsageReader['readAll']>[0]) {
    const matches = await reader.query(target, {
      field: 'dish_id',
      op: '==',
      value: dishId,
      limit: 1,
    })
    if (matches.length) return true
    // Menu rendering trims stored Dish references, including historical values.
    let afterId: string | undefined
    for (;;) {
      const items = await reader.readAll(target, 100, afterId)
      if (
        items.some(({ data }) => readRecordString(data, 'dish_id') === dishId)
      )
        return true
      if (items.length < 100) return false
      afterId = items.at(-1)!.id
    }
  }
  const usages: DishUsage[] = []
  const menus = await all(serverKitchenMenusTarget(kitchenId))
  for (const menu of menus) {
    const sections = await all(
      serverKitchenMenuSectionsTarget(kitchenId, menu.id)
    )
    for (const section of sections) {
      if (
        await usesDish(
          serverKitchenMenuItemsTarget(kitchenId, menu.id, section.id)
        )
      )
        usages.push({
          kind: 'menu',
          id: menu.id,
          name: text(menu.data.name) || menu.id,
          section: text(section.data.label) || section.id,
          to: `/workspace/kitchen/menu/menus/${encodeURIComponent(text(menu.data.slug) || menu.id)}/${encodeURIComponent(section.id)}`,
        })
    }
  }
  const promotions = await all(kitchenPromotionsTarget(kitchenId))
  for (const promotion of promotions) {
    const data = promotion.data
    const choices = Array.isArray(data.groups)
      ? data.groups.flatMap((group: any) =>
          Array.isArray(group?.dishes) ? group.dishes : []
        )
      : Array.isArray(data.dishes)
        ? data.dishes
        : []
    if (choices.some((choice: any) => choice?.dishId === dishId))
      usages.push({
        kind: 'promotion',
        id: promotion.id,
        name: text(data.name) || promotion.id,
        to: '/workspace/kitchen/menu/promotions',
      })
  }
  return usages
}
