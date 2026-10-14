import { createError, type H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import {
  readKitchenMutationActor,
  requireKitchenMutationAuthority,
} from '../../../kitchen/server/core/mutation-authority'
import { serverKitchenMenusTarget } from 'fireux-core/runtime/utils/firestore-mutations/targets'
import { normalizeMenuMetadataPatch } from '../../utils/menu-metadata'
import type { KitchenMenuUpdateInput } from '../../models/kitchen-menu-storage.model'
import { menuNameAndSlug, requireAvailableMenuSlug } from '../name'
import { ensureKitchenMenuRootEntry } from '../directory/root-entry'

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
  let changes: KitchenMenuUpdateInput & { slug?: string }
  try {
    changes = normalizeMenuMetadataPatch(value.changes)
  } catch (error) {
    throw createError({
      statusCode: 400,
      statusMessage:
        error instanceof Error ? error.message : 'Invalid Menu changes.',
    })
  }
  const renamed = Object.hasOwn(changes, 'name')
    ? menuNameAndSlug(event, changes.name)
    : undefined
  if (renamed) Object.assign(changes, renamed)
  const actor = await readKitchenMutationActor(event)
  return runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
    const access = await requireKitchenMutationAuthority(tx, actor, kitchenId)
    if (renamed && !['premium', 'business'].includes(access.subscription))
      throw createError({
        statusCode: 403,
        statusMessage: 'Editing Menu names requires Plus.',
      })
    const target = serverKitchenMenusTarget(kitchenId),
      menu = await tx.read(target, menuId)
    if (!menu.exists)
      throw createError({
        statusCode: 404,
        statusMessage: 'Menu was not found.',
      })
    if (renamed)
      await requireAvailableMenuSlug(tx, kitchenId, renamed.slug, menuId)
    const stamp = serverAuditStamp({ by: actor.uid, appId: actor.runtimeAppId })
    const next: Record<string, unknown> = {
      ...menu.data,
      ...changes,
      updated: stamp,
    }
    // The helper completes every projection read before queuing any writes.
    await ensureKitchenMenuRootEntry(tx, {
      appId: actor.runtimeAppId,
      kitchenId,
      menuId,
      menuData: next,
      stamp,
    })
    tx.update(target, menuId, { ...changes, updated: stamp })
    return { id: menuId, slug: String(next.slug || ''), kitchenId, menuId }
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
