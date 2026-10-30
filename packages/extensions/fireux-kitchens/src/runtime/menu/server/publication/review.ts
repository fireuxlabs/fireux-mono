import { createHash } from 'node:crypto'
import { createError } from 'h3'
import type { GuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { PLACE_MUTATION_TARGETS } from 'fireux-places/runtime/place/server/mutation-targets'
import {
  KITCHEN_MUTATION_TARGETS,
  serverKitchenMenusTarget,
  serverKitchenMenuSectionsTarget,
  serverKitchenMenuItemsTarget,
  serverKitchenDishesTarget,
} from '../../../kitchen/server/mutation-targets'
import { readDishPricing } from '../../../kitchen/utils/dish-pricing'
import type { KitchenMenuReview } from '../../models/menu-review.model'

/** Customer-safe review of one regular interactive Menu, within its writer's transaction. */
export async function readKitchenMenuReview(
  tx: GuardedServerTransaction,
  kitchenId: string,
  menuId: string
): Promise<KitchenMenuReview> {
  const [kitchen, place, menu] = await Promise.all([
    tx.read(KITCHEN_MUTATION_TARGETS.kitchens, kitchenId),
    tx.read(PLACE_MUTATION_TARGETS.places, kitchenId),
    tx.read(serverKitchenMenusTarget(kitchenId), menuId),
  ])
  const data = menu.data
  if (
    !kitchen.exists ||
    !place.exists ||
    !data ||
    data.status === 'archived' ||
    data.format !== 'interactive' ||
    data.schedule === 'daily' ||
    (data.audience &&
      !['public', 'private_link'].includes(String(data.audience)))
  )
    throw createError({
      statusCode: 409,
      statusMessage:
        'Choose an active regular interactive Menu for this delivery.',
    })
  const currency = String(place.data?.default_currency_code || '')
  if (!/^[A-Z]{3}$/.test(currency))
    throw createError({
      statusCode: 409,
      statusMessage: 'Set the Place currency before review.',
    })
  const sections = await tx.readAll(
    serverKitchenMenuSectionsTarget(kitchenId, menuId),
    101
  )
  if (sections.length > 100)
    throw createError({
      statusCode: 409,
      statusMessage: 'Menu Express supports up to 100 sections.',
    })
  const result: KitchenMenuReview = {
    revision: '',
    name: String(data.name || ''),
    description: String(data.description || ''),
    currency,
    kitchenSlug: String(kitchen.data?.identity?.slug || ''),
    menuSlug: String(data.slug || ''),
    sections: [],
  }
  for (const section of sections
    .filter((s) => s.data.status !== 'archived')
    .sort(
      (a, b) =>
        Number(a.data.sort_order || 0) - Number(b.data.sort_order || 0) ||
        a.id.localeCompare(b.id)
    )) {
    const rows = await tx.readAll(
      serverKitchenMenuItemsTarget(kitchenId, menuId, section.id),
      101
    )
    if (rows.length > 100)
      throw createError({
        statusCode: 409,
        statusMessage: 'Menu Express supports up to 100 items per section.',
      })
    const items: KitchenMenuReview['sections'][number]['items'] = []
    for (const row of rows
      .filter((r) => r.data.status !== 'archived')
      .sort(
        (a, b) =>
          Number(a.data.sort_order || 0) - Number(b.data.sort_order || 0) ||
          a.id.localeCompare(b.id)
      )) {
      if (!row.data.dish_id || row.data.promotion_id)
        throw createError({
          statusCode: 409,
          statusMessage:
            'Menu Express review currently supports individual Dishes.',
        })
      const dish = await tx.read(
        serverKitchenDishesTarget(kitchenId),
        String(row.data.dish_id)
      )
      if (!dish.exists || dish.data?.status === 'archived')
        throw createError({
          statusCode: 409,
          statusMessage: 'A Menu Dish is unavailable.',
        })
      const pricing = readDishPricing(dish.data!)
      if (pricing.add_ons?.length || pricing.bottle_deposit)
        throw createError({
          statusCode: 409,
          statusMessage:
            'Menu Express review does not yet support add-ons or deposits.',
        })
      items.push({
        id: row.id,
        name: String(dish.data?.name || ''),
        description: String(dish.data?.description || ''),
        price: pricing.price,
        options: pricing.price_options || [],
      })
    }
    result.sections.push({
      id: section.id,
      label: String(section.data.label || ''),
      items,
    })
  }
  if (
    !result.sections.some((s) => s.items.length) ||
    !result.kitchenSlug ||
    !result.menuSlug
  )
    throw createError({
      statusCode: 409,
      statusMessage: 'Menu needs content and public slugs before review.',
    })
  const serialized = JSON.stringify(result)
  if (Buffer.byteLength(serialized) > 700_000)
    throw createError({
      statusCode: 409,
      statusMessage: 'This Menu is too large for a Menu Express review.',
    })
  result.revision = createHash('sha256').update(serialized).digest('hex')
  return result
}

export async function readKitchenMenuReviewChoices(
  tx: GuardedServerTransaction,
  kitchenId: string
) {
  const records = await tx.readAll(serverKitchenMenusTarget(kitchenId), 1000)
  return records
    .filter(
      (record) =>
        record.data.status !== 'archived' &&
        record.data.format === 'interactive' &&
        record.data.schedule !== 'daily'
    )
    .map((record) => ({
      id: record.id,
      label: String(record.data.name || record.id),
      slug: String(record.data.slug || ''),
    }))
}
