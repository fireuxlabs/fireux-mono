import { createError, type H3Event } from 'h3'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import { readKitchenMutationActor, requireKitchenMutationAuthority } from '../core/mutation-authority'
import { kitchenStationsTarget } from './default'

export async function createKitchenStation(event: H3Event, input: unknown) {
  const badInput = () => createError({ statusCode: 400, statusMessage: 'Invalid Station creation input.' })
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw badInput()
  const value = input as Record<string, unknown>
  if (Object.keys(value).some(key => !['kitchenId', 'name', 'sortOrder'].includes(key))) throw badInput()
  const kitchenId = requireFirestoreDocumentId(value.kitchenId, 'Kitchen id')
  if (typeof value.name !== 'string' || !value.name.trim()) throw badInput()
  const name = value.name.trim()
  const stationId = name.toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  requireFirestoreDocumentId(stationId, 'Station id')
  const sortOrder = value.sortOrder === undefined ? 0 : value.sortOrder
  if (typeof sortOrder !== 'number' || !Number.isSafeInteger(sortOrder) || sortOrder < 0) throw badInput()
  const actor = await readKitchenMutationActor(event)
  return runGuardedServerTransaction({ kind: 'runtime' }, async tx => {
    const authority = await requireKitchenMutationAuthority(tx, actor, kitchenId)
    const target = kitchenStationsTarget(kitchenId)
    const existing = await tx.read(target, stationId)
    if (existing.exists) throw createError({ statusCode: 409, statusMessage: 'A Station with this name already exists.' })
    const stamp = serverAuditStamp({ by: actor.uid, appId: authority.ownerAppId })
    tx.create(target, stationId, {
      kitchen_id: kitchenId, name, description: '', active: true,
      sort_order: sortOrder, created: stamp, updated: stamp,
    })
    return { id: stationId }
  })
}
