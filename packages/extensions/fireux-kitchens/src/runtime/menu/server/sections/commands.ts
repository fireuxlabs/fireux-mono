import { nextMenuDisplayOrder } from '../display-order'
import { randomUUID } from 'node:crypto'
import { createError, type H3Event } from 'h3'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import {
  serverKitchenMenusTarget,
  serverKitchenMenuSectionsTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/targets'
import {
  readKitchenMutationActor,
  requireKitchenMutationAuthority,
} from '../../../kitchen/server/core/mutation-authority'

function invalid(): never {
  throw createError({
    statusCode: 400,
    statusMessage: 'Invalid Menu section input.',
  })
}
function fields(input: unknown, keys: string[]) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) invalid()
  const value = input as Record<string, unknown>
  if (Object.keys(value).some((key) => !keys.includes(key))) invalid()
  return value
}
function changes(input: unknown) {
  const value = fields(input, [
    'label',
    'description',
    'status',
    'sort_order',
    'date',
  ])
  if (!Object.keys(value).length) invalid()
  if (
    'label' in value &&
    (typeof value.label !== 'string' || !value.label.trim())
  )
    invalid()
  if ('description' in value && typeof value.description !== 'string') invalid()
  if (
    'status' in value &&
    !['active', 'archived'].includes(value.status as string)
  )
    invalid()
  if (
    'sort_order' in value &&
    (typeof value.sort_order !== 'number' || !Number.isFinite(value.sort_order))
  )
    invalid()
  if (
    'date' in value &&
    (typeof value.date !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}$/.test(value.date) ||
      !Number.isFinite(Date.parse(`${value.date}T12:00:00Z`)) ||
      new Date(`${value.date}T12:00:00Z`).toISOString().slice(0, 10) !==
        value.date)
  )
    invalid()
  return {
    ...value,
    ...('label' in value ? { label: (value.label as string).trim() } : {}),
    ...('description' in value
      ? { description: (value.description as string).trim() }
      : {}),
  }
}
export async function createKitchenMenuSection(event: H3Event, input: unknown) {
  const value = fields(input, ['kitchenId', 'menuId', 'label', 'description'])
  const kitchenId = requireFirestoreDocumentId(value.kitchenId, 'Kitchen id')
  const menuId = requireFirestoreDocumentId(value.menuId, 'Menu id')
  const payload = changes({
    label: value.label,
    description: value.description ?? '',
  })
  const actor = await readKitchenMutationActor(event),
    id = randomUUID()
  await runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
    const access = await requireKitchenMutationAuthority(tx, actor, kitchenId)
    const menu = await tx.read(serverKitchenMenusTarget(kitchenId), menuId)
    if (!menu.exists)
      throw createError({
        statusCode: 404,
        statusMessage: 'Menu was not found.',
      })
    if (
      menu.data?.schedule === 'daily' &&
      !['premium', 'business'].includes(access.subscription)
    )
      throw createError({
        statusCode: 403,
        statusMessage: 'Daily specials require Plus.',
      })
    const target = serverKitchenMenuSectionsTarget(kitchenId, menuId)
    const sort_order = await nextMenuDisplayOrder(tx, target)
    const stamp = serverAuditStamp({ by: actor.uid, appId: actor.runtimeAppId })
    tx.create(target, id, {
      ...payload,
      sort_order,
      kitchen_id: kitchenId,
      menu_id: menuId,
      status: 'active',
      created: stamp,
      updated: stamp,
    })
    tx.update(serverKitchenMenusTarget(kitchenId), menuId, { updated: stamp })
  })
  return { id, kitchenId, menuId }
}
export async function updateKitchenMenuSection(event: H3Event, input: unknown) {
  const value = fields(input, ['kitchenId', 'menuId', 'sectionId', 'changes'])
  const kitchenId = requireFirestoreDocumentId(value.kitchenId, 'Kitchen id')
  const menuId = requireFirestoreDocumentId(value.menuId, 'Menu id')
  const sectionId = requireFirestoreDocumentId(value.sectionId, 'Section id')
  const payload = changes(value.changes)
  const actor = await readKitchenMutationActor(event)
  await runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
    const access = await requireKitchenMutationAuthority(tx, actor, kitchenId)
    const target = serverKitchenMenuSectionsTarget(kitchenId, menuId)
    const [menu, section] = await Promise.all([
      tx.read(serverKitchenMenusTarget(kitchenId), menuId),
      tx.read(target, sectionId),
    ])
    if (!menu.exists || !section.exists)
      throw createError({
        statusCode: 404,
        statusMessage: 'Menu section was not found.',
      })
    if (
      menu.data?.schedule === 'daily' &&
      !['premium', 'business'].includes(access.subscription)
    )
      throw createError({
        statusCode: 403,
        statusMessage: 'Daily specials require Plus.',
      })
    tx.update(target, sectionId, {
      ...payload,
      updated: serverAuditStamp({ by: actor.uid }),
    })
  })
  return { ok: true as const, kitchenId, menuId }
}
