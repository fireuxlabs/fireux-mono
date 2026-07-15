import type { MenuOrderTypeStrategy } from '../order-type.ts'

export const preOrderOrderType = {
  type: 'pre_order',
  destination: 'none',
  schedule: 'requested_for',
  resolvesDelivery: false,
  recordsRequestedFor: true,
} as const satisfies MenuOrderTypeStrategy
