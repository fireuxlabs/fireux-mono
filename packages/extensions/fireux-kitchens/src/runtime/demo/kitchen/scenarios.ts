// Concurrent edit — 2026-07-22 13:15 CEST — Demo World pass: replace disconnected target fixtures with one coherent fictional Kitchen world.
// Concurrent edit — 2026-07-22 12:40 CEST — Demo World correction: preserve Deanos and Garden Room as two coherent Demo worlds.
// Concurrent edit — 2026-07-22 14:12 CEST — Demo surface selectors: name the Menu, Kiosk and Service scenarios independently.
// Concurrent edit — 2026-07-22 13:11 CEST — Demo Kitchen identity pass: default to Misebox Restaurant and retain Deanos Smash Burger as the service contrast.
// Concurrent edit — 2026-07-22 13:48 CEST — Kiosk Demo selector pass: give each Demo Kitchen a distinct package-owned Menu theme.
// Concurrent edit — 2026-07-22 13:56 CEST — Kiosk theme contrast pass: separate refined dining from bold counter-service typography and colour.
// Concurrent edit — 2026-07-22 18:03 CEST — Deanos modernisation pass: align the Demo brand palette and typography with its new campaign photography.
// Concurrent edit — 2026-07-22 18:12 CEST — Pizza Demo pass: add a reusable green-and-yellow pizzeria presentation world.
import { PlaceModel, type Place } from 'fireux-places/runtime/models/place.model'
import type { SparseBrandPalette } from 'fireux-core/runtime/models/core/style.model'
import { KitchenModel, type Kitchen } from '../../models/kitchen.model'
import type { KitchenFulfilmentPaymentPolicy } from '../../models/kitchen.model'
import {
  deanosKitchenDemoCatalogue,
  miseboxRestaurantKitchenDemoCatalogue,
  pizzaTheActionKitchenDemoCatalogue,
} from './catalogue'
import {
  deanosKitchenDemoIdentity,
  kitchenDemoCreated,
  kitchenDemoUpdated,
  miseboxRestaurantKitchenDemoIdentity,
  pizzaTheActionKitchenDemoIdentity,
} from './fixtures'
import {
  deanosKitchenDemoMiseTasks,
  deanosKitchenDemoOrders,
  deanosKitchenDemoStations,
  miseboxRestaurantKitchenDemoMiseTasks,
  miseboxRestaurantKitchenDemoOrders,
  miseboxRestaurantKitchenDemoStations,
  pizzaTheActionKitchenDemoMiseTasks,
  pizzaTheActionKitchenDemoOrders,
  pizzaTheActionKitchenDemoStations,
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
  menuStyle: NonNullable<Kitchen['menus']['style']>
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
    style: input.menuStyle,
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
  primary_color: '#ff4f2e',
  secondary_color: '#181817',
} satisfies SparseBrandPalette

const deanosMenuStyle = {
  background_color_light: '#f5f1e8',
  background_color_dark: '#10100f',
  font_color_light: '#34312d',
  font_color_dark: '#f5f1e8',
  title_color_light: '#181817',
  title_color_dark: '#fffaf0',
  ...deanosPalette,
  font_source: 'google',
  font_family: 'Inter',
  title_font_source: 'google',
  title_font_family: 'Space Grotesk',
} satisfies NonNullable<Kitchen['menus']['style']>

export const deanosKitchenDemoScenario = scenario({
  identity: deanosKitchenDemoIdentity,
  kitchen: kitchen({
    identity: deanosKitchenDemoIdentity,
    name: 'Deanos Smash Burger',
    tagline: 'Smashed to order. Served fast.',
    menuStyle: deanosMenuStyle,
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
    tagline: 'Smashed to order. Served fast.',
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

const pizzaTheActionPalette = {
  primary_color: '#1f6b45',
  secondary_color: '#f2c94c',
} satisfies SparseBrandPalette

const pizzaTheActionMenuStyle = {
  background_color_light: '#fff7d6',
  background_color_dark: '#102d20',
  font_color_light: '#345442',
  font_color_dark: '#fff8dc',
  title_color_light: '#123f2a',
  title_color_dark: '#fffbe8',
  ...pizzaTheActionPalette,
  font_source: 'google',
  font_family: 'Inter',
  title_font_source: 'google',
  title_font_family: 'Montserrat',
} satisfies NonNullable<Kitchen['menus']['style']>

export const pizzaTheActionKitchenDemoScenario = scenario({
  identity: pizzaTheActionKitchenDemoIdentity,
  kitchen: kitchen({
    identity: pizzaTheActionKitchenDemoIdentity,
    name: 'Pizza the Action',
    tagline: 'Big flavour. Zero drama.',
    menuStyle: pizzaTheActionMenuStyle,
    palette: pizzaTheActionPalette,
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
    tableCount: 10,
  }),
  place: place({
    identity: pizzaTheActionKitchenDemoIdentity,
    name: 'Pizza the Action',
    shortName: 'Pizza the Action',
    tagline: 'Big flavour. Zero drama.',
    street: '8 Dough Street',
    city: 'Lucerne',
    postalCode: '6003',
    region: 'LU',
    lat: 47.0502,
    lng: 8.3093,
    palette: pizzaTheActionPalette,
  }),
  catalogue: pizzaTheActionKitchenDemoCatalogue,
  orders: pizzaTheActionKitchenDemoOrders,
  stations: pizzaTheActionKitchenDemoStations,
  miseTasks: pizzaTheActionKitchenDemoMiseTasks,
})

const miseboxRestaurantPalette = {
  primary_color: '#914632',
  secondary_color: '#61715c',
} satisfies SparseBrandPalette

const miseboxRestaurantMenuStyle = {
  background_color_light: '#eee7da',
  background_color_dark: '#11251d',
  font_color_light: '#36433b',
  font_color_dark: '#f1eadf',
  title_color_light: '#183328',
  title_color_dark: '#fffaf1',
  ...miseboxRestaurantPalette,
  font_source: 'google',
  font_family: 'Lora',
  title_font_source: 'google',
  title_font_family: 'Cormorant Garamond',
} satisfies NonNullable<Kitchen['menus']['style']>

export const miseboxRestaurantKitchenDemoScenario = scenario({
  identity: miseboxRestaurantKitchenDemoIdentity,
  kitchen: kitchen({
    identity: miseboxRestaurantKitchenDemoIdentity,
    name: 'Misebox Restaurant',
    tagline: 'A polished seasonal Menu and Kiosk',
    menuStyle: miseboxRestaurantMenuStyle,
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
  pizzaTheActionKitchenDemoScenario,
]

export type { KitchenDemoScenario } from './types'
