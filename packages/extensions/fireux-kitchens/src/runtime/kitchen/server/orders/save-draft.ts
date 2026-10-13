import { createError, type H3Event } from 'h3'
import { useRuntimeConfig } from '#imports'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { defineFirestoreMutationTarget } from 'fireux-core/runtime/utils/firestore-mutations/target-definition'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import { FIRESTORE_MUTATION_TARGETS } from 'fireux-core/runtime/utils/firestore-mutations/targets'
import {
  readKitchenMutationActor,
  requireKitchenRecordMutationAuthority,
} from '../core/mutation-authority'
import {
  OrderDraftCollection,
  readOrder,
  readSavedOrderDraft,
  requireOrderChannel,
} from '../../utils/ordering'

export async function saveKitchenOrderDraft(event: H3Event, input: unknown) {
  if (!input || typeof input !== 'object' || Array.isArray(input))
    throw createError({
      statusCode: 400,
      statusMessage: 'Draft input is invalid.',
    })
  const value = input as Record<string, unknown>
  if (
    Object.keys(value).some(
      (key) => !['kitchenId', 'order', 'expectedRevision'].includes(key)
    ) ||
    !Number.isSafeInteger(value.expectedRevision) ||
    Number(value.expectedRevision) < 0 ||
    Number(value.expectedRevision) >= Number.MAX_SAFE_INTEGER
  )
    throw createError({
      statusCode: 400,
      statusMessage: 'Draft input is invalid.',
    })
  const kitchenId = requireFirestoreDocumentId(value.kitchenId, 'Kitchen id')
  let order: ReturnType<typeof readOrder>
  try {
    order = readOrder(value.order)
    requireOrderChannel(order.channel, useRuntimeConfig(event).public.ordering)
  } catch (error) {
    throw createError({
      statusCode: 400,
      statusMessage:
        error instanceof Error ? error.message : 'Draft is invalid.',
    })
  }
  const id = requireFirestoreDocumentId(order.id, 'Draft id')
  for (const line of order.lines) requireFirestoreDocumentId(line.id, 'Line id')
  const expectedRevision = Number(value.expectedRevision)
  if (expectedRevision === 0 && order.channel !== 'pos')
    throw createError({
      statusCode: 400,
      statusMessage: 'Workspace drafts must originate from POS.',
    })
  const actor = await readKitchenMutationActor(event)
  const target = defineFirestoreMutationTarget({
    key: 'kitchens.order-drafts',
    lane: 'server',
    verbs: ['create', 'update'],
    database: { kind: 'runtime' },
    collectionPath: `kitchens/${kitchenId}/${OrderDraftCollection}`,
  })
  return runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
    const authority = await requireKitchenRecordMutationAuthority(
      tx,
      actor,
      kitchenId
    )
    const current = await tx.read(target, id)
    if (!current.exists) {
      const staff = await tx.read(FIRESTORE_MUTATION_TARGETS.runtimeUsers, actor.uid)
      const name = typeof staff.data?.display_name === 'string' ? staff.data.display_name.trim() : ''
      if (!staff.exists || !name || order.placed_by?.kind !== 'person' || order.placed_by.id !== actor.uid || order.placed_by.name !== name)
        throw createError({ statusCode: 409, statusMessage: 'Start this POS order with your current staff identity.' })
    }
    if (current.exists) {
      let revision: number
      let channel: string
      try {
        const saved = readSavedOrderDraft(id, current.data, kitchenId)
        if (JSON.stringify(saved.order.placed_by) !== JSON.stringify(order.placed_by))
          throw new Error('The initiating staff member cannot change.')
        revision = saved.revision
        channel = saved.order.channel
      } catch {
        throw createError({
          statusCode: 409,
          statusMessage: 'Saved draft is invalid. It was not overwritten.',
        })
      }
      if (channel !== order.channel)
        throw createError({
          statusCode: 409,
          statusMessage:
            "A saved draft's originating channel cannot be changed.",
        })
      if (revision !== expectedRevision)
        throw createError({
          statusCode: 409,
          statusMessage:
            'This draft changed elsewhere. Reopen it before saving.',
        })
    } else if (expectedRevision !== 0)
      throw createError({
        statusCode: 409,
        statusMessage:
          'This draft no longer exists. Your edits have not been saved.',
      })
    const revision = expectedRevision + 1
    const { id: _id, ...fields } = order
    const stamp = serverAuditStamp({
      by: actor.uid,
      appId: authority.ownerAppId,
    })
    const data = {
      ...fields,
      placed_by: order.placed_by ?? null,
      location: order.location ?? null,
      fulfilment: order.fulfilment ?? null,
      customer: order.customer ?? null,
      delivery_address: order.delivery_address ?? null,
      requested_at: order.requested_at ?? null,
      schema_version: 1,
      kitchen_id: kitchenId,
      revision,
      updated: stamp,
    }
    if (current.exists) tx.update(target, id, data)
    else tx.create(target, id, { ...data, created: stamp })
    return { ok: true, kitchen_id: kitchenId, draft: { order, revision } }
  })
}
