// Concurrent edit — 2026-07-20 15:11 CEST — Pre-order intake pass: define Pre-order as advance table service rather than generic fulfilment.
import type { MenuOrderTypeStrategy } from '../order-type.ts'

export const preOrderOrderType = {
  type: 'pre_order',
  destination: 'none',
  schedule: 'requested_for',
  handoff: 'table_service',
  resolvesDelivery: false,
  recordsRequestedFor: true,
} as const satisfies MenuOrderTypeStrategy
