import type {
  PublicMarketplaceOffer,
  PublicMarketplaceStore,
} from '../../models/marketplace-api.model'
import type {
  MarketplaceOffer,
  MarketplaceStore,
} from '../../models/marketplace.model'

export function projectPublicMarketplaceOffer(
  offer: MarketplaceOffer
): PublicMarketplaceOffer | null {
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

export function projectPublicMarketplaceStore(
  store: MarketplaceStore,
  offers?: MarketplaceOffer[]
): PublicMarketplaceStore | null {
  if (store.publication_state !== 'published') return null
  const projectedOffers = offers
    ?.map(projectPublicMarketplaceOffer)
    .filter((offer): offer is PublicMarketplaceOffer => Boolean(offer))
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
