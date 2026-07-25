import type { InterlakenPublicCopyKey } from './sproochli-copy-public'

export type MarketplacePreviewOffer = {
  id: string
  weight: string
  labelKey: InterlakenPublicCopyKey
}

export type MarketplacePreviewSeller = {
  id: string
  route: string
  categoryIds: string[]
  nameKey: InterlakenPublicCopyKey
  descriptionKey: InterlakenPublicCopyKey
  imageAltKey: InterlakenPublicCopyKey
  place: string
  offers: MarketplacePreviewOffer[]
}

// Source-controlled presentation only. These records are a reviewed storefront
// preview until the marketplace has a canonical Seller/Offer entity family.
export const marketplacePreviewSellers: MarketplacePreviewSeller[] = [
  {
    id: 'anja-honey',
    route: '/marktplatz/anja-honey',
    categoryIds: ['honig'],
    nameKey: 'storefront_honey_name',
    descriptionKey: 'storefront_honey_description',
    imageAltKey: 'storefront_honey_art_alt',
    place: 'Zweilütschinen',
    offers: [
      {
        id: 'honig-250g',
        weight: '250 g',
        labelKey: 'storefront_honey_250_label',
      },
      {
        id: 'honig-500g',
        weight: '500 g',
        labelKey: 'storefront_honey_500_label',
      },
    ],
  },
]

export function findMarketplacePreviewSeller(
  id: string
): MarketplacePreviewSeller | undefined {
  return marketplacePreviewSellers.find(seller => seller.id === id)
}
