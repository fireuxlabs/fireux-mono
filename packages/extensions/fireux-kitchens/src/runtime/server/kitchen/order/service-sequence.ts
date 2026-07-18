import {
  Timestamp,
  type DocumentData,
  type Firestore,
  type Transaction,
} from 'firebase-admin/firestore'
import { randomUUID } from 'node:crypto'
import { createError } from 'h3'

export type KitchenOrderServiceSequence = {
  id: string
  number: number
}

export type KitchenOrderLinkedRecord = {
  path: string
  payload: Record<string, unknown>
}

const text = (value: unknown) => String(value ?? '').trim()

export const kitchenOrderServiceStatePath = (input: {
  appId: string
  kitchenId: string
}) => `apps/${input.appId}/kitchens/${input.kitchenId}/order-service/current`

export async function nextKitchenOrderServiceSequence(
  transaction: Transaction,
  db: Firestore,
  input: {
    appId: string
    kitchenId: string
    now: Timestamp
  }
): Promise<KitchenOrderServiceSequence> {
  const ref = db.doc(kitchenOrderServiceStatePath(input))
  const snap = await transaction.get(ref)
  const current = snap.data() || {}
  const id = text(current.service_id) || `service-${input.now.toMillis()}`
  const number = Math.max(0, Math.floor(Number(current.last_order_number) || 0)) + 1

  transaction.set(ref, {
    id: 'current',
    service_id: id,
    last_order_number: number,
    started_at: current.started_at || input.now,
    updated_at: input.now,
  })

  return { id, number }
}

export function applyKitchenOrderServiceSequence<
  TResponse extends Record<string, unknown>,
>(input: {
  payload: Record<string, unknown>
  response: TResponse
  sequence: KitchenOrderServiceSequence
}) {
  const orderNumber = String(input.sequence.number)
  return {
    payload: {
      ...input.payload,
      order_number: orderNumber,
      service_id: input.sequence.id,
      service_number: input.sequence.number,
    },
    response: applyKitchenOrderServiceSequenceToResponse(
      input.response,
      input.sequence
    ),
  }
}

export function applyKitchenOrderServiceSequenceToResponse<
  TResponse extends Record<string, unknown>,
>(response: TResponse, sequence: KitchenOrderServiceSequence) {
  const orderNumber = String(sequence.number)
  const receipt = record(response.receipt)

  return {
    ...response,
    order_number: orderNumber,
    service_id: sequence.id,
    service_number: sequence.number,
    ...(Object.keys(receipt).length
      ? {
          receipt: {
            ...receipt,
            order_number: orderNumber,
            service_id: sequence.id,
            service_number: sequence.number,
          },
        }
      : {}),
  } as TResponse
}

export async function commitKitchenOrderWithServiceSequence<
  TResponse extends Record<string, unknown>,
>(
  db: Firestore,
  input: {
    appId: string
    kitchenId: string
    orderPath: string
    payload: Record<string, unknown>
    response: TResponse
    linkedRecord?: KitchenOrderLinkedRecord
  }
) {
  return db.runTransaction(async (transaction) => {
    const now = Timestamp.now()
    const sequence = await nextKitchenOrderServiceSequence(transaction, db, {
      appId: input.appId,
      kitchenId: input.kitchenId,
      now,
    })
    const numbered = applyKitchenOrderServiceSequence({
      payload: input.payload,
      response: input.response,
      sequence,
    })
    transaction.create(db.doc(input.orderPath), numbered.payload)
    if (input.linkedRecord) {
      transaction.create(
        db.doc(input.linkedRecord.path),
        input.linkedRecord.payload
      )
    }

    return numbered.response
  })
}

export async function endKitchenOrderService(
  db: Firestore,
  input: {
    actorId: string
    appId: string
    kitchenId: string
  }
) {
  const ref = db.doc(kitchenOrderServiceStatePath(input))
  const activeOrders = db
    .collection(`apps/${input.appId}/kitchens/${input.kitchenId}/orders`)
    .where('status', 'in', [
      'pending_payment',
      'pending_acceptance',
      'accepted',
      'ready',
    ])
    .limit(1)

  return db.runTransaction(async (transaction) => {
    const [snap, activeOrdersSnap] = await Promise.all([
      transaction.get(ref),
      transaction.get(activeOrders),
    ])
    if (!activeOrdersSnap.empty) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Finish active orders before ending service.',
      })
    }

    const current = snap.data() || {}
    const now = Timestamp.now()
    const nextServiceId = `service-${randomUUID()}`
    const previousServiceId = text(current.service_id)
    const previousOrderCount = Math.max(
      0,
      Math.floor(Number(current.last_order_number) || 0)
    )

    transaction.set(ref, {
      id: 'current',
      service_id: nextServiceId,
      last_order_number: 0,
      started_at: now,
      updated_at: now,
      previous_ended_at: now,
      previous_ended_by: input.actorId,
      previous_service_id: previousServiceId,
      previous_order_count: previousOrderCount,
    })

    return {
      service_id: nextServiceId,
      previous_service_id: previousServiceId,
      previous_order_count: previousOrderCount,
    }
  })
}

function record(value: unknown): DocumentData {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as DocumentData
    : {}
}
