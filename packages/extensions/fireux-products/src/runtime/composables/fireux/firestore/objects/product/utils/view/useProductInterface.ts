import { safeString } from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import type { FirebaseProduct } from '../../../../../../../models/objects/product.model'

export namespace ProductCard {
  export type Card = {
    id: string
    to: string

    // Media (empty string means unset)
    avatarUrl: string

    // Primary display fields
    title: string
    subtitle: string

    name: string
    description: string

    // Secondary media (empty string means unset)
    imageUrl: string

    // Status/label chips
    badges: string[]
  }
}

export function useProductInterface() {
  function map(product: FirebaseProduct): ProductCard.Card {
    const imageUrl =
      safeString(product.main_image) ||
      safeString(product.images?.[0]?.url)
    const id = safeString(product.id).trim()
    const name = safeString(product.name)
    const description = safeString(product.description)

    return {
      id,
      to: id ? `/products/${id}` : '',

      avatarUrl: imageUrl,
      title: name,
      subtitle: description,

      name,
      description,

      imageUrl,
      badges: [],
    }
  }

  function card(target?: FirebaseProduct | null | undefined): ProductCard.Card | null {
    if (!target) return null
    const mapped = map(target)
    return mapped.id ? mapped : null
  }

  function searchText(product: FirebaseProduct): string {
    const name = safeString(product.name)
    const id = safeString(product.id)
    return `${name} ${id}`.trim().toLowerCase()
  }

  return { card, searchText }
}
