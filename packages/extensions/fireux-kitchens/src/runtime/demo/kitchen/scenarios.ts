// Concurrent edit — 2026-07-20 17:17 CEST — Demo Data Spine pass: replace legacy kitchen world data with typed console-only scenarios.
import {
  KitchenModel,
  type Kitchen,
} from '../../models/kitchen.model'
import {
  KitchenOrderModel,
  type KitchenOrder,
  type KitchenOrderStatus,
} from '../../models/kitchen/order.model'
import {
  PlaceModel,
  type Place,
} from 'fireux-places/runtime/models/place.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

export type KitchenDemoScenario = {
  kitchen: Kitchen
  place: Place
  orders: KitchenOrder[]
}

const timestamp = (seconds: number): FirebaseTimestamp => ({
  seconds,
  nanoseconds: 0,
})

const makeKitchen = (input: {
  id: string
  placeId: string
  name: string
  tagline: string
}): Kitchen => ({
  ...KitchenModel,
  id: input.id,
  place_id: input.placeId,
  slug: input.id,
  currency_code: 'CHF',
  app_scope: {
    state: 'root_only',
    app_id: '',
  },
  visibility: {
    show: true,
    active: true,
    is_test: false,
  },
  identity: {
    display_name: input.name,
    tagline: input.tagline,
    image_url: '',
    gallery: [],
    image_shade: 'none',
    wordmark_no_logo_image_url: '',
    wordmark_image_url: '',
  },
  menus: {
    currency_format: 'dash',
    show_currency: true,
    available: true,
  },
  orders: {
    modes: ['collection'],
    default_lead_time_minutes: 20,
    acceptance_required: true,
    operation_hours: {
      source: 'custom',
      timezone: 'Europe/Zurich',
      windows: [],
    },
    printing: {
      ticket_device_id: '',
    },
  },
  tables: {
    count: 0,
  },
  fulfilment: {
    delivery_zones: [],
    payment_methods: [],
  },
  created: {
    at: timestamp(1_720_000_000),
    by: undefined,
    app_id: undefined,
  },
  updated: {
    at: timestamp(1_720_000_000),
    by: undefined,
  },
})

const makePlace = (input: {
  id: string
  slug: string
  name: string
  street: string
  city: string
  postalCode: string
}): Place => ({
  ...PlaceModel,
  id: input.id,
  name: input.name,
  short_name: input.name,
  brand_tagline: '',
  about: '',
  formatted_address: `${input.street}, ${input.postalCode} ${input.city}, Switzerland`,
  short_address: `${input.city}, Switzerland`,
  address: {
    street: input.street,
    city: input.city,
    region: '',
    postal_code: input.postalCode,
    country_code: 'CH',
  },
  lat: 0,
  lng: 0,
  timezone: 'Europe/Zurich',
  image_url: '',
  cover_image: '',
  gallery_images: [],
  image_shade: 'none',
  phone: '',
  email: '',
  website: '',
  google_maps_url: '',
  social_links: {
    website: '',
    instagram: '',
    facebook: '',
    tiktok: '',
    linkedin: '',
    youtube: '',
  },
  place_type: 'physical',
  types: [],
  tags: [],
  price_level: '',
  default_currency_code: 'CHF',
  claimed_by: '',
  verified: false,
  slug: input.slug,
  entity_families: ['kitchen'],
  source: 'fireux',
  search_term: '',
  created: {
    at: timestamp(1_720_000_000),
    by: undefined,
  },
  updated: {
    at: timestamp(1_720_000_000),
    by: undefined,
  },
})

const makeOrder = (input: {
  id: string
  number: string
  status: KitchenOrderStatus
  serviceNumber: number
}): KitchenOrder => ({
  ...KitchenOrderModel,
  id: input.id,
  kitchen_id: 'deanos',
  menu_id: 'deanos-menu',
  order_number: input.number,
  service_id: 'demo-lunch-service',
  service_number: input.serviceNumber,
  status: input.status,
  order_type: 'collection',
  requested_for: '',
  collection: {
    mode: 'queue',
  },
  table: {},
  room_service: {},
  estimated_ready_minutes: 20,
  estimated_ready_at: '',
  items: [
    {
      id: `${input.id}-burger`,
      source_item_id: 'deanos-classic-item',
      menu_id: 'deanos-menu',
      dish_id: 'deanos-classic',
      item_kind: 'food',
      label: 'Deanos Classic',
      unit_price: 19,
      quantity: 1,
      checked: false,
    },
  ],
  fulfilment_policy: {},
  fulfilment_match: {},
  driver_responses: {},
  customer: {
    name: `Demo guest ${input.serviceNumber}`,
  },
  kitchen_note: '',
  payment: input.status === 'pending_payment'
    ? {
        required: true,
        status: 'pending',
        method: 'online_card',
        amount_chf: 19,
        currency_code: 'CHF',
      }
    : {
        required: false,
        status: 'not_required',
        currency_code: 'CHF',
      },
  channel: 'menu',
  created: {
    at: timestamp(1_720_000_000 + input.serviceNumber),
    by: 'demo-console',
    app_id: 'demo-console',
  },
  updated: {
    at: timestamp(1_720_000_000 + input.serviceNumber),
    by: 'demo-console',
  },
})

export const kitchenDemoScenarios: KitchenDemoScenario[] = [
  {
    kitchen: makeKitchen({
      id: 'deanos',
      placeId: 'demo-deanos-place',
      name: 'Deanos',
      tagline: 'Read-only burger kitchen',
    }),
    place: makePlace({
      id: 'demo-deanos-place',
      slug: 'deanos',
      name: 'Deanos',
      street: '1 Burger Lane',
      city: 'Bern',
      postalCode: '3000',
    }),
    orders: [
      makeOrder({ id: 'demo-order-payment', number: '1041', status: 'pending_payment', serviceNumber: 1 }),
      makeOrder({ id: 'demo-order-incoming', number: '1042', status: 'pending_acceptance', serviceNumber: 2 }),
      makeOrder({ id: 'demo-order-queue', number: '1043', status: 'accepted', serviceNumber: 3 }),
      makeOrder({ id: 'demo-order-pass', number: '1044', status: 'ready', serviceNumber: 4 }),
      makeOrder({ id: 'demo-order-recent', number: '1045', status: 'completed', serviceNumber: 5 }),
    ],
  },
  {
    kitchen: makeKitchen({
      id: 'garden-room',
      placeId: 'demo-garden-room-place',
      name: 'Garden Room',
      tagline: 'Read-only seasonal kitchen',
    }),
    place: makePlace({
      id: 'demo-garden-room-place',
      slug: 'garden-room',
      name: 'Garden Room',
      street: '2 Garden Way',
      city: 'Zurich',
      postalCode: '8000',
    }),
    orders: [],
  },
]
