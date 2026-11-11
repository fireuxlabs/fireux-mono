import { createError, type H3Event } from 'h3'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalize-slug'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import {
  readKitchenMutationActor,
  requireKitchenRecordMutationAuthority,
} from '../core/mutation-authority'
import { validateItemReferenceIds } from '../../utils/item-organisation'
import { kitchenItemGroupsTarget } from './targets'
import { requireItemOrganisationReferences } from './references'

export async function saveKitchenItemGroup(
  event: H3Event,
  input: unknown,
  mode: 'create' | 'update'
) {
  const invalid = () =>
    createError({
      statusCode: 400,
      statusMessage: 'Provide a valid Item group name and Kitchen references.',
    })
  if (!input || typeof input !== 'object' || Array.isArray(input))
    throw invalid()
  const value = input as Record<string, unknown>
  if (
    Object.keys(value).some(
      (key) =>
        ![
          'kitchenId',
          'groupId',
          'name',
          'active',
          'default_station_ids',
        ].includes(key)
    )
  )
    throw invalid()
  const kitchenId = requireFirestoreDocumentId(value.kitchenId, 'Kitchen id')
  if (
    typeof value.name !== 'string' ||
    !value.name.trim() ||
    value.name.trim().length > 100
  )
    throw invalid()
  const name = value.name.trim()
  const groupId = requireFirestoreDocumentId(
    mode === 'create' ? normalizeSlug(name) : value.groupId,
    'Group id'
  )
  if (value.active !== undefined && typeof value.active !== 'boolean')
    throw createError({
      statusCode: 400,
      statusMessage: 'Group active must be a boolean.',
    })
  let stations: string[] | undefined
  if (value.default_station_ids !== undefined) {
    try {
      stations = validateItemReferenceIds(value.default_station_ids)
    } catch {
      throw invalid()
    }
  }
  const actor = await readKitchenMutationActor(event)
  return runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
    const authority = await requireKitchenRecordMutationAuthority(
      tx,
      actor,
      kitchenId
    )
    const target = kitchenItemGroupsTarget(kitchenId)
    const existing = await tx.read(target, groupId)
    if (mode === 'create' && existing.exists)
      throw createError({
        statusCode: 409,
        statusMessage: 'An Item group with this name already exists.',
      })
    if (
      mode === 'update' &&
      (!existing.exists || existing.data?.kitchen_id !== kitchenId)
    )
      throw createError({
        statusCode: 404,
        statusMessage: 'Item group not found in this Kitchen.',
      })
    await requireItemOrganisationReferences(tx, kitchenId, {
      preparation_station_ids: stations,
    })
    const stamp = serverAuditStamp({
      by: actor.uid,
      appId: authority.ownerAppId,
    })
    const patch = {
      name,
      ...(value.active !== undefined ? { active: value.active } : {}),
      ...(stations !== undefined ? { default_station_ids: stations } : {}),
      updated: stamp,
    }
    if (mode === 'create')
      tx.create(target, groupId, {
        kitchen_id: kitchenId,
        active: true,
        sort_order: 0,
        default_station_ids: [],
        ...patch,
        created: stamp,
      })
    else tx.update(target, groupId, patch)
    return { id: groupId }
  })
}
