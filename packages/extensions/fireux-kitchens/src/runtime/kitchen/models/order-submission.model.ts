import type { Order } from './order.model'

export const OrderSubmissionStates = ['received', 'accepted', 'declined', 'preparing', 'ready', 'completed'] as const
export type OrderSubmissionState = (typeof OrderSubmissionStates)[number]
/** Execution and caller ownership stay outside the requested Order facts. */
export type OrderSubmission = {
  order: Order
  state: OrderSubmissionState
  revision: number
  message: string
  pricing?: { currency: string; total: number; lines: Array<{line_id:string;unit_price:number;total:number}> }
  estimate_minutes: number | null
}
