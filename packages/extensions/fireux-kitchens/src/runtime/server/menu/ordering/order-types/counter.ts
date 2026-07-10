import type { MenuOrderTypeStrategy } from '../order-type.ts'

const counterOrderType = (
  type: 'eat_in' | 'takeaway',
  handoff: 'tray' | 'bag'
): MenuOrderTypeStrategy => ({
  type,
  allowedChannels: ['kiosk', 'staff_pos'],
  defaultChannel: 'kiosk',
  destination: 'none',
  schedule: 'none',
  requiresAcceptance: false,
  handoff,
  resolvesDelivery: false,
  recordsRequestedFor: false,
})

export const eatInOrderType = counterOrderType('eat_in', 'tray')
export const takeawayOrderType = counterOrderType('takeaway', 'bag')
