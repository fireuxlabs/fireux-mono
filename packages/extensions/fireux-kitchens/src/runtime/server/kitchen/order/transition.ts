import { createError } from 'h3'
import { Timestamp } from 'firebase-admin/firestore'
import {
  isKitchenOrderStatus,
  type KitchenOrder,
  type KitchenOrderStatus,
  type KitchenOrderTransition,
} from '../../../models/kitchen/order.model.ts'

export type KitchenOrderTransitionOptions = {
  estimatedMinutes?: number | null
  note?: string
}

const allowedFrom: Record<
  Exclude<KitchenOrderTransition, 'trash'>,
  KitchenOrderStatus
> = {
  accept: 'pending_acceptance',
  reject: 'pending_acceptance',
  mark_ready: 'accepted',
  return_to_queue: 'ready',
  complete: 'ready',
}

const text = (value: unknown) => String(value ?? '').trim()

export function buildKitchenOrderTransitionPatch(
  order: Pick<KitchenOrder, 'status'>,
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
    return { status: 'trashed' }
  }

  const expectedStatus = allowedFrom[transition]
  if (order.status !== expectedStatus) {
    throw createError({
      statusCode: 409,
      statusMessage:
        `Cannot ${transition.replaceAll('_', ' ')} an order in ${order.status}.`,
    })
  }

  if (transition === 'accept') {
    const estimatedMinutes = options.estimatedMinutes === null
      ? 0
      : Math.max(1, Number(options.estimatedMinutes || 45) || 45)

    return {
      status: 'accepted',
      estimated_ready_minutes: estimatedMinutes,
      estimated_ready_at: estimatedMinutes
        ? Timestamp.fromMillis(Date.now() + estimatedMinutes * 60_000) as any
        : '' as any,
    }
  }

  if (transition === 'reject') {
    const note = text(options.note)
    if (!note) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Rejection reason is required.',
      })
    }

    return {
      status: 'cancelled',
      kitchen_note: note,
    }
  }

  if (transition === 'mark_ready') return { status: 'ready' }
  if (transition === 'return_to_queue') return { status: 'accepted' }
  return { status: 'completed' }
}
