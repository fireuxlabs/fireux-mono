import { kitchenMenuCapacity } from '../utils/menu-capacity'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
import {
  appSubscriptionCapacity,
  hasAppSubscriptionCapacity,
} from 'fireux-core/runtime/app/utils/app-subscription-capacity'
import type { GuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { readKitchenCurrency } from '../../kitchen/utils/kitchen-readers'
import {
  buildMenuPayload,
  type MenuCreateInput,
} from '../utils/menu-create-input'
import { createError, type H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import {
  serverKitchenMenusTarget,
  serverKitchenMenuSectionsTarget,
  serverKitchenMenuItemsTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/targets'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import {
  readKitchenMutationActor,
  requireKitchenMutationAuthority,
} from '../../kitchen/server/core/mutation-authority'
import { normalizeMenuItemPatch } from '../utils/menu-item-patch'
import { syncKitchenMenuDirectory } from './directory/sync'
import type { MenuItem } from '../models/menu-item.model'

type MenuInput = { kitchenId?: unknown; menuId?: unknown }

export async function updateKitchenMenuItem(
  event: H3Event,
  input: MenuInput & {
    sectionId?: unknown
    itemId?: unknown
    changes?: unknown
  }
) {
  const kitchenId = requireFirestoreDocumentId(input?.kitchenId, 'Kitchen id')
  const menuId = requireFirestoreDocumentId(input?.menuId, 'Menu id')
  const sectionId = requireFirestoreDocumentId(input?.sectionId, 'Section id')
  const itemId = requireFirestoreDocumentId(input?.itemId, 'Item id')
  const actor = await readKitchenMutationActor(event)
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
  await runGuardedServerTransaction({ kind: 'runtime' }, async (mutations) => {
    // Subscription is account state. No tier removes essential menu operation.
    await requireKitchenMutationAuthority(mutations, actor, kitchenId)
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
    mutations.update(target, itemId, {
      ...changes,
      updated: serverAuditStamp({ by: actor.uid }),
    })
  })
  return { ok: true as const }
}

export async function unpublishKitchenMenu(event: H3Event, input: MenuInput) {
  const kitchenId = requireFirestoreDocumentId(input?.kitchenId, 'Kitchen id')
  const menuId = requireFirestoreDocumentId(input?.menuId, 'Menu id')
  const actor = await readKitchenMutationActor(event)
  await runGuardedServerTransaction({ kind: 'runtime' }, async (mutations) => {
    await requireKitchenMutationAuthority(mutations, actor, kitchenId)
    const target = serverKitchenMenusTarget(kitchenId)
    const menu = await mutations.read(target, menuId)
    if (!menu.exists)
      throw createError({
        statusCode: 404,
        statusMessage: 'Menu was not found.',
      })
    if (menu.data?.status === 'archived')
      throw createError({
        statusCode: 409,
        statusMessage: 'This menu is archived.',
      })
    mutations.update(target, menuId, {
      status: 'draft',
      updated: serverAuditStamp({ by: actor.uid }),
    })
  })
  // Public consumers check the scoped status. A retry also repairs its directory projection.
  await syncKitchenMenuDirectory({
    appId: actor.runtimeAppId,
    db: getRuntimeFirestore(),
    kitchenId,
    menuId,
    uid: actor.uid,
  })
  return { ok: true as const }
}

export async function requireMenuCreationCapacity(
  tx: GuardedServerTransaction,
  actor: Awaited<ReturnType<typeof readKitchenMutationActor>>,
  kitchenId: string
) {
  const access = await requireKitchenMutationAuthority(tx, actor, kitchenId)
  const limit = appSubscriptionCapacity(
    kitchenMenuCapacity,
    'kitchen.menus',
    access.subscription
  )
  if (limit !== null) {
    const menus = await tx.readAll(
      serverKitchenMenusTarget(kitchenId),
      Math.max(1, limit + 1)
    )
    if (
      !hasAppSubscriptionCapacity(
        kitchenMenuCapacity,
        'kitchen.menus',
        access.subscription,
        menus.length
      )
    ) {
      throw createError({
        statusCode: 403,
        statusMessage:
          'Your menu creation allowance has been reached. Existing menus remain available to manage.',
      })
    }
  }
  return access
}

export async function createKitchenMenu(
  event: H3Event,
  input: MenuCreateInput
) {
  const kitchenId = requireFirestoreDocumentId(input?.kitchenId, 'Kitchen id')
  const name = typeof input?.name === 'string' ? input.name.trim() : ''
  if (!name || name.length > 160)
    throw createError({
      statusCode: 400,
      statusMessage: 'Menu name must be 1–160 characters.',
    })
  if (
    input.description !== undefined &&
    (typeof input.description !== 'string' || input.description.length > 4000)
  )
    throw createError({
      statusCode: 400,
      statusMessage: 'Menu description must be text up to 4,000 characters.',
    })
  const menuId = requireFirestoreDocumentId(
    normalizeSlug(input.id || name),
    'Menu id'
  )
  if (input.status && input.status !== 'draft')
    throw createError({
      statusCode: 400,
      statusMessage: 'New menus must start as drafts.',
    })
  const actor = await readKitchenMutationActor(event)
  await runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
    const access = await requireMenuCreationCapacity(tx, actor, kitchenId)
    if (!readKitchenCurrency(access.rootData))
      throw createError({
        statusCode: 409,
        statusMessage: 'Set the Kitchen currency before creating menus.',
      })
    const target = serverKitchenMenusTarget(kitchenId)
    if ((await tx.read(target, menuId)).exists)
      throw createError({
        statusCode: 409,
        statusMessage:
          'A menu with this name already exists. Choose another name.',
      })
    const stamp = serverAuditStamp({ by: actor.uid, appId: actor.runtimeAppId })
    tx.create(target, menuId, {
      ...buildMenuPayload({ ...input, kitchenId, status: 'draft' }, name),
      created: stamp,
      updated: stamp,
    })
  })
  return { created: true, id: menuId }
}
