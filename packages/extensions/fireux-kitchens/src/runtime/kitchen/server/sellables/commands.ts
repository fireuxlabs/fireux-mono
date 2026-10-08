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
import { readKitchenSellable } from '../../utils/sellable'
import { serverKitchenSellablesTarget } from './target'
import { legacyPlacementSellable } from './legacy'

const conflict = (message: string): never => {
  throw createError({ statusCode: 409, statusMessage: message })
}

/** Explicit, idempotent adoption or reuse. Existing commercial fields become frozen preimages. */
export async function bindKitchenMenuSellable(
  event: H3Event,
  input: {
    kitchenId?: unknown
    menuId?: unknown
    sectionId?: unknown
    itemId?: unknown
    sellableId?: unknown
    variantForms?: unknown
    expectedPriceOptions?: unknown
  }
) {
  const kitchenId = requireFirestoreDocumentId(input?.kitchenId, 'Kitchen id')
  const menuId = requireFirestoreDocumentId(input?.menuId, 'Menu id')
  const sectionId = requireFirestoreDocumentId(input?.sectionId, 'Section id')
  const itemId = requireFirestoreDocumentId(input?.itemId, 'Menu item id')
  const reuseId =
    input.sellableId === undefined
      ? ''
      : requireFirestoreDocumentId(input.sellableId, 'Sellable id')
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
    const current = String(item.data?.sellable_id || '')
    if (current && reuseId && current !== reuseId)
      conflict('Placement already has commercial ownership.')
    const dishId = requireFirestoreDocumentId(item.data?.dish_id, 'Dish id')
    const dish = await tx.read(serverKitchenDishesTarget(kitchenId), dishId)
    if (!dish.exists) conflict('Menu Dish is missing.')
    const currency = readPlaceCurrencyCode(access.placeData)
    if (!currency) conflict('Kitchen currency is required.')
    const id = current || reuseId || newId
    const sellables = serverKitchenSellablesTarget(kitchenId)
    const existing = await tx.read(sellables, id)
    if (current || reuseId) {
      if (input.variantForms !== undefined && !current)
        conflict('Existing sellable forms cannot be replaced while binding.')
      if (!existing.exists) conflict('Referenced sellable is missing.')
      const value = readKitchenSellable(existing.data)
      if (
        value.dish_id !== dishId ||
        value.terms.currency !== currency ||
        value.status !== 'active'
      )
        conflict('Sellable does not match this Dish and currency.')
    } else {
      if (existing.exists) conflict('Sellable identity already exists.')
      if (input.variantForms !== undefined) {
        if (!Array.isArray(input.expectedPriceOptions))
          conflict('Review the current options before adding supplied forms.')
        const currentOptions = legacyPlacementSellable(
          item.data!,
          currency,
          String
        )
        const reviewedOptions = legacyPlacementSellable(
          { ...item.data, price_options: input.expectedPriceOptions },
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
          input.variantForms
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
    return { ok: true, sellableId: id, reused: Boolean(current || reuseId) }
  })
}

/** The only commercial writer for an adopted placement. Variant identity is immutable here. */
export async function updateKitchenSellableTerms(
  event: H3Event,
  input: {
    kitchenId?: unknown
    sellableId?: unknown
    expectedRevision?: unknown
    terms?: unknown
  }
) {
  const kitchenId = requireFirestoreDocumentId(input?.kitchenId, 'Kitchen id')
  const sellableId = requireFirestoreDocumentId(
    input?.sellableId,
    'Sellable id'
  )
  const actor = await readKitchenMutationActor(event)
  return runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
    const access = await requireKitchenMutationAuthority(tx, actor, kitchenId)
    const target = serverKitchenSellablesTarget(kitchenId)
    const record = await tx.read(target, sellableId)
    if (!record.exists) conflict('Sellable is missing.')
    const current = readKitchenSellable(record.data)
    if (input.expectedRevision !== current.revision)
      conflict('Commercial terms changed. Reload before saving.')
    let next
    try {
      next = readKitchenSellable({
        ...current,
        terms: input.terms,
        revision: current.revision + 1,
      })
    } catch {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid sellable commercial terms.',
      })
    }
    if (next.terms.currency !== readPlaceCurrencyCode(access.placeData))
      conflict('Currency must match the Kitchen.')
    tx.update(target, sellableId, {
      terms: next.terms,
      revision: next.revision,
      updated: serverAuditStamp({ by: actor.uid, appId: actor.runtimeAppId }),
    })
    return { ok: true, kitchenId, sellableId, revision: next.revision }
  })
}
