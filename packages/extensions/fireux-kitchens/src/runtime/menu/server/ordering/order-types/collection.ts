import type { MenuOrderTypeStrategy } from '../order-type.ts'

export const collectionOrderType = {
  type: 'collection',
  destination: 'collection',
  schedule: 'collection',
  resolvesDelivery: false,
  recordsRequestedFor: false,
} as const satisfies MenuOrderTypeStrategy
