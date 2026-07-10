import type { MenuOrderTypeStrategy } from '../order-type.ts'

export const dineInOrderType = {
  type: 'dine_in',
  allowedChannels: ['table_qr'],
  defaultChannel: 'table_qr',
  destination: 'table',
  schedule: 'none',
  initialStatus: 'open',
  resolvesDelivery: false,
  recordsRequestedFor: false,
} as const satisfies MenuOrderTypeStrategy
