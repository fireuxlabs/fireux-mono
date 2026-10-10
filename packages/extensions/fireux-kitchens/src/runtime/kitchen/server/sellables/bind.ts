import { randomUUID } from 'node:crypto'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import { createError, type H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import {
  serverKitchenMenusTarget,
  serverKitchenMenuSectionsTarget,
  serverKitchenMenuItemsTarget,
  serverKitchenDishesTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/targets'
import {
  readKitchenMutationActor,
  requireKitchenMutationAuthority,
} from '../core/mutation-authority'
import { readPlaceCurrencyCode } from 'fireux-places/runtime/place/utils/place-spine'
import { readKitchenSellable, readSellableForm } from '../../utils/sellable'
import type { SellableForm } from '../../models/sellable.model'
import { normalizeMenuItemPatch } from '../../../menu/utils/menu-item-patch'
import type { MenuItemPriceOption } from '../../../menu/models/menu-item.model'
import { serverKitchenSellablesTarget } from './target'
import { legacyPlacementSellable } from './legacy'

const conflict = (message: string): never => {
  throw createError({ statusCode: 409, statusMessage: message })
}

/** Explicit, idempotent adoption or reuse. Existing commercial fields remain frozen preimages. */
export async function bindKitchenMenuSellable(event: H3Event, input: unknown) {
  if (
    !input ||
    typeof input !== 'object' ||
    Array.isArray(input) ||
    Object.keys(input).some(
      (key) =>
        ![
          'kitchenId',
          'menuId',
          'sectionId',
          'itemId',
          'sellableId',
          'variantForms',
          'expectedPriceOptions',
        ].includes(key)
    )
  )
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid sellable binding input.',
    })
  const value = input as Record<string, unknown>
  const kitchenId = requireFirestoreDocumentId(value.kitchenId, 'Kitchen id')
  const menuId = requireFirestoreDocumentId(value.menuId, 'Menu id')
  const sectionId = requireFirestoreDocumentId(value.sectionId, 'Section id')
  const itemId = requireFirestoreDocumentId(value.itemId, 'Menu item id')
  const reuseId =
    value.sellableId === undefined
      ? ''
      : requireFirestoreDocumentId(value.sellableId, 'Sellable id')
  let variantForms: Array<SellableForm | null> | undefined
  let expectedPriceOptions: MenuItemPriceOption[] | undefined
  if (
    value.variantForms !== undefined &&
    !Array.isArray(value.expectedPriceOptions)
  )
    conflict('Review the current options before adding supplied forms.')
  try {
    if (value.variantForms !== undefined) {
      if (!Array.isArray(value.variantForms) || value.variantForms.length > 100)
        throw new Error('Supplied forms must be a bounded list.')
      variantForms = value.variantForms.map((form) =>
        form == null ? null : readSellableForm(form)
      )
    }
    if (value.expectedPriceOptions !== undefined)
      expectedPriceOptions = normalizeMenuItemPatch({
        price_options: value.expectedPriceOptions as MenuItemPriceOption[],
      }).price_options
  } catch {
    throw createError({
      statusCode: 400,
      statusMessage:
        'Review the existing prices and supplied forms before adopting.',
    })
  }
  const newId = randomUUID()
  const actor = await readKitchenMutationActor(event)

  return runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
    const access = await requireKitchenMutationAuthority(tx, actor, kitchenId)
    const target = serverKitchenMenuItemsTarget(kitchenId, menuId, sectionId)
    const [menu, section, item] = await Promise.all([
      tx.read(serverKitchenMenusTarget(kitchenId), menuId),
      tx.read(serverKitchenMenuSectionsTarget(kitchenId, menuId), sectionId),
      tx.read(target, itemId),
    ])
    if (!menu.exists || !section.exists || !item.exists)
      conflict('Menu placement is missing.')
    const current = item.data?.sellable_id ?? ''
    if (typeof current !== 'string' || current !== current.trim())
      conflict('The stored sellable binding is invalid.')
    if (current) {
      try {
        requireFirestoreDocumentId(current, 'Sellable id')
      } catch {
        conflict('The stored sellable binding is invalid.')
      }
    }
    if (current && reuseId && current !== reuseId)
      conflict('Placement already has commercial ownership.')
    const dishId = requireFirestoreDocumentId(item.data?.dish_id, 'Dish id')
    const dish = await tx.read(serverKitchenDishesTarget(kitchenId), dishId)
    if (!dish.exists) conflict('Menu Dish is missing.')
    if (dish.data?.kitchen_id !== kitchenId)
      conflict('The stored Dish identity is invalid.')
    const currency = readPlaceCurrencyCode(access.placeData)
    if (!currency) conflict('Kitchen currency is required.')
    const id = current || reuseId || newId
    const sellables = serverKitchenSellablesTarget(kitchenId)
    const existing = await tx.read(sellables, id)
    if (current || reuseId) {
      if (variantForms !== undefined && !current)
        conflict('Existing sellable forms cannot be replaced while binding.')
      if (!existing.exists) conflict('Referenced sellable is missing.')
      const sellable = readKitchenSellable(existing.data)
      if (
        sellable.dish_id !== dishId ||
        sellable.terms.currency !== currency ||
        sellable.status !== 'active'
      )
        conflict('Sellable does not match this Dish and currency.')
    } else {
      if (existing.exists) conflict('Sellable identity already exists.')
      if (variantForms !== undefined) {
        const currentOptions = legacyPlacementSellable(
          item.data!,
          currency,
          String
        )
        const reviewedOptions = legacyPlacementSellable(
          { ...item.data, price_options: expectedPriceOptions },
          currency,
          String
        )
        if (
          JSON.stringify(currentOptions.variants) !==
            JSON.stringify(reviewedOptions.variants) ||
          JSON.stringify(currentOptions.terms.prices) !==
            JSON.stringify(reviewedOptions.terms.prices)
        )
          conflict(
            'Menu options changed. Review them before adopting supplied forms.'
          )
      }
      const stamp = serverAuditStamp({
        by: actor.uid,
        appId: actor.runtimeAppId,
      })
      let adopted
      try {
        adopted = legacyPlacementSellable(
          item.data!,
          currency,
          (index) => `${id}-${index + 1}`,
          variantForms
        )
      } catch {
        throw createError({
          statusCode: 400,
          statusMessage:
            'Review the existing prices and supplied forms before adopting.',
        })
      }
      tx.create(sellables, id, { ...adopted, created: stamp, updated: stamp })
    }
    if (!current)
      tx.update(target, itemId, {
        sellable_id: id,
        updated: serverAuditStamp({ by: actor.uid, appId: actor.runtimeAppId }),
      })
    return {
      ok: true as const,
      sellableId: id,
      reused: Boolean(current || reuseId),
    }
  })
}
