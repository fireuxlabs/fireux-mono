import { randomUUID } from 'node:crypto'
import { createError, type H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import {
  serverKitchenMenusTarget,
  serverKitchenMenuSectionsTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/targets'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import { readPlaceCurrencyCode } from 'fireux-places/runtime/place/utils/place-spine'
import {
  readKitchenMutationActor,
  requireKitchenMutationAuthority,
} from '../core/mutation-authority'
import {
  normalizeKitchenPromotion,
  normalizePromotionPrice,
  promotionsOverlap,
} from '../../utils/promotions/pricing'
import { kitchenPromotionsTarget } from './target'

export async function saveKitchenPromotion(
  event: H3Event,
  input: unknown,
  migrate = false
) {
  const bad = (message: string) =>
    createError({ statusCode: 400, statusMessage: message })
  if (!input || typeof input !== 'object' || Array.isArray(input))
    throw bad('Invalid promotion input.')
  const data = input as Record<string, unknown>
  const allowed = migrate
    ? ['kitchenId', 'menuId']
    : ['kitchenId', 'promotionId', 'promotion']
  if (Object.keys(data).some((key) => !allowed.includes(key)))
    throw bad('Unsupported promotion field.')
  const kitchenId = requireFirestoreDocumentId(data.kitchenId, 'Kitchen id')
  let promotion: ReturnType<typeof normalizeKitchenPromotion> | undefined
  if (!migrate) {
    try {
      promotion = normalizeKitchenPromotion(data.promotion)
    } catch (cause) {
      throw bad(cause instanceof Error ? cause.message : 'Invalid promotion.')
    }
  }
  const menuId = requireFirestoreDocumentId(
    migrate ? data.menuId : promotion!.menu_id,
    'Menu id'
  )
  const promotionId = migrate
    ? `menu-${menuId}`
    : data.promotionId === undefined
      ? randomUUID()
      : requireFirestoreDocumentId(data.promotionId, 'Promotion id')
  const actor = await readKitchenMutationActor(event)
  return runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
    const access = await requireKitchenMutationAuthority(tx, actor, kitchenId)
    const menuTarget = serverKitchenMenusTarget(kitchenId)
    const menu = await tx.read(menuTarget, menuId)
    const target = kitchenPromotionsTarget(kitchenId)
    const existing = await tx.read(target, promotionId)
    if (
      migrate &&
      menu.exists &&
      existing.exists &&
      !menu.data?.pricing &&
      (existing.data?.migration as { source?: string } | undefined)?.source ===
        `kitchens/${kitchenId}/menus/${menuId}`
    )
      return { id: promotionId }
    if (
      !menu.exists ||
      menu.data?.status === 'archived' ||
      menu.data?.schedule === 'daily' ||
      menu.data?.format === 'document' ||
      (menu.data?.doc as { url?: string })?.url
    )
      throw bad('Choose an ordinary interactive Menu.')
    let next = promotion
    if (migrate) {
      if (existing.exists)
        throw createError({
          statusCode: 409,
          statusMessage: 'The migration destination already exists.',
        })
      const old = normalizePromotionPrice(menu.data?.pricing)
      if (!old) throw bad('This Menu has no scheduled price to move.')
      next = normalizeKitchenPromotion({
        kind: 'fixed_price',
        name: old.label,
        status: 'active',
        menu_id: menuId,
        section_ids: old.section_ids,
        currency: old.currency,
        amount_minor: old.amount_minor,
        days: old.days,
      })
    } else if (data.promotionId !== undefined && !existing.exists)
      throw createError({
        statusCode: 404,
        statusMessage: 'Promotion not found.',
      })
    if (next!.currency !== readPlaceCurrencyCode(access.placeData))
      throw bad('Promotion currency must match the venue currency.')
    for (const sectionId of next!.section_ids) {
      const section = await tx.read(
        serverKitchenMenuSectionsTarget(kitchenId, menuId),
        sectionId
      )
      if (!section.exists || section.data?.status === 'archived')
        throw bad('Choose active sections from this Menu.')
    }
    const others = await tx.query(target, {
      field: 'menu_id',
      op: '==',
      value: menuId,
      limit: 100,
    })
    if (others.length >= 100)
      throw bad('This Menu has too many promotions to update safely.')
    if (
      others.some(
        (row) =>
          row.id !== promotionId &&
          promotionsOverlap(next!, row.data as typeof next & {})
      )
    )
      throw createError({
        statusCode: 409,
        statusMessage:
          'Another active promotion covers these items on the same days. Pause it or choose different days.',
      })
    const stamp = serverAuditStamp({ by: actor.uid, appId: actor.runtimeAppId })
    if (existing.exists)
      tx.update(target, promotionId, { ...next!, updated: stamp })
    else
      tx.create(target, promotionId, {
        ...next!,
        kitchen_id: kitchenId,
        created: stamp,
        updated: stamp,
        ...(migrate
          ? {
              migration: {
                source: `kitchens/${kitchenId}/menus/${menuId}`,
                previous_pricing: menu.data!.pricing,
                at: stamp,
              },
            }
          : {}),
      })
    if (migrate)
      tx.update(menuTarget, menuId, { pricing: null, updated: stamp })
    return { id: promotionId }
  })
}
