import type {
  KitchenOrderChannel,
  KitchenOrderInitialStatus,
  KitchenOrderType,
} from 'fireux-kitchens/runtime/kitchen/utils/order'

export type OrderingMode = {
  label: string
  orderType?: KitchenOrderType
  publicPath?: string
  to?: string
}

export type OrderingSurface = {
  title: string
  description: string
  icon: string
  channel?: KitchenOrderChannel
  modes: OrderingMode[]
  parked?: boolean
  publicPath?: string
  to?: string
  unsharedProps: string[]
}

export const sharedProps = [
  'id',
  'kitchen_id',
  'menu_id',
  'order_number',
  'order_type',
  'channel',
  'status',
  'items[]',
  'payment.status',
]

export const intakeSteps: Array<{
  condition: string
  status: KitchenOrderInitialStatus
}> = [
  { condition: 'Payment outstanding', status: 'pending_payment' },
  { condition: 'Operator approval', status: 'pending_acceptance' },
  { condition: 'Automatic acceptance', status: 'accepted' },
]

export const orderingSurfaces: OrderingSurface[] = [
  {
    title: 'Browse',
    description: 'The published base menu remains readable and creates no KitchenOrder.',
    icon: 'i-lucide-book-open',
    publicPath: '/menus/{menuId}',
    modes: [
      {
        label: 'Browse',
      },
    ],
    unsharedProps: [
      'none',
    ],
  },
  {
    title: 'Home options',
    description: 'A grouping for the separate Delivery and Collection surfaces. Home is not itself a surface.',
    icon: 'i-lucide-house',
    modes: [
      {
        label: 'Delivery',
        orderType: 'delivery',
        publicPath: '/menus/{menuId}.delivery',
        to: '/ordering/delivery',
      },
      {
        label: 'Collection',
        orderType: 'collection',
        publicPath: '/menus/{menuId}.collection',
        to: '/ordering/collection',
      },
    ],
    unsharedProps: [
      'customer.address',
      'collection.mode',
      'requested_for',
      'fulfilment_match',
    ],
  },
  {
    title: 'Table QR',
    description: 'Customer is already seated. The table number is carried into the order.',
    icon: 'i-lucide-qr-code',
    channel: 'table_qr',
    publicPath: '/menus/{menuId}.dine_in',
    to: '/ordering/dine-in',
    modes: [
      {
        label: 'Dine in',
        orderType: 'dine_in',
        publicPath: '/menus/{menuId}.dine_in',
        to: '/ordering/dine-in',
      },
    ],
    unsharedProps: [
      'table.number',
      'fulfilment_match.reference',
      'fulfilment_match.handoff',
    ],
  },
  {
    title: 'Kiosk',
    description: 'One terminal surface. Eat here and Take away are internal preparation, handoff, and tax flags.',
    icon: 'i-lucide-tablet',
    channel: 'kiosk',
    publicPath: '/menus/{menuId}.kiosk',
    to: '/ordering/kiosk',
    modes: [
      {
        label: 'Eat in',
        orderType: 'eat_in',
        to: '/ordering/kiosk',
      },
      {
        label: 'Takeaway',
        orderType: 'takeaway',
        to: '/ordering/kiosk',
      },
    ],
    unsharedProps: [
      'customer.name',
      'fulfilment_match.reference',
      'fulfilment_match.handoff',
      'payment.method',
    ],
  },
  {
    title: 'Pre-order',
    description: 'Timing-first request. The kitchen confirms before deposit or final preparation.',
    icon: 'i-lucide-calendar-clock',
    channel: 'menu',
    publicPath: '/menus/{menuId}.pre_order',
    to: '/ordering/pre-order',
    modes: [
      {
        label: 'Pre-order',
        orderType: 'pre_order',
        publicPath: '/menus/{menuId}.pre_order',
        to: '/ordering/pre-order',
      },
    ],
    unsharedProps: [
      'requested_for',
      'fulfilment_policy.notice_hours',
      'customer.party_size',
      'payment',
    ],
  },
  {
    title: 'Room service',
    description: 'Internal delivery to a room inside a hotel, aparthotel, or venue.',
    icon: 'i-lucide-concierge-bell',
    channel: 'room_service',
    publicPath: '/menus/{menuId}.room_service',
    to: '/ordering/room-service',
    modes: [
      {
        label: 'Room service',
        orderType: 'room_service',
        publicPath: '/menus/{menuId}.room_service',
        to: '/ordering/room-service',
      },
    ],
    unsharedProps: [
      'room_service.room',
      'customer.name',
    ],
  },
  {
    title: 'Staff POS',
    description: 'Operator enters an in-store order quickly from the menu.',
    icon: 'i-lucide-monitor',
    channel: 'staff_pos',
    publicPath: '/menus/{menuId}.staff_pos',
    to: '/ordering/staff-pos',
    modes: [
      {
        label: 'Eat in',
        orderType: 'eat_in',
        to: '/ordering/staff-pos',
      },
      {
        label: 'Takeaway',
        orderType: 'takeaway',
        to: '/ordering/staff-pos',
      },
    ],
    unsharedProps: [
      'created.by',
      'table.number',
      'fulfilment_match.handoff',
      'payment.method',
    ],
  },
]
