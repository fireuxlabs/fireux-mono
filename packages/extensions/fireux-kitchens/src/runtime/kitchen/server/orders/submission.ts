import { createHash } from 'node:crypto'
import { createError } from 'h3'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { defineFirestoreMutationTarget } from 'fireux-core/runtime/utils/firestore-mutations/target-definition'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { USER_MUTATION_TARGETS } from 'fireux-core/runtime/user/server/mutation-targets'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import {
  type readKitchenMutationActor,
  requireKitchenRecordMutationAuthority,
} from '../core/mutation-authority'
import { readOrder, requireOrderChannel } from '../../utils/ordering'
import { readItemSellingTerms } from '../../utils/item-pricing'
import { serverKitchenItemsTarget } from '../mutation-targets'
import {
  canTransitionOrder,
  initialOrderSubmissionState,
  orderSubmissionIssues,
  readOrderSubmission,
} from '../../utils/order-submission'
import type { OrderSubmissionState } from '../../records/order-submission'

const fail = (statusCode: number, statusMessage: string): never => {
  throw createError({ statusCode, statusMessage })
}
function inputRecord(input: unknown, keys: string[]) {
  if (
    !input ||
    typeof input !== 'object' ||
    Array.isArray(input) ||
    Object.keys(input).some((key) => !keys.includes(key))
  )
    fail(400, 'Order input is invalid.')
  return input as Record<string, unknown>
}
export function submittedOrdersTarget(kitchenId: string) {
  return defineFirestoreMutationTarget({
    key: 'kitchens.submitted-orders',
    lane: 'server',
    verbs: ['create', 'update'],
    database: { kind: 'runtime' },
    collectionPath: `kitchens/${kitchenId}/submitted-orders`,
  })
}
const counterTarget = (kitchenId: string) =>
  defineFirestoreMutationTarget({
    key: 'kitchens.order-counters',
    lane: 'server',
    verbs: ['create', 'update'],
    database: { kind: 'runtime' },
    collectionPath: `kitchens/${kitchenId}/order-counters`,
  })

export type OrderSubmissionActor = {
  callerUid: string
  appId: string
  ordering: Parameters<typeof requireOrderChannel>[1]
  operator: Awaited<ReturnType<typeof readKitchenMutationActor>> | null
}

export async function submitKitchenOrder(
  actor: OrderSubmissionActor,
  input: unknown
) {
  const value = inputRecord(input, ['kitchenId', 'order'])
  const kitchenId = requireFirestoreDocumentId(value.kitchenId, 'Kitchen id')
  let order: ReturnType<typeof readOrder>
  try {
    order = readOrder(value.order)
    requireOrderChannel(order.channel, actor.ordering)
  } catch (error) {
    return fail(
      400,
      error instanceof Error ? error.message : 'Order is invalid.'
    )
  }
  requireFirestoreDocumentId(order.id, 'Order id')
  if (order.number !== '') fail(400, 'New orders must have no number.')
  const issues = orderSubmissionIssues(order)
  if (issues.length) fail(400, issues.join(' '))
  const operator = actor.operator
  if (!operator) return fail(403, 'Kitchen operator context is required.')
  const fingerprint = createHash('sha256')
    .update(JSON.stringify({ order }))
    .digest('hex')
  const target = submittedOrdersTarget(kitchenId)
  return runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
    await requireKitchenRecordMutationAuthority(tx, operator, kitchenId)
    const current = await tx.read(target, order.id)
    if (current.exists) {
      if (
        current.data?.caller_uid !== actor.callerUid ||
        current.data?.fingerprint !== fingerprint
      )
        fail(409, 'This order reference has already been used.')
      return {
        ok: true,
        kitchen_id: kitchenId,
        submission: readOrderSubmission(current.data),
      }
    }
    const itemIds = new Set(
      order.lines.flatMap(({ item }) => (item.id ? [item.id] : []))
    )
    if (itemIds.size) {
      const items = serverKitchenItemsTarget(kitchenId)
      for (const itemId of itemIds) {
        const id = requireFirestoreDocumentId(itemId, 'Item id')
        const item = await tx.read(items, id)
        if (!item.exists || item.data?.status === 'archived')
          fail(400, `Order references an unavailable Item: ${id}.`)
        try {
          readItemSellingTerms(item.data ?? {})
        } catch {
          fail(
            400,
            `Repair selling terms for Item ${id} before submitting the order.`
          )
        }
      }
    }
    if (order.channel === 'pos') {
      const staff = await tx.read(
        USER_MUTATION_TARGETS.runtimeUsers,
        actor.callerUid
      )
      if (
        !staff.exists ||
        order.placed_by?.kind !== 'person' ||
        order.placed_by.id !== actor.callerUid ||
        order.placed_by.name !== staff.data?.display_name?.trim()
      )
        fail(409, 'Use your current staff identity.')
    } else if (order.placed_by)
      fail(
        400,
        'This channel does not accept a caller-supplied initiating identity.'
      )
    const counter = counterTarget(kitchenId)
    const previous = await tx.read(counter, 'sequence')
    const next = previous.exists ? Number(previous.data?.value) + 1 : 1
    if (!Number.isSafeInteger(next) || next < 1)
      fail(409, 'Order numbering is unavailable.')
    const stamp = serverAuditStamp({ by: actor.callerUid, appId: actor.appId })
    const submission = {
      order: readOrder({ ...order, number: String(next) }),
      state: initialOrderSubmissionState(order),
      revision: 1,
      message: '',
      estimate_minutes: null,
    }
    if (previous.exists) tx.update(counter, 'sequence', { value: next })
    else tx.create(counter, 'sequence', { value: next })
    tx.create(target, order.id, {
      ...submission,
      kitchen_id: kitchenId,
      caller_uid: actor.callerUid,
      source_app_id: actor.appId,
      fingerprint,
      created: stamp,
      updated: stamp,
    })
    return { ok: true, kitchen_id: kitchenId, submission }
  })
}

