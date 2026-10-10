import { Timestamp } from 'firebase-admin/firestore'
import { randomUUID } from 'node:crypto'
import { createError } from 'h3'
import {
  runGuardedServerTransaction,
  type GuardedServerTransaction,
} from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import {
  serverUserOrdersTarget,
  serverKitchenOrdersTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/targets'
import { serverKitchenOrderNumberingTarget } from './numbering-target.ts'
import { requireKitchenWriterAccount } from '../core/operator-access.ts'
import {
  applyKitchenOrderNumbering,
  type KitchenOrderNumberingSequence,
} from '../../utils/order-numbering.ts'

export {
  applyKitchenOrderNumbering,
  applyKitchenOrderNumberingToResponse,
  type KitchenOrderNumberingSequence,
} from '../../utils/order-numbering.ts'

export type KitchenOrderLinkedRecord = {
  customerUid: string
  orderId: string
  payload: Record<string, unknown>
}

function readCurrentNumbering(snap: {
  exists: boolean
  data?: Record<string, unknown> | null
}) {
  if (!snap.exists) return null
  const current = snap.data || {}
  const id = current.service_id
  const number = current.last_order_number
  if (
    typeof id !== 'string' ||
    !id ||
    id.trim() !== id ||
    typeof number !== 'number' ||
    !Number.isSafeInteger(number) ||
    number < 0
  ) {
    throw createError({
      statusCode: 409,
      statusMessage:
        'The saved order numbering state needs repair before continuing.',
    })
  }
  return { id, number }
}

export async function nextKitchenOrderNumber(
  mutations: GuardedServerTransaction,
  input: {
    appId: string
    kitchenId: string
    now: Timestamp
  }
): Promise<KitchenOrderNumberingSequence> {
  const numbering = serverKitchenOrderNumberingTarget(input.kitchenId)
  const snap = await mutations.read(numbering, 'current')
  const current = snap.data || {}
  const saved = readCurrentNumbering(snap)
  if (saved?.number === Number.MAX_SAFE_INTEGER) {
    throw createError({
      statusCode: 409,
      statusMessage:
        'Order numbering reached its limit. Reset numbering after active orders finish.',
    })
  }
  const id = saved?.id || `service-${input.now.toMillis()}`
  const number = (saved?.number ?? 0) + 1

  const data = {
    id: 'current',
    service_id: id,
    last_order_number: number,
    started_at: current.started_at || input.now,
    updated_at: input.now,
  }
  if (snap.exists) mutations.update(numbering, 'current', data)
  else mutations.create(numbering, 'current', data)

  return { id, number }
}

export async function commitKitchenOrderWithNumbering<
  TResponse extends Record<string, unknown>,
>(input: {
  appId: string
  kitchenId: string
  orderId: string
  payload: Record<string, unknown>
  response: TResponse
  linkedRecord?: KitchenOrderLinkedRecord
  validateBeforeCreate?: (tx: GuardedServerTransaction) => Promise<void>
}) {
  return runGuardedServerTransaction({ kind: 'runtime' }, async (mutations) => {
    await input.validateBeforeCreate?.(mutations)
    const now = Timestamp.now()
    const sequence = await nextKitchenOrderNumber(mutations, {
      appId: input.appId,
      kitchenId: input.kitchenId,
      now,
    })
    const numbered = applyKitchenOrderNumbering({
      payload: input.payload,
      response: input.response,
      sequence,
    })
    mutations.create(
      serverKitchenOrdersTarget(input.kitchenId),
      input.orderId,
      numbered.payload
    )
    if (input.linkedRecord) {
      mutations.create(
        serverUserOrdersTarget(input.linkedRecord.customerUid),
        input.linkedRecord.orderId,
        input.linkedRecord.payload
      )
    }

    return numbered.response
  })
}

export async function resetKitchenOrderNumbering(input: {
  actorId: string
  appId: string
  kitchenId: string
}) {
  const numbering = serverKitchenOrderNumberingTarget(input.kitchenId)
  const orders = serverKitchenOrdersTarget(input.kitchenId)
  return runGuardedServerTransaction({ kind: 'runtime' }, async (mutations) => {
    await requireKitchenWriterAccount(
      { appId: input.appId, kitchenId: input.kitchenId },
      input.actorId,
      mutations
    )
    const [snap, activeOrders] = await Promise.all([
      mutations.read(numbering, 'current'),
      mutations.query(orders, {
        field: 'status',
        op: 'in',
        value: [
          'pending_payment',
          'pending_acceptance',
          'awaiting_payment_choice',
          'awaiting_preparation',
          'scheduled',
          'accepted',
          'ready',
        ],
        limit: 1,
      }),
    ])
    if (activeOrders.length) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Finish active orders before resetting order numbering.',
      })
    }

    const now = Timestamp.now()
    const nextPeriodId = `service-${randomUUID()}`
    const saved = readCurrentNumbering(snap)
    const previousPeriodId = saved?.id ?? ''
    const previousOrderCount = saved?.number ?? 0

    const data = {
      id: 'current',
      service_id: nextPeriodId,
      last_order_number: 0,
      started_at: now,
      updated_at: now,
      previous_ended_at: now,
      previous_ended_by: input.actorId,
      previous_service_id: previousPeriodId,
      previous_order_count: previousOrderCount,
    }
    if (snap.exists) mutations.update(numbering, 'current', data)
    else mutations.create(numbering, 'current', data)

    return {
      service_id: nextPeriodId,
      previous_service_id: previousPeriodId,
      previous_order_count: previousOrderCount,
    }
  })
}
