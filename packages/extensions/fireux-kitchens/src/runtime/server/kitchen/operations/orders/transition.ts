import { createError } from 'h3'
import { Timestamp } from 'firebase-admin/firestore'
import {
  isKitchenOrderStatus,
  kitchenOrderTransitionRule,
  type KitchenOrder,
  type KitchenOrderTransition,
} from '../../../../models/kitchen/order.model.ts'

export type KitchenOrderTransitionOptions = {
  estimatedMinutes?: number | null
  note?: string
  nowMs?: number
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
    if (order.status === 'trashed') {
      throw createError({
        statusCode: 409,
        statusMessage: 'Order is already trashed.',
      })
    }

    return { status: 'trashed' }
  }

  const rule = kitchenOrderTransitionRule(transition)
  if (order.status !== rule.from) {
    throw createError({
      statusCode: 409,
      statusMessage: `Cannot ${transition.replaceAll('_', ' ')} an order in ${order.status}.`,
    })
  }

  if (transition === 'accept') {
    const estimatedMinutes = readEstimatedMinutes(options.estimatedMinutes)
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
    const note = text(options.note)
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

function readEstimatedMinutes(value: number | null | undefined) {
  if (value === null) return 0
  if (value === undefined) return 45

  const minutes = Number(value)
  if (
    !Number.isInteger(minutes) ||
    minutes < 5 ||
    minutes > 90 ||
    minutes % 5 !== 0
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Estimated minutes must be 5 to 90 in five-minute steps.',
    })
  }

  return minutes
}
