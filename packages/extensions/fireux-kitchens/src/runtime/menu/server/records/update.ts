import { createError, type H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import {
  readKitchenMutationActor,
  requireKitchenMutationAuthority,
} from '../../../kitchen/server/core/mutation-authority'
import { serverKitchenMenusTarget } from '../../../kitchen/server/mutation-targets'
import { normalizeMenuMetadataPatch } from '../../utils/records/metadata'
import type { MenuUpdateInput } from '../../models/menu-storage.model'
import { resolveKitchenOperationHours } from '../../../kitchen/utils/kitchen-readers'
import { hoursWithinParent } from '../../../kitchen/utils/service-hours'

export async function updateKitchenMenu(event: H3Event, input: unknown) {
  if (!input || typeof input !== 'object' || Array.isArray(input))
    throw createError({ statusCode: 400, statusMessage: 'Invalid Menu input.' })
  const value = input as Record<string, unknown>
  if (
    Object.keys(value).some(
      (key) => !['kitchenId', 'menuId', 'changes'].includes(key)
    )
  )
    throw createError({
      statusCode: 400,
      statusMessage: 'Unsupported Menu field.',
    })
  const kitchenId = requireFirestoreDocumentId(value.kitchenId, 'Kitchen id')
  const menuId = requireFirestoreDocumentId(value.menuId, 'Menu id')
  let changes: MenuUpdateInput
  try {
    changes = normalizeMenuMetadataPatch(value.changes)
  } catch (error) {
    throw createError({
      statusCode: 400,
      statusMessage:
        error instanceof Error ? error.message : 'Invalid Menu changes.',
    })
  }
  const actor = await readKitchenMutationActor(event)
  return runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
    const access = await requireKitchenMutationAuthority(tx, actor, kitchenId)
    if (
      changes.name !== undefined &&
      !['pro', 'business'].includes(access.subscription)
    )
      throw createError({
        statusCode: 403,
        statusMessage: 'Editing Menu names requires Pro.',
      })
    const target = serverKitchenMenusTarget(kitchenId),
      menu = await tx.read(target, menuId)
    if (!menu.exists)
      throw createError({
        statusCode: 404,
        statusMessage: 'Menu was not found.',
      })
    if (menu.data?.schedule === 'daily' && changes.audience)
      throw createError({
        statusCode: 400,
        statusMessage: 'Audience settings are for ordinary Menus.',
      })
    if (changes.serving_hours !== undefined) {
      if (
        menu.data?.schedule === 'daily' ||
        menu.data?.format === 'document' ||
        menu.data?.doc?.url
      )
        throw createError({
          statusCode: 400,
          statusMessage: 'Serving windows apply to regular interactive Menus.',
        })
      if (
        changes.serving_hours &&
        !hoursWithinParent(
          changes.serving_hours,
          resolveKitchenOperationHours(access.rootData, access.placeData)
        )
      )
        throw createError({
          statusCode: 400,
          statusMessage: 'Menu hours must fit within Kitchen service hours.',
        })
    }
    const stamp = serverAuditStamp({ by: actor.uid, appId: actor.runtimeAppId })
    tx.update(target, menuId, { ...changes, updated: stamp })
    return {
      id: menuId,
      slug: String(menu.data?.slug || ''),
      kitchenId,
      menuId,
    }
  })
}

export async function renameKitchenMenu(
  event: H3Event,
  input: { kitchenId?: unknown; menuId?: unknown; name?: unknown }
) {
  if (
    !input ||
    typeof input !== 'object' ||
    Array.isArray(input) ||
    Object.keys(input).some(
      (key) => !['kitchenId', 'menuId', 'name'].includes(key)
    )
  )
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid Menu rename.',
    })
  return updateKitchenMenu(event, {
    kitchenId: input.kitchenId,
    menuId: input.menuId,
    changes: { name: input.name },
  })
}
