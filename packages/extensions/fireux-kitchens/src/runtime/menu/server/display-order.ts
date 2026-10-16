import { createError, type H3Event } from 'h3'
import type { GuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import {
  serverKitchenMenusTarget,
  serverKitchenMenuSectionsTarget,
  serverKitchenMenuItemsTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/targets'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import {
  readKitchenMutationActor,
  requireKitchenMutationAuthority,
} from '../../kitchen/server/core/mutation-authority'

type Target = Parameters<GuardedServerTransaction['readAll']>[0]
const position = (value: unknown) =>
  Number.isFinite(Number(value)) ? Number(value) : 0
async function rows(tx: GuardedServerTransaction, target: Target) {
  const result = await tx.readAll(target, 401)
  if (result.length > 400)
    throw createError({
      statusCode: 409,
      statusMessage: 'This list is too large to reorder safely.',
    })
  return result
}

export async function nextMenuDisplayOrder(
  tx: GuardedServerTransaction,
  target: Target
) {
  const entries = await rows(tx, target)
  const next =
    Math.max(0, ...entries.map((row) => position(row.data.sort_order))) + 1
  if (!Number.isSafeInteger(next))
    throw createError({
      statusCode: 409,
      statusMessage: 'Normalize this list before adding another entry.',
    })
  return next
}

/** One adjacent move and rank normalization commit together; commercial terms are never written. */
export async function moveKitchenMenuEntry(event: H3Event, input: unknown) {
  if (!input || typeof input !== 'object' || Array.isArray(input))
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid display order input.',
    })
  const value = input as Record<string, unknown>
  if (
    Object.keys(value).some(
      (key) =>
        !['kitchenId', 'menuId', 'sectionId', 'itemId', 'direction'].includes(
          key
        )
    ) ||
    !['up', 'down'].includes(String(value.direction))
  )
    throw createError({
      statusCode: 400,
      statusMessage: 'Choose Move up or Move down.',
    })
  const kitchenId = requireFirestoreDocumentId(value.kitchenId, 'Kitchen id')
  const menuId = requireFirestoreDocumentId(value.menuId, 'Menu id')
  const sectionId = requireFirestoreDocumentId(value.sectionId, 'Section id')
  const itemId =
    value.itemId === undefined
      ? ''
      : requireFirestoreDocumentId(value.itemId, 'Item id')
  const actor = await readKitchenMutationActor(event)
  await runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
    const access = await requireKitchenMutationAuthority(tx, actor, kitchenId)
    const menuTarget = serverKitchenMenusTarget(kitchenId)
    const sectionTarget = serverKitchenMenuSectionsTarget(kitchenId, menuId)
    const [menu, section] = await Promise.all([
      tx.read(menuTarget, menuId),
      tx.read(sectionTarget, sectionId),
    ])
    if (!menu.exists || !section.exists)
      throw createError({
        statusCode: 404,
        statusMessage: 'Menu section not found.',
      })
    if (
      menu.data?.schedule === 'daily' &&
      !['premium', 'business'].includes(access.subscription)
    )
      throw createError({
        statusCode: 403,
        statusMessage: 'Daily specials require Plus.',
      })
    const target = itemId
      ? serverKitchenMenuItemsTarget(kitchenId, menuId, sectionId)
      : sectionTarget
    const entries = (await rows(tx, target))
      .filter(
        (row) =>
          itemId ||
          (row.data.status !== 'archived' &&
            (menu.data?.schedule !== 'daily' ||
              row.data.date === section.data?.date))
      )
      .sort(
        (a, b) =>
          position(a.data.sort_order) - position(b.data.sort_order) ||
          String(itemId ? a.data.dish_id : a.data.label).localeCompare(
            String(itemId ? b.data.dish_id : b.data.label)
          ) ||
          a.id.localeCompare(b.id)
      )
    const index = entries.findIndex((row) => row.id === (itemId || sectionId))
    if (index < 0)
      throw createError({
        statusCode: 404,
        statusMessage: 'Menu entry not found.',
      })
    const next = index + (value.direction === 'up' ? -1 : 1)
    if (next < 0 || next >= entries.length) return
    ;[entries[index], entries[next]] = [entries[next]!, entries[index]!]
    const stamp = serverAuditStamp({ by: actor.uid, appId: actor.runtimeAppId })
    for (const [rank, row] of entries.entries())
      if (row.data.sort_order !== rank)
        tx.update(target, row.id, { sort_order: rank, updated: stamp })
    tx.update(
      itemId ? sectionTarget : menuTarget,
      itemId ? sectionId : menuId,
      { updated: stamp }
    )
  })
  return { ok: true as const, kitchenId, menuId }
}
