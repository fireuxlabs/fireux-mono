import { createHash } from 'node:crypto'
import { Timestamp, type Firestore } from 'firebase-admin/firestore'
import { createError } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import {
  serverCustomerOrdersTarget,
  serverKitchenOrderIdempotencyTarget,
  serverKitchenOrdersTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/targets'
import {
  applyKitchenOrderServiceSequence,
  applyKitchenOrderServiceSequenceToResponse,
  nextKitchenOrderServiceSequence,
  type KitchenOrderLinkedRecord,
} from '../../kitchen/order/service-sequence.ts'

const IDEMPOTENCY_WINDOW_MS = 24 * 60 * 60 * 1000
const IDEMPOTENCY_KEY_PATTERN = /^[A-Za-z0-9._~-]{16,128}$/

type MenuOrderIdempotencyScope = {
  appId: string
  kitchenId: string
  menuId: string
}

type CommitMenuOrderIdempotentlyInput<
  TResponse extends Record<string, unknown>,
> = MenuOrderIdempotencyScope & {
  key: string
  request: unknown
  orderId: string
  orderPath: string
  payload: Record<string, unknown>
  response: TResponse
  reservationResponse?: TResponse
  linkedRecord?: KitchenOrderLinkedRecord
}

const digest = (value: string) =>
  createHash('sha256').update(value).digest('hex')

const canonicalValue = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(canonicalValue)
  if (!value || typeof value !== 'object') return value

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([, child]) => child !== undefined)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, child]) => [key, canonicalValue(child)])
  )
}

const reservationId = (scope: MenuOrderIdempotencyScope, key: string) =>
  digest(
    JSON.stringify(
      canonicalValue({
        kind: 'menu-order',
        app_id: scope.appId,
        kitchen_id: scope.kitchenId,
        menu_id: scope.menuId,
        key,
      })
    )
  )

const reservationPath = (scope: MenuOrderIdempotencyScope, key: string) =>
  [
    'apps',
    scope.appId,
    'kitchens',
    scope.kitchenId,
    'order-idempotency',
    reservationId(scope, key),
  ].join('/')

const timestampMillis = (value: unknown) => {
  if (!value || typeof value !== 'object') return 0

  const source = value as {
    toMillis?: () => number
    seconds?: number
  }
  if (typeof source.toMillis === 'function') return source.toMillis()

  return Number(source.seconds || 0) * 1000
}

const replayResponse = <TResponse extends Record<string, unknown>>(
  stored: Record<string, unknown>,
  requestHash: string,
  nowMs: number
): TResponse | null => {
  const expiresAt = timestampMillis(stored.expires_at)
  const active = !expiresAt || expiresAt > nowMs
  if (!active) return null

  if (stored.request_hash !== requestHash) {
    throw createError({
      statusCode: 409,
      statusMessage:
        'Order idempotency key was already used for another request.',
    })
  }

  const response = stored.response
  if (!response || typeof response !== 'object' || Array.isArray(response)) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Stored order idempotency response is invalid.',
    })
  }

  return response as TResponse
}

export const readMenuOrderIdempotencyKey = (value: unknown) => {
  if (value === undefined || value === null) return ''
  if (typeof value !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Order idempotency key is invalid.',
    })
  }

  const key = value.trim()
  if (!IDEMPOTENCY_KEY_PATTERN.test(key)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Order idempotency key is invalid.',
    })
  }

  return key
}

export const menuOrderRequestHash = (
  scope: MenuOrderIdempotencyScope,
  request: unknown
) =>
  digest(
    JSON.stringify(
      canonicalValue({
        app_id: scope.appId,
        kitchen_id: scope.kitchenId,
        menu_id: scope.menuId,
        request,
      })
    )
  )

export const menuOrderReservationResponse = <
  TResponse extends Record<string, unknown>,
>(
  response: TResponse
): TResponse => {
  const receipt = response.receipt
  if (!receipt || typeof receipt !== 'object' || Array.isArray(receipt)) {
    return response
  }

  return {
    ...response,
    receipt: Object.fromEntries(
      Object.entries(receipt).filter(([key]) => key !== 'customer')
    ),
  }
}

export const readMenuOrderIdempotentResponse = async <
  TResponse extends Record<string, unknown>,
>(
  db: Firestore,
  input: MenuOrderIdempotencyScope & {
    key: string
    request: unknown
  }
): Promise<TResponse | null> => {
  const requestHash = menuOrderRequestHash(input, input.request)
  const snap = await db.doc(reservationPath(input, input.key)).get()
  if (!snap.exists) return null

  return replayResponse<TResponse>(snap.data() || {}, requestHash, Date.now())
}

export const commitMenuOrderIdempotently = async <
  TResponse extends Record<string, unknown>,
>(
  input: CommitMenuOrderIdempotentlyInput<TResponse>
) => {
  const scope = {
    appId: input.appId,
    kitchenId: input.kitchenId,
    menuId: input.menuId,
  }
  const requestHash = menuOrderRequestHash(scope, input.request)
  const id = reservationId(scope, input.key)
  const reservations = serverKitchenOrderIdempotencyTarget(
    input.appId,
    input.kitchenId
  )
  const orders = serverKitchenOrdersTarget(input.appId, input.kitchenId)
  const nowMs = Date.now()
  return runGuardedServerTransaction({ kind: 'runtime' }, async (mutations) => {
    const reservationSnap = await mutations.read(reservations, id)
    if (reservationSnap.exists) {
      const stored = reservationSnap.data || {}
      const response = replayResponse<TResponse>(stored, requestHash, nowMs)
      if (response) {
        return {
          response,
          duplicate: true,
        }
      }
    }

    const now = Timestamp.fromMillis(nowMs)
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
    const reservation = {
      id,
      app_id: input.appId,
      kitchen_id: input.kitchenId,
      menu_id: input.menuId,
      request_hash: requestHash,
      order_id: input.orderId,
      order_path: input.orderPath,
      response: applyKitchenOrderServiceSequenceToResponse(
        input.reservationResponse || input.response,
        sequence
      ),
      created_at: now,
      expires_at: Timestamp.fromMillis(nowMs + IDEMPOTENCY_WINDOW_MS),
    }

    mutations.create(orders, input.orderId, numbered.payload)
    if (input.linkedRecord) {
      mutations.create(
        serverCustomerOrdersTarget(input.linkedRecord.customerUid),
        input.linkedRecord.orderId,
        input.linkedRecord.payload
      )
    }
    if (reservationSnap.exists) {
      mutations.update<Record<string, unknown>>(reservations, id, reservation)
    } else {
      mutations.create(reservations, id, reservation)
    }

    return {
      response: numbered.response,
      duplicate: false,
    }
  })
}
