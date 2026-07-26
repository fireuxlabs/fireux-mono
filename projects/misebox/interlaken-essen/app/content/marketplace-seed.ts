import type {
  MarketplaceOfferCreateIntent,
  MarketplaceStoreCreateIntent,
} from 'fireux-marketplace/runtime/models/marketplace-api.model'

// Reviewed transition intent only. Nothing in this file writes remote data.
// An App Admin may explicitly create the canonical draft from the private
// marketplace administration page. Prices remain null until Anja confirms
// exact CHF amounts, so neither Offer can be published accidentally.
export const anjaHoneyDraftStore: MarketplaceStoreCreateIntent = {
  slug: 'anja-honey',
  name: 'Anja’s Honey',
  description:
    'Local Goldsiegel honey from Zweilütschinen, filled into 250 g and 500 g jars.',
  locality: {
    label: 'Zweilütschinen',
    postal_code: '3815',
  },
  image_url: '',
  image_alt: '',
  section_ids: ['honig'],
  fulfilment_methods: [],
}

export const anjaHoneyDraftOffers: MarketplaceOfferCreateIntent[] = [
  {
    title: 'Local Goldsiegel honey',
    description: '',
    unit_label: '250 g jar',
    price: null,
    section_ids: ['honig'],
    fulfilment_methods: [],
  },
  {
    title: 'Local Goldsiegel honey',
    description: '',
    unit_label: '500 g jar',
    price: null,
    section_ids: ['honig'],
    fulfilment_methods: [],
  },
]
