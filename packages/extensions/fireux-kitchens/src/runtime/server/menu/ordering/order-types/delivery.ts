// Concurrent edit — 2026-07-19 17:02 CEST — Delivery pass: declare Delivery address and optional schedule strategy.
import type { MenuOrderTypeStrategy } from '../order-type.ts'

export const deliveryOrderType = {
  type: 'delivery',
  destination: 'none',
  schedule: 'optional_requested_for',
  resolvesDelivery: true,
  recordsRequestedFor: true,
} as const satisfies MenuOrderTypeStrategy
