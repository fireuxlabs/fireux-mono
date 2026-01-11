import type { FirebaseProduct } from '../../../../../../../models/objects/product.model'

export namespace ProductCard {
  export type Card = {
    id: string
    to: string

    name: string
    description: string

    imageUrl: string
    badges: string[]
  }
}

export function useProductInterface() {
  function map(product: FirebaseProduct): ProductCard.Card {
    const imageUrl =
      product.main_image ||
      product.images?.[0]?.url ||
      ''

    return {
      id: product.id,
      to: `/products/${product.id}`,

      name: product.name,
      description: product.description || '',

      imageUrl,
      badges: [],
    }
  }

  function card(target?: FirebaseProduct | null | undefined): ProductCard.Card | null {
    return target ? map(target) : null
  }

  function searchText(product: FirebaseProduct): string {
    return `${product.name} ${product.id}`.toLowerCase()
  }

  return { card, searchText }
}
