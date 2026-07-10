import type { MenuOrderTypeStrategy } from '../order-type.ts'

export const preOrderOrderType = {
  type: 'pre_order',
  allowedChannels: ['menu'],
  defaultChannel: 'menu',
  destination: 'none',
  schedule: 'requested_for',
  requiresAcceptance: true,
  resolvesDelivery: false,
  recordsRequestedFor: true,
} as const satisfies MenuOrderTypeStrategy
