import type { Order } from '../models/order.model'
import { OrderSubmissionStates, type OrderSubmission, type OrderSubmissionState } from '../models/order-submission.model'
import { readOrder } from './ordering'

export function orderSubmissionIssues(order: Order): string[] {
  const issues: string[] = []
  if (!['pos', 'kiosk', 'website'].includes(order.channel)) issues.push('Choose a supported channel.')
  if (!order.fulfilment) issues.push('Choose fulfilment.')
  if (!order.lines.length) issues.push('Add at least one item.')
  if (order.channel === 'pos' && (!order.placed_by?.id || !order.placed_by.name)) issues.push('Staff identity is required.')
  if (order.channel === 'website' && ['collection', 'delivery'].includes(order.fulfilment || '')) {
    if (!order.customer?.name) issues.push('Customer name is required.')
    if (!order.customer?.phone) issues.push('Contact phone is required.')
  }
  if (order.fulfilment === 'delivery' && !order.delivery_address) issues.push('Delivery address is required.')
  if (order.fulfilment && ['pos', 'kiosk'].includes(order.channel) && !['on_site', 'takeaway'].includes(order.fulfilment || '')) issues.push('POS and Kiosk support eat-in or takeaway.')
  if (order.channel === 'website' && order.fulfilment === 'on_site' && !order.location?.name) issues.push('Table or location is required.')
  return issues
}

export function initialOrderSubmissionState(order: Order): OrderSubmissionState {
  return order.channel === 'website' && ['collection', 'delivery'].includes(order.fulfilment || '') ? 'received' : 'accepted'
}

export function canTransitionOrder(from: OrderSubmissionState, to: OrderSubmissionState): boolean {
  const transitions: Record<OrderSubmissionState, OrderSubmissionState[]> = {
    received: ['accepted', 'declined'], accepted: ['preparing'], preparing: ['ready'], ready: ['completed'], declined: [], completed: [],
  }
  return transitions[from]?.includes(to) || false
}

export function readOrderSubmission(value: unknown): OrderSubmission {
  if (!value || typeof value !== 'object') throw new Error('Order response is invalid.')
  const row = value as Record<string, unknown>
  if (!OrderSubmissionStates.includes(row.state as OrderSubmissionState) || !Number.isSafeInteger(row.revision) || Number(row.revision) < 1 || typeof row.message !== 'string' || row.message.length > 500 || !(row.estimate_minutes === null || Number.isInteger(row.estimate_minutes) && Number(row.estimate_minutes) >= 1 && Number(row.estimate_minutes) <= 1440)) throw new Error('Order response is invalid.')
  const pricing = row.pricing as OrderSubmission['pricing']
  if (pricing && (!/^[A-Z]{3}$/.test(pricing.currency) || !Number.isFinite(pricing.total) || pricing.total < 0 || !Array.isArray(pricing.lines) || pricing.lines.some(line => typeof line.line_id !== 'string' || !Number.isFinite(line.unit_price) || line.unit_price < 0 || !Number.isFinite(line.total) || line.total < 0))) throw new Error('Order pricing is invalid.')
  return { ...(pricing ? {pricing: {currency:pricing.currency,total:pricing.total,lines:pricing.lines.map(line=>({...line}))}} : {}), order: readOrder(row.order), state: row.state as OrderSubmissionState, revision: Number(row.revision), message: row.message, estimate_minutes: row.estimate_minutes as number | null }
}
