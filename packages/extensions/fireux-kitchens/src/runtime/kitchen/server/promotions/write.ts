import { FieldValue } from 'firebase-admin/firestore'
import { randomUUID } from 'node:crypto'
import { createError, type H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverKitchenDishesTarget } from 'fireux-core/runtime/utils/firestore-mutations/targets'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import { readPlaceCurrencyCode } from 'fireux-places/runtime/place/utils/place-spine'
import {
  readKitchenMutationActor,
  requireKitchenMutationAuthority,
} from '../core/mutation-authority'
import {
  normalizeKitchenPromotion,
  promotionsOverlap,
  promotionDishIds,
} from '../../utils/promotions/pricing'
import { kitchenPromotionsTarget } from './target'

export async function saveKitchenPromotion(event: H3Event, input: unknown) {
  const bad = (message: string) =>
    createError({ statusCode: 400, statusMessage: message })
  if (!input || typeof input !== 'object' || Array.isArray(input))
    throw bad('Invalid promotion input.')
  const data = input as Record<string, unknown>
  if (
    Object.keys(data).some(
      (key) => !['kitchenId', 'promotionId', 'promotion'].includes(key)
    )
  )
    throw bad('Unsupported promotion field.')
  const kitchenId = requireFirestoreDocumentId(data.kitchenId, 'Kitchen id')
  const promotionId =
    data.promotionId === undefined
      ? randomUUID()
      : requireFirestoreDocumentId(data.promotionId, 'Promotion id')
  let promotion: ReturnType<typeof normalizeKitchenPromotion>
  try {
    promotion = normalizeKitchenPromotion(data.promotion)
  } catch (cause) {
    throw bad(cause instanceof Error ? cause.message : 'Invalid promotion.')
  }
  const actor = await readKitchenMutationActor(event)
  return runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
    const access = await requireKitchenMutationAuthority(tx, actor, kitchenId)
    const target = kitchenPromotionsTarget(kitchenId)
    const existing = await tx.read(target, promotionId)
    if (data.promotionId !== undefined && !existing.exists)
      throw createError({
        statusCode: 404,
        statusMessage: 'Promotion not found.',
      })
    if (promotion.currency !== readPlaceCurrencyCode(access.placeData))
      throw bad('Promotion currency must match the venue currency.')
    const dishes = await tx.readMany(
      serverKitchenDishesTarget(kitchenId),
      promotionDishIds(promotion)
    )
    if (
      dishes.some(
        (dish) =>
          !dish.exists ||
          dish.data?.kitchen_id !== kitchenId ||
          dish.data?.status === 'archived'
      )
    )
      throw bad('Choose food and drinks from this Kitchen.')
    if (promotion.status === 'active' && 'dishes' in promotion) {
      const others = await tx.query(target, {
        field: 'status',
        op: '==',
        value: 'active',
        limit: 100,
      })
      if (others.length >= 100)
        throw bad('Too many active promotions to update safely.')
      if (
        others.some(
          (row) =>
            row.id !== promotionId &&
            promotionsOverlap(promotion, row.data as typeof promotion)
        )
      )
        throw createError({
          statusCode: 409,
          statusMessage:
            'Another active promotion includes one of these dishes on the same days. Pause it or choose different days.',
        })
    }
    const stamp = serverAuditStamp({ by: actor.uid, appId: actor.runtimeAppId })
    if (existing.exists)
      tx.update(target, promotionId, {
        ...promotion,
        ...('groups' in promotion
          ? { dishes: FieldValue.delete() }
          : { price: FieldValue.delete(), groups: FieldValue.delete() }),
        updated: stamp,
      })
    else
      tx.create(target, promotionId, {
        ...promotion,
        kitchen_id: kitchenId,
        created: stamp,
        updated: stamp,
      })
    return { id: promotionId }
  })
}
