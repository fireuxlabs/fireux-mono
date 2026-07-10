import type { MenuOrderTypeStrategy } from '../order-type.ts'

export const collectionOrderType = {
  type: 'collection',
  allowedChannels: ['menu'],
  defaultChannel: 'menu',
  destination: 'collection',
  schedule: 'collection',
  requiresAcceptance: true,
  resolvesDelivery: false,
  recordsRequestedFor: false,
} as const satisfies MenuOrderTypeStrategy
