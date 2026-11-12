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
import { normalizeMenuDocument } from '../../utils/records/metadata'

function fingerprint<T extends KitchenMenuReview>(review: T): T {
  const serialized = JSON.stringify(review)
  if (Buffer.byteLength(serialized) > 700_000)
    throw createError({
      statusCode: 409,
      statusMessage: 'This Menu is too large for a Menu Express review.',
    })
  review.revision = createHash('sha256').update(serialized).digest('hex')
  return review
}

/** Customer-safe review of one regular Menu, within its writer's transaction. */
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
    !['interactive', 'document'].includes(data.format) ||
    data.schedule === 'daily' ||
    (data.audience &&
      !['public', 'private_link'].includes(String(data.audience)))
  )
    throw createError({
      statusCode: 409,
      statusMessage: 'Choose an active regular Menu for this delivery.',
    })
  const identity = {
    revision: '',
    name: String(data.name || ''),
    description: String(data.description || ''),
    kitchenSlug: String(kitchen.data?.identity?.slug || ''),
    menuSlug: String(data.slug || ''),
  }
  if (!identity.kitchenSlug || !identity.menuSlug)
    throw createError({
      statusCode: 409,
      statusMessage: 'Menu needs public slugs before review.',
    })
  if (data.format === 'document' || data.doc?.url) {
    let document
    try {
      document = normalizeMenuDocument(data.doc)
    } catch {
      throw createError({
        statusCode: 409,
        statusMessage: 'Upload a valid Menu document before review.',
      })
    }
    if (
      !document.url ||
      !['application/pdf', 'image/jpeg', 'image/png', 'image/webp'].includes(
        document.type || ''
      )
    )
      throw createError({
        statusCode: 409,
        statusMessage: 'Upload a PDF or image Menu before review.',
      })
    return fingerprint({
      ...identity,
      format: 'document',
      document: {
        url: document.url,
        name: document.name || identity.name,
        type: document.type!,
      },
    })
  }
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
  const result: Extract<KitchenMenuReview, { format: 'interactive' }> = {
    ...identity,
    format: 'interactive',
    currency,
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
    const items: (typeof result.sections)[number]['items'] = []
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
      if (
        pricing.choice_groups?.length ||
        pricing.add_ons?.length ||
        pricing.bottle_deposit
      )
        throw createError({
          statusCode: 409,
          statusMessage:
            'Menu Express review does not yet support choice groups, add-ons or deposits.',
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
  return fingerprint(result)
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
        ['interactive', 'document'].includes(record.data.format) &&
        record.data.schedule !== 'daily'
    )
    .map((record) => ({
      id: record.id,
      label: String(record.data.name || record.id),
      slug: String(record.data.slug || ''),
    }))
}
