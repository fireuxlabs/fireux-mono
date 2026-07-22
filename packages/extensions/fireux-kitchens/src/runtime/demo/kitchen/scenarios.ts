// Concurrent edit — 2026-07-22 13:15 CEST — Demo World pass: replace disconnected target fixtures with one coherent fictional Kitchen world.
// Concurrent edit — 2026-07-22 12:40 CEST — Demo World correction: preserve Deanos and Garden Room as two coherent Demo worlds.
// Concurrent edit — 2026-07-22 14:12 CEST — Demo surface selectors: name the Menu, Kiosk and Service scenarios independently.
// Concurrent edit — 2026-07-22 13:11 CEST — Demo Kitchen identity pass: default to Misebox Restaurant and retain Deanos Smash Burger as the service contrast.
import { PlaceModel, type Place } from 'fireux-places/runtime/models/place.model'
import type { SparseBrandPalette } from 'fireux-core/runtime/models/core/style.model'
import { KitchenModel, type Kitchen } from '../../models/kitchen.model'
import type { KitchenFulfilmentPaymentPolicy } from '../../models/kitchen.model'
import {
  deanosKitchenDemoCatalogue,
  miseboxRestaurantKitchenDemoCatalogue,
} from './catalogue'
import {
  deanosKitchenDemoIdentity,
  kitchenDemoCreated,
  kitchenDemoUpdated,
  miseboxRestaurantKitchenDemoIdentity,
} from './fixtures'
import {
  deanosKitchenDemoMiseTasks,
  deanosKitchenDemoOrders,
  deanosKitchenDemoStations,
  miseboxRestaurantKitchenDemoMiseTasks,
  miseboxRestaurantKitchenDemoOrders,
  miseboxRestaurantKitchenDemoStations,
} from './operations'
import type {
  KitchenDemoCatalogue,
  KitchenDemoIdentity,
  KitchenDemoScenario,
} from './types'

type DemoKitchenInput = {
  identity: KitchenDemoIdentity
  name: string
  tagline: string
  palette: SparseBrandPalette
  paymentMethods: KitchenFulfilmentPaymentPolicy[]
  tableCount: number
}

type DemoPlaceInput = {
  identity: KitchenDemoIdentity
  name: string
  shortName: string
  tagline: string
  city: string
  postalCode: string
  region: string
  street: string
  lat: number
  lng: number
  palette: SparseBrandPalette
}

const kitchen = (input: DemoKitchenInput): Kitchen => ({
  ...KitchenModel,
  id: input.identity.kitchenId,
  place_id: input.identity.placeId,
  slug: input.identity.kitchenSlug,
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
    style: {
      background_color_light: '#f7f3ea',
      background_color_dark: '#172019',
      font_color_light: '#27332b',
      font_color_dark: '#f7f3ea',
      title_color_light: '#172019',
      title_color_dark: '#fffaf0',
      primary_color: input.palette.primary_color,
      secondary_color: input.palette.secondary_color,
      font_source: 'system',
      title_font_source: 'system',
    },
  },
  orders: {
    printing: {
      ticket_device_id: '',
    },
  },
  tables: {
    count: input.tableCount,
  },
  fulfilment: {
    delivery_zones: [],
    payment_methods: input.paymentMethods,
  },
  created: kitchenDemoCreated(input.identity),
  updated: kitchenDemoUpdated(),
})

const place = (input: DemoPlaceInput): Place => ({
  ...PlaceModel,
  id: input.identity.placeId,
  name: input.name,
  short_name: input.shortName,
  brand_tagline: input.tagline,
  about: 'A deterministic read-only venue used to explore Misebox without changing Live or Test data.',
  formatted_address:
    `${input.street}, ${input.postalCode} ${input.city}, Switzerland`,
  short_address: `${input.city}, Switzerland`,
  address: {
    street: input.street,
    city: input.city,
    region: input.region,
    postal_code: input.postalCode,
    country_code: 'CH',
  },
  lat: input.lat,
  lng: input.lng,
  timezone: 'Europe/Zurich',
  brand_palette: input.palette,
  types: ['restaurant'],
  tags: ['demo', 'restaurant'],
  price_level: '2',
  default_currency_code: 'CHF',
  business_hours: {
    windows: [
      {
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        open: '11:30',
        close: '22:00',
      },
      {
        days: ['saturday', 'sunday'],
        open: '10:00',
        close: '22:00',
      },
    ],
  },
  verified: false,
  slug: input.identity.kitchenSlug,
  entity_families: ['kitchen'],
  source: 'manual',
  search_term: `${input.name} ${input.city}`,
  created: {
    at: kitchenDemoCreated(input.identity).at,
    by: 'demo',
  },
  updated: {
    at: kitchenDemoUpdated().at,
    by: 'demo',
  },
})

