import type { MenuOrderTypeStrategy } from '../order-type.ts'

export const preOrderOrderType = {
  type: 'pre_order',
  allowedChannels: ['menu'],
  defaultChannel: 'menu',
  destination: 'none',
  schedule: 'requested_for',
  initialStatus: 'pending_acceptance',
  resolvesDelivery: false,
  recordsRequestedFor: true,
} as const satisfies MenuOrderTypeStrategy
