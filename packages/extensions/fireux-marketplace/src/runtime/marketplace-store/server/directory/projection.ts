import type {
  MarketplaceOfferDirectoryEntry,
  MarketplaceStoreDirectoryEntry,
} from '../../models/marketplace-api.model.ts'
import type {
  MarketplaceOffer,
  MarketplaceStore,
} from '../../models/marketplace.model.ts'

export function projectMarketplaceOfferDirectoryEntry(
  offer: MarketplaceOffer
): MarketplaceOfferDirectoryEntry | null {
  if (offer.state !== 'published' || !offer.price) return null
  return {
    id: offer.id,
    title: offer.title,
    description: offer.description,
    unit_label: offer.unit_label,
    price: offer.price,
    section_ids: offer.section_ids,
    fulfilment_methods: offer.fulfilment_methods,
  }
}

export function projectMarketplaceStoreDirectoryEntry(
  store: MarketplaceStore,
  offers?: MarketplaceOffer[]
): MarketplaceStoreDirectoryEntry | null {
  if (store.publication_state !== 'published') return null
  const projectedOffers = offers
    ?.map(projectMarketplaceOfferDirectoryEntry)
    .filter((offer): offer is MarketplaceOfferDirectoryEntry => Boolean(offer))
    .sort((left, right) => left.title.localeCompare(right.title))
  return {
    id: store.id,
    slug: store.slug,
    name: store.name,
    description: store.description,
    locality: store.locality,
    image_url: store.image_url,
    image_alt: store.image_alt,
    section_ids: store.section_ids,
    fulfilment_methods: store.fulfilment_methods,
    ...(projectedOffers ? { offers: projectedOffers } : {}),
  }
}

export function projectMarketplaceStoreDirectoryPreview(
  store: MarketplaceStore
): MarketplaceStoreDirectoryEntry {
  return {
    id: store.id,
    slug: store.slug,
    name: store.name,
    description: store.description,
    locality: store.locality,
    image_url: store.image_url,
    image_alt: store.image_alt,
    section_ids: store.section_ids,
    fulfilment_methods: store.fulfilment_methods,
    publication_state: store.publication_state,
  }
}

export function projectMarketplaceStorePreview(
  store: MarketplaceStore,
  offers: MarketplaceOffer[]
): MarketplaceStoreDirectoryEntry {
  return {
    ...projectMarketplaceStoreDirectoryPreview(store),
    offers: offers
      .flatMap((offer): MarketplaceOfferDirectoryEntry[] =>
        offer.price
          ? [
              {
                id: offer.id,
                title: offer.title,
                description: offer.description,
                unit_label: offer.unit_label,
                price: offer.price,
                section_ids: offer.section_ids,
                fulfilment_methods: offer.fulfilment_methods,
              },
            ]
          : []
      )
      .sort((left, right) => left.title.localeCompare(right.title)),
  }
}
