import { createHash } from 'node:crypto'
import { createError, type H3Event } from 'h3'
import { useRuntimeConfig } from '#imports'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { defineFirestoreMutationTarget } from 'fireux-core/runtime/utils/firestore-mutations/target-definition'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { FIRESTORE_MUTATION_TARGETS } from 'fireux-core/runtime/utils/firestore-mutations/targets'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import { readKitchenMutationActor, requireKitchenRecordMutationAuthority } from '../core/mutation-authority'
import { readOrder, requireOrderChannel } from '../../utils/ordering'
import { canTransitionOrder, initialOrderSubmissionState, orderSubmissionIssues, readOrderSubmission } from '../../utils/order-submission'
import { resolveMenuOrderLines } from '../../../menu/server/ordering'
import type { MenuOrderSelection } from '../../../menu/models/menu-order-selection.model'
import type { MenuTarget } from '../../../menu/server/ownership/target-types'
import type { OrderSubmissionState } from '../../models/order-submission.model'

const fail = (statusCode: number, statusMessage: string): never => { throw createError({ statusCode, statusMessage }) }
function inputRecord(input: unknown, keys: string[]) {
  if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).some(key => !keys.includes(key))) fail(400, 'Order input is invalid.')
  return input as Record<string, unknown>
}
export function submittedOrdersTarget(kitchenId: string) {
  return defineFirestoreMutationTarget({ key: 'kitchens.submitted-orders', lane: 'server', verbs: ['create', 'update'], database: { kind: 'runtime' }, collectionPath: `kitchens/${kitchenId}/submitted-orders` })
}
const counterTarget = (kitchenId: string) => defineFirestoreMutationTarget({ key: 'kitchens.order-counters', lane: 'server', verbs: ['create', 'update'], database: { kind: 'runtime' }, collectionPath: `kitchens/${kitchenId}/order-counters` })

export async function submitKitchenOrder(event: H3Event, input: unknown, menuContext?: { target: MenuTarget; selections: MenuOrderSelection[]; expectedTotal: number }) {
  const value = inputRecord(input, ['kitchenId', 'order'])
  const kitchenId = requireFirestoreDocumentId(value.kitchenId, 'Kitchen id')
  let order: ReturnType<typeof readOrder>
  try { order = readOrder(value.order); requireOrderChannel(order.channel, useRuntimeConfig(event).public.ordering) } catch (error) { return fail(400, error instanceof Error ? error.message : 'Order is invalid.') }
  requireFirestoreDocumentId(order.id, 'Order id')
  if (order.number !== '') fail(400, 'New orders must have no number.')
  const issues = orderSubmissionIssues(order)
  if (issues.length) fail(400, issues.join(' '))
  const caller = await requireFirebaseBearerUser(event, 'Your ordering session is unavailable.', { allowAnonymous: true })
  const config = useFireUXConfig(event)
  const operator = !menuContext ? await readKitchenMutationActor(event) : null
  const fingerprint = createHash('sha256').update(JSON.stringify({order,...(menuContext?{menuId:menuContext.target.sourceMenuId,selections:menuContext.selections,expectedTotal:menuContext.expectedTotal}:{})})).digest('hex')
  const target = submittedOrdersTarget(kitchenId)
  return runGuardedServerTransaction({ kind: 'runtime' }, async tx => {
    if (operator) await requireKitchenRecordMutationAuthority(tx, operator, kitchenId)
    if (menuContext) {
      const kitchen = await tx.read(FIRESTORE_MUTATION_TARGETS.kitchens,kitchenId)
      if (!kitchen.exists || (kitchen.data?.slug && kitchen.data.slug !== menuContext.target.kitchenSlug) || (config.isTenant && (kitchen.data?.management?.mode !== 'app' || kitchen.data?.management?.app_id !== config.appId))) fail(409,'Kitchen menu target changed.')
    }
    const current = await tx.read(target, order.id)
    if (current.exists) {
      if (current.data?.caller_uid !== caller.uid || current.data?.fingerprint !== fingerprint) fail(409, 'This order reference has already been used.')
      return { ok: true, kitchen_id: kitchenId, submission: readOrderSubmission(current.data) }
    }
    if (order.channel === 'pos') {
      const staff = await tx.read(FIRESTORE_MUTATION_TARGETS.runtimeUsers, caller.uid)
      if (!staff.exists || order.placed_by?.kind !== 'person' || order.placed_by.id !== caller.uid || order.placed_by.name !== staff.data?.display_name?.trim()) fail(409, 'Use your current staff identity.')
    } else if (order.placed_by) fail(400, 'This channel does not accept a caller-supplied initiating identity.')
    const resolved = menuContext ? await resolveMenuOrderLines(tx,{kitchenId,menuId:menuContext.target.sourceMenuId,selections:menuContext.selections,fulfilment:order.fulfilment,expectedTotal:menuContext.expectedTotal}) : null
    const counter = counterTarget(kitchenId)
    const previous = await tx.read(counter, 'sequence')
    const next = previous.exists ? Number(previous.data?.value) + 1 : 1
    if (!Number.isSafeInteger(next) || next < 1) fail(409, 'Order numbering is unavailable.')
    const stamp = serverAuditStamp({ by: caller.uid, appId: config.appId })
    const submission = { order: readOrder({ ...order, ...(resolved?{lines:resolved.lines}:{}), number: String(next) }), state: initialOrderSubmissionState(order), revision: 1, message: '', estimate_minutes: null, ...(resolved?{pricing:resolved.pricing}:{}) }
    if (previous.exists) tx.update(counter, 'sequence', { value: next })
    else tx.create(counter, 'sequence', { value: next })
    tx.create(target, order.id, { ...submission, kitchen_id: kitchenId, caller_uid: caller.uid, source_app_id: config.appId, fingerprint, ...(menuContext?{menu:{id:menuContext.target.sourceMenuId,selections:menuContext.selections}}:{}), created: stamp, updated: stamp })
    return { ok: true, kitchen_id: kitchenId, submission }
  })
}

