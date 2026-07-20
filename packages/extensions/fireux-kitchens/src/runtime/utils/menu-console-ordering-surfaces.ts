// Concurrent edit — 2026-07-19 17:12 CEST — Pre-order pass: expose focused Pre-order configuration.
import type { KitchenOrderType } from '../models/kitchen/order.model'

export type MenuOrderTypeChoice = {
  type: KitchenOrderType
  label: string
  description: string
  route?: string
}

export type MenuOrderSurfaceOption = {
  key: string
  label: string
  description: string
  route?: string
  settingsPath?: string
  choices: MenuOrderTypeChoice[]
}

// 2026-07-19 16:05 CEST: This registry describes real configurable doorways. Public UI groupings such as Home options must not become configuration ownership layers.
export const menuOrderSurfaceOptions: MenuOrderSurfaceOption[] = [
  {
    key: 'delivery',
    label: 'Delivery',
    description: 'Deliver the order to a customer address.',
    route: '/menus/{menuId}.delivery',
    settingsPath: 'delivery',
    choices: [
      {
        type: 'delivery',
        label: 'Delivery',
        description: 'Deliver the order to a customer address.',
        route: '/menus/{menuId}.delivery',
      },
    ],
  },
  {
    key: 'collection',
    label: 'Collection',
    description: 'Prepare the order for customer collection.',
    route: '/menus/{menuId}.collection',
    settingsPath: 'collection',
    choices: [
      {
        type: 'collection',
        label: 'Collection',
        description: 'Prepare the order for customer collection.',
        route: '/menus/{menuId}.collection',
      },
    ],
  },
  {
    key: 'table-qr',
    label: 'Table QR',
    description: 'The customer is seated and enters through a table-specific QR.',
    route: '/menus/{menuId}.dine_in',
    choices: [
      {
        type: 'dine_in',
        label: 'Dine in',
        description: 'Send an order from a table to the Kitchen.',
        route: '/menus/{menuId}.dine_in',
      },
    ],
  },
  {
    key: 'kiosk',
    label: 'Kiosk',
    description: 'A shared terminal with eat-here and takeaway preparation flags.',
    route: '/menus/{menuId}.kiosk',
    settingsPath: 'kiosk',
    choices: [
      {
        type: 'eat_in',
        label: 'Eat here',
        description: 'Prepare the order for eating at the venue.',
      },
      {
        type: 'takeaway',
        label: 'Take away',
        description: 'Prepare and package the order for takeaway.',
      },
    ],
  },
  {
    key: 'pre-order',
    label: 'Pre-order',
    description: 'A timing-first request confirmed by the Kitchen.',
    route: '/menus/{menuId}.pre_order',
    settingsPath: 'pre-order',
    choices: [
      {
        type: 'pre_order',
        label: 'Pre-order',
        description: 'Allow customers to request a future time.',
        route: '/menus/{menuId}.pre_order',
      },
    ],
  },
  {
    key: 'room-service',
    label: 'Room service',
    description: 'Private internal delivery to a room within the venue.',
    route: '/menus/{menuId}.room_service',
    choices: [
      {
        type: 'room_service',
        label: 'Room service',
        description: 'Collect the room destination and guest name.',
        route: '/menus/{menuId}.room_service',
      },
    ],
  },
]
