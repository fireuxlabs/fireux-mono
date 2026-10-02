import { randomUUID } from 'node:crypto'
import { createError, type H3Event } from 'h3'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { defineFirestoreMutationTarget } from 'fireux-core/runtime/utils/firestore-mutations/target-definition'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import { readKitchenMutationActor, requireKitchenMutationAuthority } from '../core/mutation-authority'
import { kitchenWasteEventRecordTool } from '../../tools/waste/record-event'

const schema = kitchenWasteEventRecordTool.inputSchema
function invalid(): never { throw createError({ statusCode: 400, statusMessage: 'Enter a valid Waste observation.' }) }
function fields(input: unknown, allowed: string[]) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) invalid()
  const value = input as Record<string, unknown>
  if (Object.keys(value).some(key => !allowed.includes(key))) invalid()
  return value
}
function text(value: unknown, min: number, max: number) {
  if (typeof value !== 'string') invalid()
  const normalized = value.trim()
  if (normalized.length < min || normalized.length > max) invalid()
  return normalized
}
export async function recordKitchenWaste(event: H3Event, input: unknown) {
  const value = fields(input, ['kitchenId', 'observation'])
  const kitchenId = requireFirestoreDocumentId(value.kitchenId, 'Kitchen id')
  const observation = fields(value.observation, Object.keys(schema.properties))
  const limits = schema.properties
  if (typeof observation.quantity !== 'number' || !Number.isFinite(observation.quantity) || observation.quantity <= limits.quantity.exclusiveMinimum || observation.quantity > limits.quantity.maximum) invalid()
  if (!(limits.reason.enum as readonly unknown[]).includes(observation.reason) || !(limits.source.enum as readonly unknown[]).includes(observation.source)) invalid()
  const payload = {
    kitchen_id: kitchenId,
    item_name: text(observation.item_name, limits.item_name.minLength, limits.item_name.maxLength),
    quantity: observation.quantity,
    unit: text(observation.unit, limits.unit.minLength, limits.unit.maxLength),
    reason: observation.reason, source: observation.source,
    notes: text(observation.notes ?? '', 0, limits.notes.maxLength),
  }
  const actor = await readKitchenMutationActor(event)
  const id = randomUUID()
  return runGuardedServerTransaction({ kind: 'runtime' }, async tx => {
    const authority = await requireKitchenMutationAuthority(tx, actor, kitchenId)
    const target = defineFirestoreMutationTarget({ key: 'kitchens.waste-events', lane: 'server', verbs: ['create'], database: { kind: 'runtime' }, collectionPath: `kitchens/${kitchenId}/waste-events` })
    const stamp = serverAuditStamp({ by: actor.uid, appId: authority.ownerAppId })
    tx.create(target, id, { ...payload, occurred_at: stamp.at, created: stamp, updated: stamp })
    return { id }
  })
}
