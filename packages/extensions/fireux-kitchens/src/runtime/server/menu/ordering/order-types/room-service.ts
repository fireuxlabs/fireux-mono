import type { MenuOrderTypeStrategy } from '../order-type.ts'

export const roomServiceOrderType = {
  type: 'room_service',
  allowedChannels: ['room_service'],
  defaultChannel: 'room_service',
  destination: 'room_service',
  schedule: 'none',
  requiresAcceptance: true,
  resolvesDelivery: false,
  recordsRequestedFor: false,
} as const satisfies MenuOrderTypeStrategy
