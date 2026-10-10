import { createError } from 'h3'
import { Timestamp } from 'firebase-admin/firestore'
import {
  isKitchenOrderStatus,
  isKitchenOrderPaymentSatisfied,
  kitchenOrderTransitionRule,
  type KitchenOrder,
  type KitchenOrderTransition,
} from '../../utils/order.ts'

export type KitchenOrderTransitionOptions = {
  estimatedMinutes?: number | null
  note?: string
  nowMs?: number
}

export function buildKitchenOrderTransitionPatch(
  order: Pick<KitchenOrder, 'status'> &
    Partial<Pick<KitchenOrder, 'order_type' | 'collection' | 'payment'>>,
  transition: KitchenOrderTransition,
  options: KitchenOrderTransitionOptions = {}
): Partial<KitchenOrder> {
  if (!isKitchenOrderStatus(order.status)) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Order lifecycle is invalid.',
    })
  }

  if (transition === 'trash') {
    if (order.status === 'trashed') {
      throw createError({
        statusCode: 409,
        statusMessage: 'Order is already trashed.',
      })
    }

    return { status: 'trashed' }
  }

  const confirmationFirst = order.payment?.flow === 'confirmation_first'
  if (
    confirmationFirst &&
    transition === 'accept' &&
    [
      'awaiting_payment_choice',
      'pending_payment',
      'scheduled',
      'awaiting_preparation',
      'accepted',
      'ready',
      'completed',
    ].includes(order.status)
  )
    return {}
  if (
    confirmationFirst &&
    ['start_preparation', 'mark_ready', 'return_to_queue', 'complete'].includes(
      transition
    ) &&
    !isKitchenOrderPaymentSatisfied(order)
  ) {
    throw createError({
      statusCode: 409,
      statusMessage:
        'Customer payment choice or successful payment is still required.',
    })
  }
  if (
    transition === 'start_preparation' &&
    order.status === 'awaiting_preparation'
  )
    return { status: 'accepted' }
  const rule = kitchenOrderTransitionRule(transition)
  if (order.status !== rule.from) {
    throw createError({
      statusCode: 409,
      statusMessage: `Cannot ${transition.replaceAll('_', ' ')} an order in ${order.status}.`,
    })
  }

  if (transition === 'accept') {
    if (confirmationFirst) {
      return {
        status: 'awaiting_payment_choice',
        estimated_ready_minutes: 0,
        estimated_ready_at: '',
      }
    }
    const estimatedMinutes = readKitchenOrderEstimatedMinutes(
      options.estimatedMinutes
    )
    const nowMs = Number.isFinite(options.nowMs)
      ? Number(options.nowMs)
      : Date.now()

    return {
      status: rule.to,
      estimated_ready_minutes: estimatedMinutes,
      estimated_ready_at: estimatedMinutes
        ? (Timestamp.fromMillis(
            nowMs + estimatedMinutes * 60_000
          ) as unknown as KitchenOrder['estimated_ready_at'])
        : '',
    }
  }

  if (transition === 'reject') {
    const note = typeof options.note === 'string' ? options.note.trim() : ''
    if (!note) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Rejection reason is required.',
      })
    }

    return {
      status: rule.to,
      kitchen_note: note,
    }
  }

  if (transition === 'return_to_queue') {
    return {
      status: rule.to,
      estimated_ready_minutes: 0,
      estimated_ready_at: '',
    }
  }

  return { status: rule.to }
}

export function readKitchenOrderEstimatedMinutes(value: unknown) {
  if (value === null) return 0
  if (value === undefined) return 45

  if (
    typeof value !== 'number' ||
    !Number.isSafeInteger(value) ||
    value < 5 ||
    value > 90 ||
    value % 5 !== 0
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Estimated minutes must be 5 to 90 in five-minute steps.',
    })
  }

  return value
}
