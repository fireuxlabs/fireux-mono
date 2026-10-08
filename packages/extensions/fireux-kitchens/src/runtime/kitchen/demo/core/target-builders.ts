import type { SparseBrandPalette } from 'fireux-core/runtime/models/utils/style.model'
import type { ThemePalette } from 'fireux-core/types/theme'
import type { Place } from 'fireux-places/runtime/place/models/place.model'
import {
  normalizePlace,
  PlaceDefaults,
} from 'fireux-places/runtime/place/utils/normalize-place'
import type { Kitchen } from '../../models/kitchen.model.ts'
import type {
  KitchenConfiguration,
  KitchenOrdersConfig,
} from '../../models/kitchen-configuration.model.ts'
import type { KitchenFulfilment, KitchenFulfilmentPaymentPolicy } from '../../models/fulfilment.model.ts'
import { kitchenDemoCreated, kitchenDemoUpdated } from './fixtures'
import type { KitchenDemoAccess, KitchenDemoIdentity } from './types'

export type KitchenDemoTarget = {
  appId: string
  access: KitchenDemoAccess
  identity: KitchenDemoIdentity
  kitchen: Kitchen
  configuration: KitchenConfiguration
  fulfilment: KitchenFulfilment
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
  imageShade?: 'light' | 'dark' | 'none'
  businessHours?: Place['business_hours']
}

export const kitchen = (input: DemoKitchenInput) => ({
  kitchen: {
    id: input.identity.kitchenId,
    identity: {
      source: 'place',
      slug: input.identity.kitchenSlug,
      status: 'active',
      visibility: true,
    },
  } satisfies Kitchen,
  configuration: {
    theme: { palette: input.themePalette },
    orders: {
      ...(input.operationHours
        ? { operation_hours: input.operationHours }
        : {}),
      printing: { ticket_device_id: '' },
    },
  } satisfies KitchenConfiguration,
  fulfilment: {
    delivery_zones: [],
    payment_methods: input.paymentMethods,
  } satisfies KitchenFulfilment,
})

export const place = (input: DemoPlaceInput): Place => ({
  ...PlaceDefaults,
  id: input.identity.placeId,
  name: input.name,
  short_name: input.shortName,
  tagline: input.tagline,
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
  logo_image: input.logoImage ?? '',
  wordmark_image: input.wordmarkImage ?? '',
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
  targetKitchen: ReturnType<typeof kitchen>,
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
    kitchen: targetKitchen.kitchen,
    configuration: targetKitchen.configuration,
    fulfilment: targetKitchen.fulfilment,
    place: resolvedPlace,
  }
}
