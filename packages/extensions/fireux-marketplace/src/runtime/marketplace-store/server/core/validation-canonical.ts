import {
  addFinancialMoney,
  multiplyFinancialMoney,
} from 'fireux-finance/runtime/utils/money'
import { readFireuxEntityManagement } from 'fireux-core/runtime/app/utils/entity-management'
import {
  MARKETPLACE_OFFER_STATES,
  MARKETPLACE_ORDER_STATUSES,
  MARKETPLACE_STORE_STATES,
  type MarketplaceOffer,
  type MarketplaceOrder,
  type MarketplaceStore,
} from '../../models/marketplace.model.ts'
import {
  fail,
  fulfilmentMethods,
  keysOnly,
  marketplaceDocumentId,
  marketplaceText,
  optionalText,
  price,
  record,
} from './validation-common'
import {
  normalizeMarketplaceOfferCreate,
  normalizeMarketplaceStoreCreate,
} from './validation-input'

export function canonicalMarketplaceStore(
  id: string,
  value: unknown
): MarketplaceStore {
  const data = record(value)
  keysOnly(
    data,
    [
      'management',
      'slug',
      'name',
      'description',
      'locality',
      'image_url',
      'image_alt',
      'section_ids',
      'fulfilment_methods',
      'publication_state',
      'submitted_at',
      'published_at',
      'created',
      'updated',
    ],
    'Stored Store'
  )
  const normalized = normalizeMarketplaceStoreCreate({
    slug: data.slug,
    name: data.name,
    description: data.description,
    locality: data.locality,
    image_url: data.image_url,
    image_alt: data.image_alt,
    section_ids: data.section_ids,
    fulfilment_methods: data.fulfilment_methods,
  })
  if (
    !MARKETPLACE_STORE_STATES.includes(data.publication_state as never) ||
    !data.created ||
    !data.updated
  )
    fail('Stored Store is invalid.')
  const management = readFireuxEntityManagement(data.management)
  if (
    !management ||
    management.mode !== 'app' ||
    (['pending_review', 'published'].includes(
      data.publication_state as string
    ) &&
      !normalized.fulfilment_methods.length)
  ) {
    fail('Stored Store authority is invalid.')
  }
  return {
    id,
    management,
    ...normalized,
    publication_state:
      data.publication_state as MarketplaceStore['publication_state'],
    submitted_at: (data.submitted_at ||
      null) as MarketplaceStore['submitted_at'],
    published_at: (data.published_at ||
      null) as MarketplaceStore['published_at'],
    created: data.created as MarketplaceStore['created'],
    updated: data.updated as MarketplaceStore['updated'],
  }
}

export function canonicalMarketplaceOffer(
  id: string,
  value: unknown
): MarketplaceOffer {
  const data = record(value)
  keysOnly(
    data,
    [
      'id',
      'app_id',
      'store_id',
      'title',
      'description',
      'unit_label',
      'price',
      'section_ids',
      'fulfilment_methods',
      'state',
      'created',
      'updated',
    ],
    'Stored Offer'
  )
  const normalized = normalizeMarketplaceOfferCreate({
    title: data.title,
    description: data.description,
    unit_label: data.unit_label,
    price: data.price,
    section_ids: data.section_ids,
    fulfilment_methods: data.fulfilment_methods,
  })
  if (
    !MARKETPLACE_OFFER_STATES.includes(data.state as never) ||
    (data.state === 'published' &&
      (!normalized.price || !normalized.fulfilment_methods.length)) ||
    !data.created ||
    !data.updated
  )
    fail('Stored Offer is invalid.')
  return {
    id,
    app_id: marketplaceDocumentId(data.app_id, 'Offer App id'),
    store_id: marketplaceDocumentId(data.store_id, 'Offer Store id'),
    ...normalized,
    state: data.state as MarketplaceOffer['state'],
    created: data.created as MarketplaceOffer['created'],
    updated: data.updated as MarketplaceOffer['updated'],
  }
}

export function canonicalMarketplaceOrder(
  id: string,
  value: unknown
): MarketplaceOrder {
  const data = record(value)
  keysOnly(
    data,
    [
      'id',
      'record_type',
      'app_id',
      'store_id',
      'store_name',
      'buyer_uid',
      'lines',
      'total',
      'fulfilment_method',
      'delivery_address',
      'buyer_note',
      'status',
      'created',
      'updated',
    ],
    'Stored Order'
  )
  if (
    data.record_type !== 'marketplace-order' ||
    !MARKETPLACE_ORDER_STATUSES.includes(data.status as never) ||
    !Array.isArray(data.lines) ||
    !data.lines.length ||
    data.lines.length > 20 ||
    !data.created ||
    !data.updated
  )
    fail('Stored Order is invalid.')
  const lines = data.lines.map((value, index) => {
    const line = record(value)
    keysOnly(
      line,
      [
        'offer_id',
        'title',
        'unit_label',
        'quantity',
        'unit_price',
        'line_total',
      ],
      `Stored Order line ${index + 1}`
    )
    const quantity = Number(line.quantity)
    if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 99) {
      fail(`Stored Order line ${index + 1} quantity is invalid.`)
    }
    const unitPrice = price(line.unit_price)
    const lineTotal = price(line.line_total)
    if (!unitPrice || !lineTotal) {
      fail(`Stored Order line ${index + 1} price is invalid.`)
    }
    const expected = multiplyFinancialMoney(
      unitPrice,
      quantity,
      `Stored Order line ${index + 1} total`
    )
    if (
      lineTotal.currency_code !== expected.currency_code ||
      lineTotal.amount_minor !== expected.amount_minor
    ) {
      fail(`Stored Order line ${index + 1} total is invalid.`)
    }
    return {
      offer_id: marketplaceDocumentId(
        line.offer_id,
        `Stored Order line ${index + 1} offer`
      ),
      title: marketplaceText(
        line.title,
        `Stored Order line ${index + 1} title`,
        2,
        120
      ),
      unit_label: marketplaceText(
        line.unit_label,
        `Stored Order line ${index + 1} unit`,
        1,
        40
      ),
      quantity,
      unit_price: unitPrice,
      line_total: lineTotal,
    }
  })
  const total = price(data.total)
  const expectedTotal = addFinancialMoney(
    lines.map((line) => line.line_total),
    'Stored Order total'
  )
  if (
    !total ||
    total.currency_code !== expectedTotal.currency_code ||
    total.amount_minor !== expectedTotal.amount_minor
  )
    fail('Stored Order total is invalid.')
  const fulfilmentMethod = fulfilmentMethods(
    [data.fulfilment_method],
    'Order fulfilment method'
  )[0]
  const deliveryAddress = optionalText(
    data.delivery_address,
    'Delivery address',
    500
  )
  if (fulfilmentMethod === 'local_delivery' && !deliveryAddress) {
    fail('Stored local-delivery Order requires a delivery address.')
  }
  return {
    id,
    record_type: 'marketplace-order',
    app_id: marketplaceDocumentId(data.app_id, 'Order App id'),
    store_id: marketplaceDocumentId(data.store_id, 'Order Store id'),
    store_name: marketplaceText(data.store_name, 'Order Store name', 2, 80),
    buyer_uid: marketplaceDocumentId(data.buyer_uid, 'Order buyer'),
    lines,
    total,
    fulfilment_method: fulfilmentMethod,
    delivery_address: deliveryAddress,
    buyer_note: optionalText(data.buyer_note, 'Buyer note', 500),
    status: data.status as MarketplaceOrder['status'],
    created: data.created as MarketplaceOrder['created'],
    updated: data.updated as MarketplaceOrder['updated'],
  }
}
