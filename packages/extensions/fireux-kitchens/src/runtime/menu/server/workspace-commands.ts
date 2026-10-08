import { kitchenMenuCapacity } from '../utils/menu-capacity'
import { randomUUID } from 'node:crypto'
import { menuNameAndSlug, requireAvailableMenuSlug } from './name'
import {
  appSubscriptionCapacity,
  hasAppSubscriptionCapacity,
} from 'fireux-core/runtime/app/utils/app-subscription-capacity'
import type { GuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { readPlaceCurrencyCode } from 'fireux-places/runtime/place/utils/place-spine'
import {
  buildMenuPayload,
  type MenuCreateInput,
} from '../utils/menu-create-input'
import { createError, type H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import {
  serverKitchenDishesTarget,
  serverKitchenMenusTarget,
  serverKitchenMenuSectionsTarget,
  serverKitchenMenuItemsTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/targets'
import {
  readKitchenMutationActor,
  requireKitchenMutationAuthority,
} from '../../kitchen/server/core/mutation-authority'
import { normalizeMenuItemPatch } from '../utils/menu-item-patch'
import { ensureKitchenMenuRootEntry } from './directory/root-entry'
import { FIRESTORE_MUTATION_TARGETS } from 'fireux-core/runtime/utils/firestore-mutations/targets'
import type { MenuItem } from '../models/menu-item.model'

type MenuInput = { kitchenId?: unknown; menuId?: unknown }

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
          'price',
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
  const dishId = requireFirestoreDocumentId(value.dishId, 'Dish id')
  let terms: Partial<MenuItem>
  try {
    terms = normalizeMenuItemPatch({
      price: value.price ?? 0,
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
    await requireKitchenMutationAuthority(tx, actor, kitchenId)
    const [menu, section, dish] = await Promise.all([
      tx.read(serverKitchenMenusTarget(kitchenId), menuId),
      tx.read(serverKitchenMenuSectionsTarget(kitchenId, menuId), sectionId),
      tx.read(serverKitchenDishesTarget(kitchenId), dishId),
    ])
    if (!menu.exists || !section.exists || !dish.exists)
      throw createError({
        statusCode: 404,
        statusMessage:
          'Select an existing Menu section and Dish from this Kitchen.',
      })
    const stamp = serverAuditStamp({ by: actor.uid, appId: actor.runtimeAppId })
    tx.create(serverKitchenMenuItemsTarget(kitchenId, menuId, sectionId), id, {
      kitchen_id: kitchenId,
      menu_id: menuId,
      section_id: sectionId,
      dish_id: dishId,
      ...terms,
      price_options: [],
      add_ons: [],
      status: 'active',
      created: stamp,
      updated: stamp,
    })
  })
  return { id, kitchenId, menuId }
}

export async function updateKitchenMenuItem(
  event: H3Event,
  input: MenuInput & {
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
    if (
      item.data?.sellable_id &&
      ['price', 'price_options', 'add_ons'].some((key) => key in changes)
    )
      throw createError({
        statusCode: 409,
        statusMessage:
          'This placement uses shared sellable terms. Edit those terms instead.',
      })
    mutations.update(target, itemId, {
      ...changes,
      updated: serverAuditStamp({ by: actor.uid }),
    })
  })
  return { ok: true as const, kitchenId, menuId }
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
  let { name, slug } = menuNameAndSlug(event, input?.name)
  if (
    input.description !== undefined &&
    (typeof input.description !== 'string' || input.description.length > 4000)
  )
    throw createError({
      statusCode: 400,
      statusMessage: 'Menu description must be text up to 4,000 characters.',
    })
  const menuId = randomUUID()
  if (
    input.schedule !== undefined &&
    !['regular', 'daily'].includes(input.schedule)
  )
    throw createError({
      statusCode: 400,
      statusMessage: 'Choose a valid menu schedule.',
    })
  if (input.status && input.status !== 'draft')
    throw createError({
      statusCode: 400,
      statusMessage: 'New menus must start as drafts.',
    })
  const actor = await readKitchenMutationActor(event)
  await runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
    const access = await requireMenuCreationCapacity(tx, actor, kitchenId)
    if (
      input.schedule === 'daily' &&
      !['premium', 'business'].includes(access.subscription)
    )
      throw createError({
        statusCode: 403,
        statusMessage: 'Daily menus require Plus.',
      })
    if (!readPlaceCurrencyCode(access.placeData))
      throw createError({
        statusCode: 409,
        statusMessage: 'Set the Kitchen currency before creating menus.',
      })
    const target = serverKitchenMenusTarget(kitchenId)
    if (access.subscription === 'free') {
      if (slug !== 'food' && slug !== 'drinks')
        throw createError({
          statusCode: 403,
          statusMessage: 'Custom Menu names require Plus.',
        })
      name = slug === 'food' ? 'Food' : 'Drinks'
    }
    await requireAvailableMenuSlug(tx, kitchenId, slug)
    const stamp = serverAuditStamp({ by: actor.uid, appId: actor.runtimeAppId })
    tx.create(target, menuId, {
      ...buildMenuPayload({ ...input, kitchenId, status: 'draft' }, name),
      slug,
      created: stamp,
      updated: stamp,
    })
  })
  return { created: true, id: menuId, slug, kitchenId }
}

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
  if (
    !value.changes ||
    typeof value.changes !== 'object' ||
    Array.isArray(value.changes)
  )
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid Menu changes.',
    })
  const changes = { ...value.changes } as Record<string, unknown>
  if (
    !Object.keys(changes).length ||
    Object.keys(changes).some(
      (key) => !['name', 'description', 'sort_order', 'doc'].includes(key)
    )
  )
    throw createError({
      statusCode: 400,
      statusMessage: 'Unsupported Menu field.',
    })
  const renamed = Object.hasOwn(changes, 'name')
    ? menuNameAndSlug(event, changes.name)
    : undefined
  if ('description' in changes && typeof changes.description !== 'string')
    throw createError({
      statusCode: 400,
      statusMessage: 'Menu description must be text.',
    })
  if (
    'sort_order' in changes &&
    (typeof changes.sort_order !== 'number' ||
      !Number.isSafeInteger(changes.sort_order))
  )
    throw createError({
      statusCode: 400,
      statusMessage: 'Menu order must be a whole number.',
    })
  if ('doc' in changes) {
    const doc = changes.doc
    if (
      !doc ||
      typeof doc !== 'object' ||
      Array.isArray(doc) ||
      Object.keys(doc).some(
        (key) => !['url', 'name', 'type', 'storage_path'].includes(key)
      ) ||
      ['url', 'name', 'type', 'storage_path'].some(
        (key) => typeof (doc as Record<string, unknown>)[key] !== 'string'
      )
    )
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid Menu document.',
      })
    changes.doc = { ...doc }
  }
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
  input: MenuInput & { name?: unknown }
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

