import type { SparseBrandPalette } from 'fireux-core/runtime/models/utils/style.model'
import type { ThemePalette } from 'fireux-core/types/theme'
import {
  deanosKitchenDemoIdentity,
  deanosKitchenDemoTeamMemberIds,
  miseboxRestaurantKitchenDemoIdentity,
  placeDemoMediaUrl,
  pizzaTheActionKitchenDemoIdentity,
} from './fixtures'
import {
  kitchen,
  place,
  target,
  type KitchenDemoTarget,
} from './target-builders'

const deanosPalette = {
  primary_color: '#ff4f2e',
  secondary_color: '#181817',
} satisfies SparseBrandPalette

const deanosPlaceMedia = (filename: string) =>
  placeDemoMediaUrl(deanosKitchenDemoIdentity.placeId, `images/${filename}`)

const deanosProfileImage = deanosPlaceMedia('deanos-classic.jpg')

const deanosCoverImage = deanosPlaceMedia('double-trouble.jpg')

const deanosGalleryImages = [
  deanosProfileImage,
  deanosCoverImage,
  deanosPlaceMedia('hot-honey-chicken.jpg'),
  deanosPlaceMedia('dirty-deanos-fries.jpg'),
  deanosPlaceMedia('salted-caramel-shake.jpg'),
]

const deanosThemePalette = {
  canvas: '#f5f1e8',
  text: '#34312d',
  accent: '#ff4f2e',
  accent_contrast: '#fffaf0',
} satisfies ThemePalette

export const deanosKitchenDemoTarget = target(
  deanosKitchenDemoIdentity,
  kitchen({
    identity: deanosKitchenDemoIdentity,
    themePalette: deanosThemePalette,
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
    operationHours: {
      source: 'custom',
      timezone: 'Europe/Zurich',
      windows: [
        {
          days: [
            'monday',
            'tuesday',
            'wednesday',
            'thursday',
            'friday',
            'saturday',
            'sunday',
          ],
          open: '11:30',
          close: '22:00',
        },
      ],
    },
  }),
  place({
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
    logoImage: placeDemoMediaUrl(deanosKitchenDemoIdentity.placeId, 'logo.png'),
    imageUrl: deanosProfileImage,
    coverImage: deanosCoverImage,
    galleryImages: deanosGalleryImages,
    imageShade: 'none',
    businessHours: {
      windows: [
        {
          days: [
            'monday',
            'tuesday',
            'wednesday',
            'thursday',
            'friday',
            'saturday',
            'sunday',
          ],
          open: '11:30',
          close: '22:00',
        },
      ],
    },
  }),
  {
    teamIds: deanosKitchenDemoTeamMemberIds,
    operatorIds: deanosKitchenDemoTeamMemberIds,
  }
)

const pizzaTheActionPalette = {
  primary_color: '#1f6b45',
  secondary_color: '#f2c94c',
} satisfies SparseBrandPalette

const pizzaTheActionThemePalette = {
  canvas: '#fff7d6',
  text: '#345442',
  accent: '#123f2a',
  accent_contrast: '#fffbe8',
} satisfies ThemePalette

export const pizzaTheActionKitchenDemoTarget = target(
  pizzaTheActionKitchenDemoIdentity,
  kitchen({
    identity: pizzaTheActionKitchenDemoIdentity,
    themePalette: pizzaTheActionThemePalette,
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
  }),
  place({
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
    logoImage: placeDemoMediaUrl(
      pizzaTheActionKitchenDemoIdentity.placeId,
      'logo.png'
    ),
  })
)

const miseboxRestaurantPalette = {
  primary_color: '#914632',
  secondary_color: '#61715c',
} satisfies SparseBrandPalette

const miseboxRestaurantThemePalette = {
  canvas: '#eee7da',
  text: '#36433b',
  accent: '#914632',
  accent_contrast: '#fffaf1',
} satisfies ThemePalette

export const miseboxRestaurantKitchenDemoTarget = target(
  miseboxRestaurantKitchenDemoIdentity,
  kitchen({
    identity: miseboxRestaurantKitchenDemoIdentity,
    themePalette: miseboxRestaurantThemePalette,
    paymentMethods: [
      {
        method: 'card_at_pickup',
        order_types: ['eat_in', 'takeaway'],
      },
    ],
  }),
  place({
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
    logoImage: placeDemoMediaUrl(
      miseboxRestaurantKitchenDemoIdentity.placeId,
      'logo.png'
    ),
  })
)

export const kitchenDemoTargets = [
  miseboxRestaurantKitchenDemoTarget,
  deanosKitchenDemoTarget,
  pizzaTheActionKitchenDemoTarget,
] as const satisfies readonly KitchenDemoTarget[]

const targetIds = new Set<string>()

for (const item of kitchenDemoTargets) {
  const kitchenId = String(item.kitchen.id ?? '').trim()
  const placeId = String(item.place.id ?? '').trim()
  const logoImageUrl = String(item.place.logo_image ?? '').trim()
  const placeMedia = [
    item.place.image_url,
    item.place.cover_image,
    ...item.place.gallery_images,
  ]
    .map((value) => String(value ?? '').trim())
    .filter(Boolean)
  const teamIds = item.access.teamIds
  const operatorIds = item.access.operatorIds
  if (
    !kitchenId ||
    !placeId ||
    targetIds.has(kitchenId) ||
    kitchenId !== item.identity.kitchenId ||
    placeId !== item.identity.placeId ||
    !item.place.entity_families.includes('kitchen') ||
    kitchenId !== placeId ||
    item.appId !== item.identity.appId ||
    item.access.kitchenId !== kitchenId ||
    !logoImageUrl ||
    placeMedia.includes(logoImageUrl) ||
    new Set(teamIds).size !== teamIds.length ||
    new Set(operatorIds).size !== operatorIds.length ||
    operatorIds.some((id) => !teamIds.includes(id))
  ) {
    throw new Error('Kitchen Demo target identities are invalid.')
  }
  targetIds.add(kitchenId)
}
