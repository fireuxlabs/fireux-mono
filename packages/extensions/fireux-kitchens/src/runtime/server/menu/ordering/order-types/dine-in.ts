import type { MenuOrderTypeStrategy } from '../order-type.ts'

export const dineInOrderType = {
  type: 'dine_in',
  destination: 'table',
  schedule: 'none',
  handoff: 'table_service',
  resolvesDelivery: false,
  recordsRequestedFor: false,
} as const satisfies MenuOrderTypeStrategy
