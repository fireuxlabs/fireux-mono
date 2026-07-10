import type { MenuOrderTypeStrategy } from '../order-type.ts'

export const dineInOrderType = {
  type: 'dine_in',
  allowedChannels: ['table_qr', 'staff_pos'],
  defaultChannel: 'table_qr',
  destination: 'table',
  schedule: 'none',
  requiresAcceptance: false,
  handoff: 'table_service',
  resolvesDelivery: false,
  recordsRequestedFor: false,
} as const satisfies MenuOrderTypeStrategy
