import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import { OrderStorage, type OrderStatus } from '../models/order.model'

const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  draft: ['submitted', 'cancelled'],
  submitted: ['accepted', 'cancelled'],
  accepted: ['in_progress', 'cancelled'],
  in_progress: ['ready'],
  ready: ['completed'],
  completed: [],
  cancelled: [],
}

export const normalizeOrderStatus = (value: unknown): OrderStatus => {
  const raw = String(value || '').trim() as OrderStatus | 'open' | 'closed'

  if (raw === 'open') return 'submitted'
  if (raw === 'closed') return 'completed'
  if (raw in ORDER_TRANSITIONS) return raw as OrderStatus

  return 'submitted'
}

export function useOrderUpdateStatus() {
  const { updateDocument } = useFirestoreUpdate()

  const canTransition = (from: unknown, to: OrderStatus) => {
    const current = normalizeOrderStatus(from)
    return ORDER_TRANSITIONS[current].includes(to)
  }

  const nextStatusFor = (status: unknown): OrderStatus | null => {
    const current = normalizeOrderStatus(status)
    const next = ORDER_TRANSITIONS[current][0]
    return next || null
  }

  const setStatus = async (orderId: string, status: OrderStatus) => {
    const id = String(orderId || '').trim()
    if (!id) throw new Error('Missing order id')

    await updateDocument(OrderStorage.collection, id, { status })
  }

  return {
    canTransition,
    nextStatusFor,
    setStatus,
    normalizeOrderStatus,
    transitions: ORDER_TRANSITIONS,
  }
}
