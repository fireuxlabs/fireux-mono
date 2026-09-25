import { createError } from 'h3'
import type { DocumentData } from 'firebase-admin/firestore'
import { serverKitchenSellablesTarget } from '../../../kitchen/server/sellables/target'
import { projectSellable } from '../../../kitchen/utils/sellable'
import type { GuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import {
  serverKitchenMenuSectionsTarget,
  serverKitchenMenuItemsTarget,
  serverKitchenDishesTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/targets'

const text = (value: unknown) => String(value ?? '').trim()

async function activeRecords(
  tx: GuardedServerTransaction,
  target: Parameters<GuardedServerTransaction['readAll']>[0]
) {
  const records: Array<{ id: string; data: DocumentData }> = []
  let afterId: string | undefined
  while (true) {
    const page = await tx.readAll(target, 1000, afterId)
    records.push(
      ...page.filter((record) => text(record.data.status) !== 'archived')
    )
    if (page.length < 1000) return records
    afterId = page.at(-1)!.id
  }
}

export async function assertKitchenMenuCanPublish(
  tx: GuardedServerTransaction,
  input: { kitchenId: string; menuId: string; menuData: DocumentData }
) {
  if (input.menuData.schedule === 'daily')
    throw createError({
      statusCode: 400,
      statusMessage:
        'Daily menus are available in the workspace. Public daily-menu browsing is not available yet.',
    })
  if (text(input.menuData.doc?.url)) return
  const sections = await activeRecords(
    tx,
    serverKitchenMenuSectionsTarget(input.kitchenId, input.menuId)
  )
  if (!sections.length)
    throw createError({
      statusCode: 400,
      statusMessage: 'Menu needs at least one section',
    })
  let itemCount = 0
  for (const section of sections) {
    const items = await activeRecords(
      tx,
      serverKitchenMenuItemsTarget(input.kitchenId, input.menuId, section.id)
    )
    itemCount += items.length
    for (const item of items) {
      const dishId = text(item.data.dish_id)
      if (!dishId)
        throw createError({
          statusCode: 400,
          statusMessage: 'Every menu item needs a dish',
        })
      const dish = await tx.read(
        serverKitchenDishesTarget(input.kitchenId),
        dishId
      )
      if (!dish.exists)
        throw createError({
          statusCode: 400,
          statusMessage: `Menu item references missing dish: ${dishId}`,
        })
      if (item.data.sellable_id) {
        const sellableId = text(item.data.sellable_id)
        const sellable = await tx.read(
          serverKitchenSellablesTarget(input.kitchenId),
          sellableId
        )
        if (!sellable.exists)
          throw createError({
            statusCode: 409,
            statusMessage: 'Menu sellable is missing.',
          })
        projectSellable(sellableId, sellable.data, dishId)
      }
    }
  }
  if (!itemCount)
    throw createError({
      statusCode: 400,
      statusMessage: 'Menu needs at least one item',
    })
}
