import type { MenuOrderTypeStrategy } from '../order-type.ts'

export const roomServiceOrderType = {
  type: 'room_service',
  destination: 'room_service',
  schedule: 'none',
  resolvesDelivery: false,
  recordsRequestedFor: false,
} as const satisfies MenuOrderTypeStrategy
