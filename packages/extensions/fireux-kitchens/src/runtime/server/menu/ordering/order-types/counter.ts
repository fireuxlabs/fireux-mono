import type { MenuOrderTypeStrategy } from '../order-type.ts'

const counterOrderType = (
  type: 'eat_in' | 'takeaway',
  handoff: 'tray' | 'bag'
): MenuOrderTypeStrategy => ({
  type,
  destination: 'none',
  schedule: 'none',
  handoff,
  resolvesDelivery: false,
  recordsRequestedFor: false,
})

export const eatInOrderType = counterOrderType('eat_in', 'tray')
export const takeawayOrderType = counterOrderType('takeaway', 'bag')
