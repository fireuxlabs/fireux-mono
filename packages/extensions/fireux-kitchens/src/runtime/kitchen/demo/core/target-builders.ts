import type { SparseBrandPalette } from 'fireux-core/runtime/models/utils/style.model'
import type { ThemePalette } from 'fireux-core/types/theme'
import {
  PlaceDefaults,
  type Place,
} from 'fireux-places/runtime/place/models/place.model'
import { normalizePlace } from 'fireux-places/runtime/place/utils/normalize-place'
import {
  KitchenDefaults,
  type Kitchen,
  type KitchenFulfilmentPaymentPolicy,
  type KitchenOrdersConfig,
} from '../../models/kitchen.model.ts'
import { kitchenDemoCreated, kitchenDemoUpdated } from './fixtures'
import type { KitchenDemoAccess, KitchenDemoIdentity } from './types'

export type KitchenDemoTarget = {
  appId: string
  access: KitchenDemoAccess
  identity: KitchenDemoIdentity
  kitchen: Kitchen
  place: Place
}

export type DemoKitchenInput = {
  identity: KitchenDemoIdentity
  themePalette: ThemePalette
  paymentMethods: KitchenFulfilmentPaymentPolicy[]
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
  logoImage?: string
  wordmarkImage?: string
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
  status: 'active',
  visibility: true,
  theme: { palette: input.themePalette },
  menus: {
    currency_format: 'dash',
    show_currency: true,
    available: true,
  },
  orders: {
    ...(input.operationHours ? { operation_hours: input.operationHours } : {}),
    printing: {
      ticket_device_id: '',
    },
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
  logo_image: input.logoImage ?? '',
  wordmark_image: input.wordmarkImage ?? '',
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
  const resolvedPlace = normalizePlace(targetPlace.id, targetPlace)
  if (!resolvedPlace) {
    throw new Error('Kitchen Demo Place is invalid.')
  }

  return {
    appId: identity.appId,
    access: {
      kitchenId: identity.kitchenId,
      teamIds: [...(access.teamIds ?? [])],
      operatorIds: [...(access.operatorIds ?? [])],
    },
    identity,
    kitchen: targetKitchen,
    place: resolvedPlace,
  }
}
