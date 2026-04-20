import { computed, type Ref } from 'vue'
import type {
  PlaceImageShade,
  PlaceSocialLinks,
  PlaceSource,
} from 'fireux-places/runtime/models/place.model'
import {
  useKitchenInterface,
  type KitchenCard,
  type KitchenSurface,
} from './useKitchenInterface'

type KitchenProfileSurface = KitchenSurface & {
  website?: string
  phone?: string
  social_links?: Partial<PlaceSocialLinks>
  cover_image?: string
  gallery_images?: string[]
  about?: string
  verified?: boolean
}

export type KitchenProfileViewModel = {
  card: KitchenCard.Card
  title: string
  subtitle: string
  imageUrl?: string
  imageShade?: PlaceImageShade
  prop?: string
  website?: string
  address?: string
  phone?: string
  socialLinks?: Partial<PlaceSocialLinks>
  coverImage?: string
  galleryImages?: string[]
  about?: string
  verified?: boolean
  source?: PlaceSource
}

export function useKitchenProfileView(
  kitchenRef: Ref<KitchenProfileSurface | null | undefined>
) {
  const { interface: toCard } = useKitchenInterface()

  const card = computed(() => toCard(kitchenRef.value))

  const model = computed<KitchenProfileViewModel | null>(() => {
    const kitchen = kitchenRef.value
    if (!card.value || !kitchen) return null

    const address = card.value.shortAddress || card.value.formattedAddress

    return {
      card: card.value,
      title: card.value.title,
      subtitle: card.value.subtitle,
      imageUrl: card.value.imageUrl,
      imageShade: card.value.imageShade,
      prop: (kitchen as any)?.brand_tagline,
      website: (kitchen as any)?.website,
      address,
      phone: (kitchen as any)?.phone,
      socialLinks: (kitchen as any)?.social_links as
        | Partial<PlaceSocialLinks>
        | undefined,
      coverImage: (kitchen as any)?.cover_image,
      galleryImages: (
        (kitchen as any)?.gallery_images as string[] | undefined
      )?.slice(0, 3),
      about: (kitchen as any)?.about,
      verified: Boolean((kitchen as any)?.verified),
      source: (kitchen as any)?.source as PlaceSource | undefined,
    }
  })

  return {
    model,
    card,
  }
}