export async function respondToKitchenOrder(event: H3Event, input: unknown) {
  const value = inputRecord(input, ['kitchenId', 'orderId', 'expectedRevision', 'state', 'message', 'estimate_minutes'])
  const kitchenId = requireFirestoreDocumentId(value.kitchenId, 'Kitchen id')
  const id = requireFirestoreDocumentId(value.orderId, 'Order id')
  if (!Number.isSafeInteger(value.expectedRevision) || Number(value.expectedRevision) < 1 || typeof value.message !== 'string' || value.message.length > 500 || !(value.estimate_minutes === null || Number.isInteger(value.estimate_minutes) && Number(value.estimate_minutes) >= 1 && Number(value.estimate_minutes) <= 1440)) fail(400, 'Kitchen response is invalid.')
  const actor = await readKitchenMutationActor(event)
  const target = submittedOrdersTarget(kitchenId)
  return runGuardedServerTransaction({ kind: 'runtime' }, async tx => {
    await requireKitchenRecordMutationAuthority(tx, actor, kitchenId)
    const current = await tx.read(target, id)
    if (!current.exists || current.data?.kitchen_id !== kitchenId) fail(404, 'Order not found.')
    const saved = readOrderSubmission(current.data)
    if (saved.revision !== value.expectedRevision) fail(409, 'This order changed. Refresh before responding.')
    if (!canTransitionOrder(saved.state, value.state as OrderSubmissionState)) fail(409, 'This order cannot make that transition.')
    const message = String(value.message).trim()
    if (value.state === 'declined' && !message) fail(400, 'Give the customer a reason for declining.')
    const submission = { ...saved, state: value.state as OrderSubmissionState, revision: saved.revision + 1, message, estimate_minutes: value.estimate_minutes as number | null }
    tx.update(target, id, { ...submission, updated: serverAuditStamp({ by: actor.uid, appId: actor.runtimeAppId }) })
    return { ok: true, kitchen_id: kitchenId, submission }
  })
}

export async function readKitchenOrderResponse(event: H3Event, input: unknown) {
  const value = inputRecord(input, ['kitchenId', 'orderId'])
  const kitchenId = requireFirestoreDocumentId(value.kitchenId, 'Kitchen id')
  const id = requireFirestoreDocumentId(value.orderId, 'Order id')
  const caller = await requireFirebaseBearerUser(event, 'Your ordering session is unavailable.', { allowAnonymous: true })
  return runGuardedServerTransaction({ kind: 'runtime' }, async tx => {
    const current = await tx.read(submittedOrdersTarget(kitchenId), id)
    if (!current.exists || current.data?.caller_uid !== caller.uid || current.data?.source_app_id !== useFireUXConfig(event).appId || current.data?.kitchen_id !== kitchenId) fail(404, 'Order not found.')
    return { ok: true, kitchen_id: kitchenId, submission: readOrderSubmission(current.data) }
  })
}

export async function listKitchenSubmittedOrders(event: H3Event, kitchen: unknown) {
  const kitchenId = requireFirestoreDocumentId(kitchen, 'Kitchen id')
  const actor = await readKitchenMutationActor(event)
  return runGuardedServerTransaction({ kind: 'runtime' }, async tx => {
    await requireKitchenRecordMutationAuthority(tx, actor, kitchenId)
    const rows = await tx.query(submittedOrdersTarget(kitchenId), { field: 'state', op: 'in', value: ['received', 'accepted', 'preparing', 'ready', 'completed', 'declined'], limit: 100 })
    return { ok: true, kitchen_id: kitchenId, submissions: rows.map(row => { if (row.data.kitchen_id !== kitchenId) fail(409, 'Order scope is invalid.'); return readOrderSubmission(row.data) }) }
  })
}
