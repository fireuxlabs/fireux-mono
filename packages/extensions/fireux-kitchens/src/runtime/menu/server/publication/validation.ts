import {
  menuPublicationReadiness,
  type ReadinessSection,
} from '../../utils/publication-readiness'
import { kitchenPromotionsTarget } from '../../../kitchen/server/promotions/target'
import { readDishPricing } from '../../../kitchen/utils/dish-pricing'
import { createError } from 'h3'
import type { DocumentData } from 'firebase-admin/firestore'
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
  if (!input.date) {
    const content: ReadinessSection[] = []
    const dishes = new Map<string, DocumentData>()
    const promotions = new Map<string, DocumentData>()
    const readDish = async (id: string) => {
      if (!id || dishes.has(id)) return
      const dish = await tx.read(serverKitchenDishesTarget(input.kitchenId), id)
      if (dish.exists) dishes.set(id, dish.data || {})
    }
    for (const section of sections) {
      const items = await activeRecords(
        tx,
        serverKitchenMenuItemsTarget(input.kitchenId, input.menuId, section.id)
      )
      content.push({
        id: section.id,
        label: text(section.data.label),
        items: items.map((item) => ({ ...item.data, id: item.id })),
      })
      for (const item of items) {
        await readDish(text(item.data.dish_id))
        const id = text(item.data.promotion_id)
        if (!id || promotions.has(id)) continue
        const stored = await tx.read(
          kitchenPromotionsTarget(input.kitchenId),
          id
        )
        if (!stored.exists) continue
        promotions.set(id, stored.data || {})
        for (const group of Array.isArray(stored.data?.groups)
          ? stored.data!.groups
          : [])
          for (const choice of Array.isArray(group?.dishes) ? group.dishes : [])
            await readDish(text(choice?.dishId))
      }
    }
    const readiness = menuPublicationReadiness(
      content,
      dishes,
      promotions,
      input.currencyCode
    )
    if (readiness.issues.length) {
      const issue = readiness.issues[0]!
      throw createError({
        statusCode: 400,
        statusMessage: `${issue.section}: ${issue.name} — ${issue.reason}`,
        data: { readiness },
      })
    }
    if (!readiness.availableCount)
      throw createError({
        statusCode: 400,
        statusMessage: 'Menu needs at least one item',
        data: { readiness },
      })
    return
  }
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
      if (item.data.promotion_id)
        throw createError({
          statusCode: 400,
          statusMessage: 'Choose one Dish or meal deal in a regular Menu.',
        })
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
      try {
        readDishPricing(dish.data || {})
      } catch (cause) {
        throw createError({
          statusCode: 400,
          statusMessage:
            cause instanceof Error ? cause.message : 'Invalid Dish pricing.',
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