export async function deleteKitchenMenu(event: H3Event, input: unknown) {
  if (!input || typeof input !== 'object' || Array.isArray(input))
    throw createError({ statusCode: 400, statusMessage: 'Invalid Menu input.' })
  const value = input as Record<string, unknown>
  if (Object.keys(value).some((key) => !['kitchenId', 'menuId'].includes(key)))
    throw createError({
      statusCode: 400,
      statusMessage: 'Unsupported Menu field.',
    })
  const kitchenId = requireFirestoreDocumentId(value.kitchenId, 'Kitchen id'),
    menuId = requireFirestoreDocumentId(value.menuId, 'Menu id')
  const actor = await readKitchenMutationActor(event)
  await runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
    await requireKitchenMutationAuthority(tx, actor, kitchenId)
    const matching: string[] = []
    let afterId: string | undefined
    while (true) {
      const page = await tx.query(FIRESTORE_MUTATION_TARGETS.menus, {
        field: 'source.kitchen_id',
        op: '==',
        value: kitchenId,
        limit: 100,
        afterId,
      })
      for (const row of page)
        if (
          row.data.source?.kitchen_id === kitchenId &&
          row.data.source?.menu_id === menuId
        )
          matching.push(row.id)
      if (page.length < 100) break
      afterId = page.at(-1)!.id
    }
    const stamp = serverAuditStamp({ by: actor.uid, appId: actor.runtimeAppId })
    for (const id of matching)
      tx.update(FIRESTORE_MUTATION_TARGETS.menus, id, {
        status: 'archived',
        updated: stamp,
      })
    // Preserve the existing document-only deletion: no child/source cascade.
    tx.delete(serverKitchenMenusTarget(kitchenId), menuId)
  })
  return { ok: true as const, kitchenId, menuId }
}
