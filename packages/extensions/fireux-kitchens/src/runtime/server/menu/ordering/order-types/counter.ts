import type { MenuOrderTypeStrategy } from '../order-type.ts'

const counterOrderType = (
  type: 'eat_in' | 'takeaway'
): MenuOrderTypeStrategy => ({
  type,
  allowedChannels: ['kiosk', 'staff_pos'],
  defaultChannel: 'kiosk',
  destination: 'none',
  schedule: 'none',
  initialStatus: 'open',
  resolvesDelivery: false,
  recordsRequestedFor: false,
})

export const eatInOrderType = counterOrderType('eat_in')
export const takeawayOrderType = counterOrderType('takeaway')
