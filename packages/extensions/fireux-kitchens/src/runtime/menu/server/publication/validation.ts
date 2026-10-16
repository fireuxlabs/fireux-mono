import { normalizeMenuItemPatch } from '../../utils/menu-item-patch'
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
  input: {
    kitchenId: string
    menuId: string
    menuData: DocumentData
    currencyCode?: string
    date?: string
  }
) {
  if (
    input.menuData.audience !== undefined &&
    !['public', 'private_link'].includes(String(input.menuData.audience))
  )
    throw createError({
      statusCode: 409,
      statusMessage: 'Protected group access is not configured.',
    })
  if (input.menuData.schedule === 'daily' && !input.date)
    throw createError({
      statusCode: 400,
      statusMessage:
        'Publish a specific date from the daily Menu Publishing view.',
    })
  if (text(input.menuData.doc?.url)) return
  if (input.menuData.format === 'document')
    throw createError({
      statusCode: 409,
      statusMessage: 'Upload a Menu document before publishing.',
    })
  const sections = (
    await activeRecords(
      tx,
      serverKitchenMenuSectionsTarget(input.kitchenId, input.menuId)
    )
  ).filter((section) => !input.date || section.data.date === input.date)
  if (!sections.length)
    throw createError({
      statusCode: 400,
      statusMessage: 'Menu needs at least one section',
    })
  let itemCount = 0
  for (const section of sections) {
    if (input.date && !text(section.data.label))
      throw createError({
        statusCode: 400,
        statusMessage: 'Every daily selection needs a name.',
      })
    const items = await activeRecords(
      tx,
      serverKitchenMenuItemsTarget(input.kitchenId, input.menuId, section.id)
    )
    if (input.date && !items.length)
      throw createError({
        statusCode: 400,
        statusMessage: 'Every daily selection needs at least one item.',
      })
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
      if (
        !dish.exists ||
        (input.date &&
          (dish.data?.status === 'archived' || !text(dish.data?.name)))
      )
        throw createError({
          statusCode: 400,
          statusMessage: `Menu item references missing dish: ${dishId}`,
        })
      if (input.date && !item.data.sellable_id) {
        try {
          normalizeMenuItemPatch({
            price: item.data.price,
            ...(item.data.price_options !== undefined
              ? { price_options: item.data.price_options }
              : {}),
            ...(item.data.add_ons !== undefined
              ? { add_ons: item.data.add_ons }
              : {}),
          })
        } catch (error) {
          throw createError({
            statusCode: 400,
            statusMessage:
              error instanceof Error
                ? error.message
                : 'Invalid daily item prices.',
          })
        }
      }
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
        const terms = projectSellable(sellableId, sellable.data, dishId)
        if (input.date && terms.sellable_currency !== input.currencyCode)
          throw createError({
            statusCode: 409,
            statusMessage: 'Daily item currency must match the Place currency.',
          })
      }
    }
  }
  if (!itemCount)
    throw createError({
      statusCode: 400,
      statusMessage: 'Menu needs at least one item',
    })
}
