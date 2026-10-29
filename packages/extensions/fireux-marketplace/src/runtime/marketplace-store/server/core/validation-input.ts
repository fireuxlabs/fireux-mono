import type {
  MarketplaceOfferCreateIntent,
  MarketplaceOfferPatchIntent,
  MarketplaceOrderCreateIntent,
  MarketplaceStoreCreateIntent,
  MarketplaceStorePatchIntent,
} from '../../models/marketplace-api.model.ts'
import {
  fulfilmentMethods,
  httpsUrl,
  keysOnly,
  locality,
  marketplaceDocumentId,
  marketplaceSlug,
  marketplaceText,
  optionalText,
  price,
  record,
  stringIds,
  fail,
} from './validation-common'

export function normalizeMarketplaceStoreCreate(
  value: unknown
): MarketplaceStoreCreateIntent {
  const data = record(value)
  keysOnly(
    data,
    [
      'slug',
      'name',
      'description',
      'locality',
      'image_url',
      'image_alt',
      'section_ids',
      'fulfilment_methods',
    ],
    'Store'
  )
  return {
    slug: marketplaceSlug(data.slug),
    name: marketplaceText(data.name, 'Store name', 2, 80),
    description: marketplaceText(
      data.description,
      'Store description',
      10,
      1000
    ),
    locality: locality(data.locality),
    image_url: httpsUrl(data.image_url, 'Store image URL'),
    image_alt: optionalText(data.image_alt, 'Store image description', 180),
    section_ids: stringIds(data.section_ids, 'Store sections', 10),
    fulfilment_methods: fulfilmentMethods(
      data.fulfilment_methods,
      'Fulfilment methods',
      false
    ),
  }
}

export function normalizeMarketplaceStorePatch(
  value: unknown
): MarketplaceStorePatchIntent {
  const data = record(value)
  keysOnly(
    data,
    [
      'name',
      'description',
      'locality',
      'image_url',
      'image_alt',
      'section_ids',
      'fulfilment_methods',
    ],
    'Store patch'
  )
  if (!Object.keys(data).length)
    fail('Store patch must change at least one field.')
  return {
    ...('name' in data
      ? { name: marketplaceText(data.name, 'Store name', 2, 80) }
      : {}),
    ...('description' in data
      ? {
          description: marketplaceText(
            data.description,
            'Store description',
            10,
            1000
          ),
        }
      : {}),
    ...('locality' in data ? { locality: locality(data.locality) } : {}),
    ...('image_url' in data
      ? { image_url: httpsUrl(data.image_url, 'Store image URL') }
      : {}),
    ...('image_alt' in data
      ? {
          image_alt: optionalText(
            data.image_alt,
            'Store image description',
            180
          ),
        }
      : {}),
    ...('section_ids' in data
      ? { section_ids: stringIds(data.section_ids, 'Store sections', 10) }
      : {}),
    ...('fulfilment_methods' in data
      ? {
          fulfilment_methods: fulfilmentMethods(
            data.fulfilment_methods,
            'Fulfilment methods',
            false
          ),
        }
      : {}),
  }
}

export function normalizeMarketplaceOfferCreate(
  value: unknown
): MarketplaceOfferCreateIntent {
  const data = record(value)
  keysOnly(
    data,
    [
      'title',
      'description',
      'unit_label',
      'price',
      'section_ids',
      'fulfilment_methods',
    ],
    'Offer'
  )
  return {
    title: marketplaceText(data.title, 'Offer title', 2, 120),
    description: optionalText(data.description, 'Offer description', 1000),
    unit_label: marketplaceText(data.unit_label, 'Offer unit', 1, 40),
    price: price(data.price),
    section_ids: stringIds(data.section_ids, 'Offer sections', 5),
    fulfilment_methods: fulfilmentMethods(
      data.fulfilment_methods,
      'Fulfilment methods',
      false
    ),
  }
}

export function normalizeMarketplaceOfferPatch(
  value: unknown
): MarketplaceOfferPatchIntent {
  const data = record(value)
  keysOnly(
    data,
    [
      'title',
      'description',
      'unit_label',
      'price',
      'section_ids',
      'fulfilment_methods',
    ],
    'Offer patch'
  )
  if (!Object.keys(data).length)
    fail('Offer patch must change at least one field.')
  return {
    ...('title' in data
      ? { title: marketplaceText(data.title, 'Offer title', 2, 120) }
      : {}),
    ...('description' in data
      ? {
          description: optionalText(
            data.description,
            'Offer description',
            1000
          ),
        }
      : {}),
    ...('unit_label' in data
      ? { unit_label: marketplaceText(data.unit_label, 'Offer unit', 1, 40) }
      : {}),
    ...('price' in data ? { price: price(data.price) } : {}),
    ...('section_ids' in data
      ? { section_ids: stringIds(data.section_ids, 'Offer sections', 5) }
      : {}),
    ...('fulfilment_methods' in data
      ? {
          fulfilment_methods: fulfilmentMethods(
            data.fulfilment_methods,
            'Fulfilment methods',
            false
          ),
        }
      : {}),
  }
}

export function normalizeMarketplaceOrderCreate(
  value: unknown
): MarketplaceOrderCreateIntent {
  const data = record(value)
  keysOnly(
    data,
    [
      'store_id',
      'lines',
      'fulfilment_method',
      'delivery_address',
      'buyer_note',
    ],
    'Order'
  )
  if (
    !Array.isArray(data.lines) ||
    !data.lines.length ||
    data.lines.length > 20
  ) {
    fail('Order must contain between 1 and 20 lines.')
  }
  const lines = data.lines.map((raw, index) => {
    const line = record(raw)
    keysOnly(line, ['offer_id', 'quantity'], `Order line ${index + 1}`)
    const quantity = Number(line.quantity)
    if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 99) {
      fail(`Order line ${index + 1} quantity must be between 1 and 99.`)
    }
    return {
      offer_id: marketplaceDocumentId(
        line.offer_id,
        `Order line ${index + 1} offer`
      ),
      quantity,
    }
  })
  if (new Set(lines.map((line) => line.offer_id)).size !== lines.length) {
    fail('Order lines must not repeat the same offer.')
  }
  const methods = fulfilmentMethods(
    [data.fulfilment_method],
    'Order fulfilment method'
  )
  const deliveryAddress = optionalText(
    data.delivery_address,
    'Delivery address',
    500
  )
  if (methods[0] === 'local_delivery' && !deliveryAddress) {
    fail('A delivery address is required for local delivery.')
  }
  return {
    store_id: marketplaceDocumentId(data.store_id, 'Store id'),
    lines,
    fulfilment_method:
      methods[0] ?? fail('Order fulfilment method is required.'),
    delivery_address: deliveryAddress,
    buyer_note: optionalText(data.buyer_note, 'Buyer note', 500),
  }
}
