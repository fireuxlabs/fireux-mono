import type { SparseBrandPalette } from 'fireux-core/runtime/models/utils/style.model'
import type { FireuxEntityManagement } from 'fireux-core/runtime/models/utils/scope.model'
import {
  PlaceDefaults,
  type Place,
} from 'fireux-places/runtime/place/models/place.model'
import type { PublicPlaceProjection } from 'fireux-places/runtime/place/models/place-public.model'
import { normalizePublicPlaceProjection } from 'fireux-places/runtime/place/utils/public-place-projection'
import {
  KitchenDefaults,
  type AppKitchen,
  type Kitchen,
  type KitchenFulfilmentConfig,
  type KitchenFulfilmentPaymentPolicy,
  type KitchenMenusConfig,
  type KitchenOrdersConfig,
  type KitchenTablesConfig,
} from '../../models/kitchen.model.ts'
import { kitchenDemoCreated, kitchenDemoUpdated } from './fixtures'
import type { KitchenDemoIdentity } from './types'

export type KitchenDemoTarget = {
  appId: string
  appSupport: AppKitchen
  identity: KitchenDemoIdentity
  kitchen: Kitchen
  place: Place
  publicPlace: PublicPlaceProjection
}

export type DemoKitchenInput = {
  identity: KitchenDemoIdentity
  management: FireuxEntityManagement
  name: string
  tagline: string
  logoImageUrl: string
  menuStyle: NonNullable<Kitchen['menus']['style']>
  palette: SparseBrandPalette
  paymentMethods: KitchenFulfilmentPaymentPolicy[]
  tableCount: number
  operationHours?: KitchenOrdersConfig['operation_hours']
}

export type DemoPlaceInput = {
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
  imageUrl?: string
  coverImage?: string
  galleryImages?: string[]
  imageShade?: Place['image_shade']
  businessHours?: Place['business_hours']
}

export const kitchen = (input: DemoKitchenInput): Kitchen => ({
  ...KitchenDefaults,
  id: input.identity.kitchenId,
  slug: input.identity.kitchenSlug,
  management: input.management,
  visibility: true,
  identity: {
    display_name: input.name,
    tagline: input.tagline,
    logo_image_url: input.logoImageUrl,
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
    ...(input.operationHours ? { operation_hours: input.operationHours } : {}),
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

export const place = (input: DemoPlaceInput): Place => ({
  ...PlaceDefaults,
  id: input.identity.placeId,
  name: input.name,
  short_name: input.shortName,
  brand_tagline: input.tagline,
  about:
    'A deterministic read-only venue used to explore Misebox without changing Live or Test data.',
  formatted_address: `${input.street}, ${input.postalCode} ${input.city}, Switzerland`,
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
  image_url: input.imageUrl ?? '',
  cover_image: input.coverImage ?? '',
  gallery_images: input.galleryImages ?? [],
  image_shade: input.imageShade ?? 'none',
  brand_palette: input.palette,
  types: ['restaurant'],
  tags: ['demo', 'restaurant'],
  price_level: '2',
  default_currency_code: 'CHF',
  business_hours: input.businessHours ?? {
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

export const target = (
  identity: KitchenDemoIdentity,
  targetKitchen: Kitchen,
  targetPlace: Place,
  access: {
    teamIds?: readonly string[]
    operatorIds?: readonly string[]
  } = {}
): KitchenDemoTarget => {
  const legacyConsoleSource = targetKitchen as unknown as {
    fulfilment: KitchenFulfilmentConfig
    menus: KitchenMenusConfig
    orders: KitchenOrdersConfig
    tables: KitchenTablesConfig
  }
  const publicPlace = normalizePublicPlaceProjection(
    targetPlace as unknown as Record<string, unknown>
  )
  if (!publicPlace) {
    throw new Error('Kitchen Demo Place public projection is invalid.')
  }

  return {
    appId: identity.appId,
    appSupport: {
      id: identity.kitchenId,
      team_ids: [...(access.teamIds ?? [])],
      operator_ids: [...(access.operatorIds ?? [])],
      join_requests: [],
      console: {
        fulfilment: legacyConsoleSource.fulfilment,
        menus: legacyConsoleSource.menus,
        orders: legacyConsoleSource.orders,
        tables: legacyConsoleSource.tables,
      },
      created: kitchenDemoCreated(identity),
      updated: kitchenDemoUpdated(),
    },
    identity,
    kitchen: targetKitchen,
    place: targetPlace,
    publicPlace,
  }
}
