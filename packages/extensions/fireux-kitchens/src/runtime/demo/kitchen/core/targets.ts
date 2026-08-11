import type { SparseBrandPalette } from 'fireux-core/runtime/models/utils/style.model'
import { hasExactPublicPlaceProjectionShape } from 'fireux-places/runtime/utils/public-place-projection'
import type { Kitchen } from '../../../models/kitchen.model'
import {
  deanosKitchenDemoIdentity,
  deanosKitchenDemoTeamMemberIds,
  kitchenDemoMediaUrl,
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

const deanosKitchenMedia = (relativePath: string) =>
  kitchenDemoMediaUrl(deanosKitchenDemoIdentity.kitchenId, relativePath)

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

export const deanosKitchenDemoTarget = target(
  deanosKitchenDemoIdentity,
  kitchen({
    identity: deanosKitchenDemoIdentity,
    management: {
      mode: 'app',
      app_id: deanosKitchenDemoIdentity.appId,
    },
    name: 'Deanos Smash Burger',
    tagline: 'Smashed to order. Served fast.',
    logoImageUrl: deanosKitchenMedia('logo.png'),
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

export const pizzaTheActionKitchenDemoTarget = target(
  pizzaTheActionKitchenDemoIdentity,
  kitchen({
    identity: pizzaTheActionKitchenDemoIdentity,
    management: { mode: 'console' },
    name: 'Pizza the Action',
    tagline: 'Big flavour. Zero drama.',
    logoImageUrl: kitchenDemoMediaUrl(
      pizzaTheActionKitchenDemoIdentity.kitchenId,
      'logo.png'
    ),
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
  })
)

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

export const miseboxRestaurantKitchenDemoTarget = target(
  miseboxRestaurantKitchenDemoIdentity,
  kitchen({
    identity: miseboxRestaurantKitchenDemoIdentity,
    management: { mode: 'console' },
    name: 'Misebox Restaurant',
    tagline: 'A polished seasonal Menu and Kiosk',
    logoImageUrl: kitchenDemoMediaUrl(
      miseboxRestaurantKitchenDemoIdentity.kitchenId,
      'logo.png'
    ),
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
  const logoImageUrl = String(item.kitchen.identity.logo_image_url ?? '').trim()
  const placeMedia = [
    item.place.image_url,
    item.place.cover_image,
    ...item.place.gallery_images,
  ]
    .map((value) => String(value ?? '').trim())
    .filter(Boolean)
  const teamIds = item.appSupport.team_ids
  const operatorIds = item.appSupport.operator_ids
  if (
    !kitchenId ||
    !placeId ||
    targetIds.has(kitchenId) ||
    kitchenId !== item.identity.kitchenId ||
    placeId !== item.identity.placeId ||
    !item.place.entity_families.includes('kitchen') ||
    String(item.place.name ?? '').trim() !==
      String(item.kitchen.identity.display_name ?? '').trim() ||
    item.appId !== item.identity.appId ||
    item.appSupport.id !== kitchenId ||
    item.publicPlace.id !== placeId ||
    !logoImageUrl ||
    placeMedia.includes(logoImageUrl) ||
    !hasExactPublicPlaceProjectionShape(item.publicPlace) ||
    item.appSupport.join_requests.length !== 0 ||
    new Set(teamIds).size !== teamIds.length ||
    new Set(operatorIds).size !== operatorIds.length ||
    operatorIds.some((id) => !teamIds.includes(id))
  ) {
    throw new Error('Kitchen Demo target identities are invalid.')
  }
  targetIds.add(kitchenId)
}
