import type { MenuOrderTypeStrategy } from '../order-type.ts'

export const deliveryOrderType = {
  type: 'delivery',
  allowedChannels: ['menu'],
  defaultChannel: 'menu',
  destination: 'none',
  schedule: 'none',
  requiresAcceptance: true,
  resolvesDelivery: true,
  recordsRequestedFor: false,
} as const satisfies MenuOrderTypeStrategy
