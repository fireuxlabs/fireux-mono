import { useRequestFetch } from '#imports'
import type { MenuDetailPayload } from 'fireux-kitchens/runtime/menu/models/menu-detail.model'

const interlakenPizza = {
  id: 'ChIJWcym7tulj0cRb3N2twqVj1U',
  menuId: 'pizza-menu',
  slug: 'interlaken-pizza',
} as const

type PlaceIdentityAssets = {
  place: {
    tagline?: string
    cover_image?: string
    logo_image?: string
    wordmark_image?: string
  }
}

export async function useDefaultKioskSkinPreview() {
  const requestFetch = useRequestFetch()
  const [payload, place] = await Promise.all([
    requestFetch<MenuDetailPayload>(
      `/api/menus/${interlakenPizza.menuId}?kitchenSlug=${interlakenPizza.slug}`
    ),
    requestFetch<PlaceIdentityAssets>(`/api/places/${interlakenPizza.id}`),
  ])

  if (payload.kind !== 'manifest') {
    throw new Error(
      'Interlaken Pizza does not expose a renderable Menu manifest.'
    )
  }

  const manifest = {
    ...payload.manifest,
    behaviour: {
      ...payload.manifest.behaviour,
      ordering: {
        enabled: true,
        order_types: [
          { type: 'eat_in' as const },
          { type: 'takeaway' as const },
        ],
      },
      orderingEnabled: true,
      orderTypes: ['eat_in' as const, 'takeaway' as const],
      availableOrderTypes: ['eat_in' as const, 'takeaway' as const],
      defaultOrderType: 'eat_in' as const,
      defaultOrderTypeConfig: { type: 'eat_in' as const },
    },
    presentation: {
      ...payload.manifest.presentation,
      kitchenImageUrl: place.place.cover_image,
      kitchenLogoImageUrl: place.place.logo_image,
      kitchenWordmarkImageUrl: place.place.wordmark_image,
    },
  }

  return {
    manifest,
    kitchen: {
      id: manifest.source.kitchenId,
      label: manifest.presentation.kitchenName,
      tagline: String(place.place.tagline || '').trim(),
    },
  }
}
