import type { MenuOrderTypeStrategy } from '../order-type.ts'

export const deliveryOrderType = {
  type: 'delivery',
  destination: 'none',
  schedule: 'none',
  resolvesDelivery: true,
  recordsRequestedFor: false,
} as const satisfies MenuOrderTypeStrategy
