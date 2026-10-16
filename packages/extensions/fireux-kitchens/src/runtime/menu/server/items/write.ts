import { randomUUID } from 'node:crypto'
import { createError, type H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import {
  readKitchenMutationActor,
  requireKitchenMutationAuthority,
} from '../../../kitchen/server/core/mutation-authority'
import {
  serverKitchenDishesTarget,
  serverKitchenMenusTarget,
  serverKitchenMenuSectionsTarget,
  serverKitchenMenuItemsTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/targets'
import { normalizeMenuItemPatch } from '../../utils/menu-item-patch'
import { kitchenPromotionsTarget } from '../../../kitchen/server/promotions/target'
import { normalizeKitchenPromotion } from '../../../kitchen/utils/promotions/pricing'
import type { MenuItem } from '../../models/menu-item.model'

export async function createKitchenMenuItem(event: H3Event, input: unknown) {
  if (!input || typeof input !== 'object' || Array.isArray(input))
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid Menu item input.',
    })
  const value = input as Record<string, unknown>
  if (
    Object.keys(value).some(
      (key) =>
        ![
          'kitchenId',
          'menuId',
          'sectionId',
          'dishId',
          'promotionId',
          'sort_order',
        ].includes(key)
    )
  )
    throw createError({
      statusCode: 400,
      statusMessage: 'Unsupported Menu item field.',
    })
  const kitchenId = requireFirestoreDocumentId(value.kitchenId, 'Kitchen id')
  const menuId = requireFirestoreDocumentId(value.menuId, 'Menu id')
  const sectionId = requireFirestoreDocumentId(value.sectionId, 'Section id')
  if (Boolean(value.dishId) === Boolean(value.promotionId))
    throw createError({
      statusCode: 400,
      statusMessage: 'Choose one Dish or meal deal.',
    })
  const dishId = value.dishId
    ? requireFirestoreDocumentId(value.dishId, 'Dish id')
    : ''
  const promotionId = value.promotionId
    ? requireFirestoreDocumentId(value.promotionId, 'Promotion id')
    : ''
  let terms: Partial<MenuItem>
  try {
    terms = normalizeMenuItemPatch({
      sort_order: value.sort_order ?? 0,
    } as Partial<MenuItem>)
  } catch (error) {
    throw createError({
      statusCode: 400,
      statusMessage: error instanceof Error ? error.message : 'Invalid item.',
    })
  }
  const actor = await readKitchenMutationActor(event),
    id = randomUUID()
  await runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
    const access = await requireKitchenMutationAuthority(tx, actor, kitchenId)
    const [menu, section, dish] = await Promise.all([
      tx.read(serverKitchenMenusTarget(kitchenId), menuId),
      tx.read(serverKitchenMenuSectionsTarget(kitchenId, menuId), sectionId),
      dishId
        ? tx.read(serverKitchenDishesTarget(kitchenId), dishId)
        : tx.read(kitchenPromotionsTarget(kitchenId), promotionId),
    ])
    if (!menu.exists || !section.exists || !dish.exists)
      throw createError({
        statusCode: 404,
        statusMessage:
          'Select an existing Menu section and Dish from this Kitchen.',
      })
    if (
      menu.data?.schedule === 'daily' &&
      !['premium', 'business'].includes(access.subscription)
    )
      throw createError({
        statusCode: 403,
        statusMessage: 'Daily specials require Plus.',
      })
    if (promotionId) {
      const { name, status, currency, days, price, groups } = dish.data || {}
      if (!Array.isArray(groups) || menu.data?.schedule === 'daily')
        throw createError({
          statusCode: 400,
          statusMessage: 'Choose a meal deal for a regular Menu.',
        })
      try {
        normalizeKitchenPromotion({
          name,
          status,
          currency,
          days,
          price,
          groups,
        })
      } catch {
        throw createError({
          statusCode: 400,
          statusMessage: 'This meal deal is incomplete.',
        })
      }
    }
    const stamp = serverAuditStamp({ by: actor.uid, appId: actor.runtimeAppId })
    tx.create(serverKitchenMenuItemsTarget(kitchenId, menuId, sectionId), id, {
      kitchen_id: kitchenId,
      menu_id: menuId,
      section_id: sectionId,
      ...(dishId ? { dish_id: dishId } : { promotion_id: promotionId }),
      ...terms,
      status: 'active',
      created: stamp,
      updated: stamp,
    })
  })
  return { id, kitchenId, menuId }
}

export async function updateKitchenMenuItem(
  event: H3Event,
  input: {
    kitchenId?: unknown
    menuId?: unknown
    sectionId?: unknown
    itemId?: unknown
    changes?: unknown
  }
) {
  if (
    !input ||
    typeof input !== 'object' ||
    Array.isArray(input) ||
    Object.keys(input).some(
      (key) =>
        !['kitchenId', 'menuId', 'sectionId', 'itemId', 'changes'].includes(key)
    )
  )
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid Menu item input.',
    })
  const kitchenId = requireFirestoreDocumentId(input?.kitchenId, 'Kitchen id')
  const menuId = requireFirestoreDocumentId(input?.menuId, 'Menu id')
  const sectionId = requireFirestoreDocumentId(input?.sectionId, 'Section id')
  const itemId = requireFirestoreDocumentId(input?.itemId, 'Item id')
  let changes: Partial<MenuItem>
  try {
    changes = normalizeMenuItemPatch(input?.changes as Partial<MenuItem>)
  } catch (error) {
    throw createError({
      statusCode: 400,
      statusMessage:
        error instanceof Error ? error.message : 'Invalid item changes.',
    })
  }
  const actor = await readKitchenMutationActor(event)
  await runGuardedServerTransaction({ kind: 'runtime' }, async (mutations) => {
    const access = await requireKitchenMutationAuthority(
      mutations,
      actor,
      kitchenId
    )
    const target = serverKitchenMenuItemsTarget(kitchenId, menuId, sectionId)
    const [menu, section, item] = await Promise.all([
      mutations.read(serverKitchenMenusTarget(kitchenId), menuId),
      mutations.read(
        serverKitchenMenuSectionsTarget(kitchenId, menuId),
        sectionId
      ),
      mutations.read(target, itemId),
    ])
    if (!menu.exists || !section.exists || !item.exists)
      throw createError({
        statusCode: 404,
        statusMessage: 'Menu item was not found in this kitchen.',
      })
    if (
      menu.data?.schedule === 'daily' &&
      !['premium', 'business'].includes(access.subscription)
    )
      throw createError({
        statusCode: 403,
        statusMessage: 'Daily specials require Plus.',
      })
    mutations.update(target, itemId, {
      ...changes,
      updated: serverAuditStamp({ by: actor.uid }),
    })
  })
  return { ok: true as const, kitchenId, menuId }
}