export async function respondToKitchenOrder(
  actor: OrderSubmissionActor['operator'],
  input: unknown
) {
  const value = inputRecord(input, [
    'kitchenId',
    'orderId',
    'expectedRevision',
    'state',
    'message',
    'estimate_minutes',
  ])
  const kitchenId = requireFirestoreDocumentId(value.kitchenId, 'Kitchen id')
  const id = requireFirestoreDocumentId(value.orderId, 'Order id')
  if (
    !Number.isSafeInteger(value.expectedRevision) ||
    Number(value.expectedRevision) < 1 ||
    typeof value.message !== 'string' ||
    value.message.length > 500 ||
    !(
      value.estimate_minutes === null ||
      (Number.isInteger(value.estimate_minutes) &&
        Number(value.estimate_minutes) >= 1 &&
        Number(value.estimate_minutes) <= 1440)
    )
  )
    fail(400, 'Kitchen response is invalid.')
  if (!actor) return fail(403, 'Kitchen operator context is required.')
  const target = submittedOrdersTarget(kitchenId)
  return runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
    await requireKitchenRecordMutationAuthority(tx, actor, kitchenId)
    const current = await tx.read(target, id)
    if (!current.exists || current.data?.kitchen_id !== kitchenId)
      fail(404, 'Order not found.')
    const saved = readOrderSubmission(current.data)
    if (saved.revision !== value.expectedRevision)
      fail(409, 'This order changed. Refresh before responding.')
    if (!canTransitionOrder(saved.state, value.state as OrderSubmissionState))
      fail(409, 'This order cannot make that transition.')
    const message = String(value.message).trim()
    if (value.state === 'declined' && !message)
      fail(400, 'Give the customer a reason for declining.')
    const submission = {
      ...saved,
      state: value.state as OrderSubmissionState,
      revision: saved.revision + 1,
      message,
      estimate_minutes: value.estimate_minutes as number | null,
    }
    tx.update(target, id, {
      ...submission,
      updated: serverAuditStamp({ by: actor.uid, appId: actor.runtimeAppId }),
    })
    return { ok: true, kitchen_id: kitchenId, submission }
  })
}

export async function listKitchenSubmittedOrders(
  actor: OrderSubmissionActor['operator'],
  kitchen: unknown
) {
  const kitchenId = requireFirestoreDocumentId(kitchen, 'Kitchen id')
  if (!actor) return fail(403, 'Kitchen operator context is required.')
  return runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
    await requireKitchenRecordMutationAuthority(tx, actor, kitchenId)
    const rows: Array<{ id: string; data: Record<string, unknown> }> = []
    let after: string | undefined
    for (;;) {
      const batch = await tx.readAll(
        submittedOrdersTarget(kitchenId),
        1000,
        after
      )
      rows.push(...batch)
      if (batch.length < 1000) break
      after = batch.at(-1)!.id
    }
    return {
      ok: true,
      kitchen_id: kitchenId,
      submissions: rows.map((row) => {
        if (row.data.kitchen_id !== kitchenId)
          fail(409, 'Order scope is invalid.')
        return readOrderSubmission(row.data)
      }),
    }
  })
}