const scenario = (input: {
  identity: KitchenDemoIdentity
  kitchen: Kitchen
  place: Place
  catalogue: KitchenDemoCatalogue
  orders: KitchenDemoScenario['orders']
  stations: KitchenDemoScenario['stations']
  miseTasks: KitchenDemoScenario['miseTasks']
}): KitchenDemoScenario => ({
  appId: input.identity.appId,
  kitchen: input.kitchen,
  place: input.place,
  rootMenu: input.catalogue.rootMenu,
  kitchenMenu: input.catalogue.kitchenMenu,
  dishes: input.catalogue.dishes,
  menuSections: input.catalogue.menuSections,
  orders: input.orders,
  stations: input.stations,
  miseTasks: input.miseTasks,
})

const deanosPalette = {
  primary_color: '#d2472f',
  secondary_color: '#e5aa37',
} satisfies SparseBrandPalette

export const deanosKitchenDemoScenario = scenario({
  identity: deanosKitchenDemoIdentity,
  kitchen: kitchen({
    identity: deanosKitchenDemoIdentity,
    name: 'Deanos Smash Burger',
    tagline: 'A focused smash-burger service',
    palette: deanosPalette,
    paymentMethods: [
      {
        method: 'online_card',
        order_types: ['collection'],
      },
      {
        method: 'card_at_pickup',
        order_types: ['collection', 'eat_in', 'takeaway'],
      },
    ],
    tableCount: 8,
  }),
  place: place({
    identity: deanosKitchenDemoIdentity,
    name: 'Deanos Smash Burger',
    shortName: 'Deanos',
    tagline: 'Straight-up smash burgers, fries and fast service',
    street: '1 Burger Lane',
    city: 'Bern',
    postalCode: '3000',
    region: 'BE',
    lat: 46.948,
    lng: 7.4474,
    palette: deanosPalette,
  }),
  catalogue: deanosKitchenDemoCatalogue,
  orders: deanosKitchenDemoOrders,
  stations: deanosKitchenDemoStations,
  miseTasks: deanosKitchenDemoMiseTasks,
})

const miseboxRestaurantPalette = {
  primary_color: '#bb4d2f',
  secondary_color: '#52705c',
} satisfies SparseBrandPalette

export const miseboxRestaurantKitchenDemoScenario = scenario({
  identity: miseboxRestaurantKitchenDemoIdentity,
  kitchen: kitchen({
    identity: miseboxRestaurantKitchenDemoIdentity,
    name: 'Misebox Restaurant',
    tagline: 'A polished seasonal Menu and Kiosk',
    palette: miseboxRestaurantPalette,
    paymentMethods: [
      {
        method: 'card_at_pickup',
        order_types: ['eat_in', 'takeaway'],
      },
    ],
    tableCount: 12,
  }),
  place: place({
    identity: miseboxRestaurantKitchenDemoIdentity,
    name: 'Misebox Restaurant',
    shortName: 'Misebox Restaurant',
    tagline: 'Seasonal plates in a relaxed garden dining room',
    street: '2 Misebox Garden',
    city: 'Zurich',
    postalCode: '8000',
    region: 'ZH',
    lat: 47.3769,
    lng: 8.5417,
    palette: miseboxRestaurantPalette,
  }),
  catalogue: miseboxRestaurantKitchenDemoCatalogue,
  orders: miseboxRestaurantKitchenDemoOrders,
  stations: miseboxRestaurantKitchenDemoStations,
  miseTasks: miseboxRestaurantKitchenDemoMiseTasks,
})

export const defaultKitchenDemoScenario = miseboxRestaurantKitchenDemoScenario
export const featuredMenuDemoScenario = defaultKitchenDemoScenario
export const featuredKioskDemoScenario = defaultKitchenDemoScenario
export const featuredServiceDemoScenario = deanosKitchenDemoScenario

export const kitchenDemoScenarios: KitchenDemoScenario[] = [
  defaultKitchenDemoScenario,
  deanosKitchenDemoScenario,
]

export type { KitchenDemoScenario } from './types'
