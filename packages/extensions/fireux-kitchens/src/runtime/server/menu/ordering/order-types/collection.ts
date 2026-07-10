import type { MenuOrderTypeStrategy } from '../order-type.ts'

export const collectionOrderType = {
  type: 'collection',
  allowedChannels: ['menu'],
  defaultChannel: 'menu',
  destination: 'collection',
  schedule: 'collection',
  initialStatus: 'pending_acceptance',
  resolvesDelivery: false,
  recordsRequestedFor: false,
} as const satisfies MenuOrderTypeStrategy
