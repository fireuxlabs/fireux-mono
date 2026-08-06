import { Timestamp, type DocumentData } from 'firebase-admin/firestore'
import { randomUUID } from 'node:crypto'
import { createError } from 'h3'
import {
  runGuardedServerTransaction,
  type GuardedServerTransaction,
} from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import {
  serverCustomerOrdersTarget,
  serverKitchenOrderServiceTarget,
  serverKitchenOrdersTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/targets'

export type KitchenOrderServiceSequence = {
  id: string
  number: number
}

export type KitchenOrderLinkedRecord = {
  customerUid: string
  orderId: string
  payload: Record<string, unknown>
}

const text = (value: unknown) => String(value ?? '').trim()

export const kitchenOrderServiceStatePath = (input: {
  appId: string
  kitchenId: string
}) => `apps/${input.appId}/kitchens/${input.kitchenId}/order-service/current`

export async function nextKitchenOrderServiceSequence(
  mutations: GuardedServerTransaction,
  input: {
    appId: string
    kitchenId: string
    now: Timestamp
  }
): Promise<KitchenOrderServiceSequence> {
  const services = serverKitchenOrderServiceTarget(input.appId, input.kitchenId)
  const snap = await mutations.read(services, 'current')
  const current = snap.data || {}
  const id = text(current.service_id) || `service-${input.now.toMillis()}`
  const number =
    Math.max(0, Math.floor(Number(current.last_order_number) || 0)) + 1

  const data = {
    id: 'current',
    service_id: id,
    last_order_number: number,
    started_at: current.started_at || input.now,
    updated_at: input.now,
  }
  if (snap.exists) mutations.update(services, 'current', data)
  else mutations.create(services, 'current', data)

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
>(input: {
  appId: string
  kitchenId: string
  orderId: string
  payload: Record<string, unknown>
  response: TResponse
  linkedRecord?: KitchenOrderLinkedRecord
}) {
  return runGuardedServerTransaction({ kind: 'runtime' }, async (mutations) => {
    const now = Timestamp.now()
    const sequence = await nextKitchenOrderServiceSequence(mutations, {
      appId: input.appId,
      kitchenId: input.kitchenId,
      now,
    })
    const numbered = applyKitchenOrderServiceSequence({
      payload: input.payload,
      response: input.response,
      sequence,
    })
    mutations.create(
      serverKitchenOrdersTarget(input.appId, input.kitchenId),
      input.orderId,
      numbered.payload
    )
    if (input.linkedRecord) {
      mutations.create(
        serverCustomerOrdersTarget(input.linkedRecord.customerUid),
        input.linkedRecord.orderId,
        input.linkedRecord.payload
      )
    }

    return numbered.response
  })
}

export async function endKitchenOrderService(input: {
  actorId: string
  appId: string
  kitchenId: string
}) {
  const services = serverKitchenOrderServiceTarget(input.appId, input.kitchenId)
  const orders = serverKitchenOrdersTarget(input.appId, input.kitchenId)
  return runGuardedServerTransaction({ kind: 'runtime' }, async (mutations) => {
    const [snap, activeOrders] = await Promise.all([
      mutations.read(services, 'current'),
      mutations.query(orders, {
        field: 'status',
        op: 'in',
        value: ['pending_payment', 'pending_acceptance', 'accepted', 'ready'],
        limit: 1,
      }),
    ])
    if (activeOrders.length) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Finish active orders before ending service.',
      })
    }

    const current = snap.data || {}
    const now = Timestamp.now()
    const nextServiceId = `service-${randomUUID()}`
    const previousServiceId = text(current.service_id)
    const previousOrderCount = Math.max(
      0,
      Math.floor(Number(current.last_order_number) || 0)
    )

    const data = {
      id: 'current',
      service_id: nextServiceId,
      last_order_number: 0,
      started_at: now,
      updated_at: now,
      previous_ended_at: now,
      previous_ended_by: input.actorId,
      previous_service_id: previousServiceId,
      previous_order_count: previousOrderCount,
    }
    if (snap.exists) mutations.update(services, 'current', data)
    else mutations.create(services, 'current', data)

    return {
      service_id: nextServiceId,
      previous_service_id: previousServiceId,
      previous_order_count: previousOrderCount,
    }
  })
}

function record(value: unknown): DocumentData {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as DocumentData)
    : {}
}
