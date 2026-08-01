import {
  addFinancialMoney,
  multiplyFinancialMoney,
  requireFinancialMoney,
} from 'fireux-finance/runtime/utils/money.ts'
import {
  MARKETPLACE_FULFILMENT_METHODS,
  MARKETPLACE_OFFER_STATES,
  MARKETPLACE_ORDER_STATUSES,
  MARKETPLACE_STORE_STATES,
  type MarketplaceFulfilmentMethod,
  type MarketplaceOffer,
  type MarketplaceOrder,
  type MarketplaceStore,
} from '../../models/marketplace.model'
import type {
  MarketplaceOfferCreateIntent,
  MarketplaceOfferPatchIntent,
  MarketplaceOrderCreateIntent,
  MarketplaceStoreCreateIntent,
  MarketplaceStorePatchIntent,
} from '../../models/marketplace-api.model'
import type { FinancialMoney } from 'fireux-finance/runtime/models/money.model'

export class MarketplaceValidationError extends Error {}

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}

function fail(message: string): never {
  throw new MarketplaceValidationError(message)
}

const keysOnly = (
  value: Record<string, unknown>,
  allowed: readonly string[],
  label: string
) => {
  const extra = Object.keys(value).find(key => !allowed.includes(key))
  if (extra) fail(`${label} contains an unsupported field: ${extra}.`)
}

export const marketplaceText = (
  value: unknown,
  label: string,
  min: number,
  max: number
): string => {
  if (typeof value !== 'string') fail(`${label} must be text.`)
  const output = value.trim()
  if (output.length < min || output.length > max) {
    fail(`${label} must be between ${min} and ${max} characters.`)
  }
  return output
}

export const marketplaceDocumentId = (
  value: unknown,
  label: string
): string => {
  const id = marketplaceText(value, label, 1, 120)
  if (
    id === '.' ||
    id === '..' ||
    id.includes('/') ||
    /^__.*__$/.test(id)
  ) {
    fail(`${label} is invalid.`)
  }
  return id
}

export const marketplaceSlug = (value: unknown): string => {
  const slug = marketplaceText(value, 'Store slug', 3, 80).toLowerCase()
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    fail('Store slug must use lowercase letters, numbers and single hyphens.')
  }
  return slug
}

const optionalText = (value: unknown, label: string, max: number): string => {
  if (value === undefined || value === null || value === '') return ''
  return marketplaceText(value, label, 0, max)
}

const httpsUrl = (value: unknown, label: string): string => {
  const url = optionalText(value, label, 2048)
  if (url && !/^https:\/\//.test(url)) fail(`${label} must use HTTPS.`)
  return url
}

const stringIds = (
  value: unknown,
  label: string,
  max: number
): string[] => {
  if (!Array.isArray(value)) fail(`${label} must be a list.`)
  const output = Array.from(new Set(
    value.map(item => marketplaceDocumentId(item, `${label} item`))
  ))
  if (output.length > max) fail(`${label} has too many items.`)
  return output
}

const fulfilmentMethods = (
  value: unknown,
  label = 'Fulfilment methods',
  requireOne = true
): MarketplaceFulfilmentMethod[] => {
  const items = stringIds(value, label, 2)
  if (requireOne && !items.length) {
    fail(`${label} requires at least one choice.`)
  }
  if (items.some(item => !MARKETPLACE_FULFILMENT_METHODS.includes(
    item as MarketplaceFulfilmentMethod
  ))) {
    fail(`${label} contains an unsupported choice.`)
  }
  return items as MarketplaceFulfilmentMethod[]
}

const locality = (value: unknown) => {
  const data = record(value)
  keysOnly(data, ['label', 'postal_code'], 'Locality')
  const postalCode = marketplaceText(data.postal_code, 'Postcode', 4, 4)
  if (!/^\d{4}$/.test(postalCode)) fail('Postcode must contain four digits.')
  return {
    label: marketplaceText(data.label, 'Locality', 1, 80),
    postal_code: postalCode,
  }
}

export function normalizeMarketplaceStoreCreate(
  value: unknown
): MarketplaceStoreCreateIntent {
  const data = record(value)
  keysOnly(data, [
    'slug',
    'name',
    'description',
    'locality',
    'image_url',
    'image_alt',
    'section_ids',
    'fulfilment_methods',
  ], 'Store')
  return {
    slug: marketplaceSlug(data.slug),
    name: marketplaceText(data.name, 'Store name', 2, 80),
    description: marketplaceText(data.description, 'Store description', 10, 1000),
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
  keysOnly(data, [
    'name',
    'description',
    'locality',
    'image_url',
    'image_alt',
    'section_ids',
    'fulfilment_methods',
  ], 'Store patch')
  if (!Object.keys(data).length) fail('Store patch must change at least one field.')
  return {
    ...('name' in data
      ? { name: marketplaceText(data.name, 'Store name', 2, 80) }
      : {}),
    ...('description' in data
      ? { description: marketplaceText(data.description, 'Store description', 10, 1000) }
      : {}),
    ...('locality' in data ? { locality: locality(data.locality) } : {}),
    ...('image_url' in data
      ? { image_url: httpsUrl(data.image_url, 'Store image URL') }
      : {}),
    ...('image_alt' in data
      ? { image_alt: optionalText(data.image_alt, 'Store image description', 180) }
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

const price = (value: unknown): FinancialMoney | null => {
  if (value === null || value === undefined) return null
  try {
    const money = requireFinancialMoney(value, {
      allowNegative: false,
      allowZero: false,
      label: 'Offer price',
    })
    if (money.currency_code !== 'CHF') fail('Offer price must use CHF.')
    return money
  } catch (error) {
    fail(error instanceof Error ? error.message : 'Offer price is invalid.')
  }
}

export function normalizeMarketplaceOfferCreate(
  value: unknown
): MarketplaceOfferCreateIntent {
  const data = record(value)
  keysOnly(data, [
    'title',
    'description',
    'unit_label',
    'price',
    'section_ids',
    'fulfilment_methods',
  ], 'Offer')
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
  keysOnly(data, [
    'title',
    'description',
    'unit_label',
    'price',
    'section_ids',
    'fulfilment_methods',
  ], 'Offer patch')
  if (!Object.keys(data).length) fail('Offer patch must change at least one field.')
  return {
    ...('title' in data
      ? { title: marketplaceText(data.title, 'Offer title', 2, 120) }
      : {}),
    ...('description' in data
      ? { description: optionalText(data.description, 'Offer description', 1000) }
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
  keysOnly(data, [
    'store_id',
    'lines',
    'fulfilment_method',
    'delivery_address',
    'buyer_note',
  ], 'Order')
  if (!Array.isArray(data.lines) || !data.lines.length || data.lines.length > 20) {
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
  if (new Set(lines.map(line => line.offer_id)).size !== lines.length) {
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
    fulfilment_method: methods[0],
    delivery_address: deliveryAddress,
    buyer_note: optionalText(data.buyer_note, 'Buyer note', 500),
  }
}

export function canonicalMarketplaceStore(
  id: string,
  value: unknown
): MarketplaceStore {
  const data = record(value)
  keysOnly(data, [
    'id',
    'app_id',
    'slug',
    'name',
    'description',
    'locality',
    'image_url',
    'image_alt',
    'section_ids',
    'fulfilment_methods',
    'publication_state',
    'owner_ids',
    'editor_ids',
    'submitted_at',
    'published_at',
    'created',
    'updated',
  ], 'Stored Store')
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
    !Array.isArray(data.owner_ids) ||
    !Array.isArray(data.editor_ids) ||
    !data.created ||
    !data.updated
  ) fail('Stored Store is invalid.')
  const ownerIds = stringIds(data.owner_ids, 'Store owners', 5)
  const editorIds = stringIds(data.editor_ids, 'Store editors', 10)
  if (
    (!ownerIds.length && data.publication_state !== 'draft') ||
    ownerIds.some(uid => editorIds.includes(uid)) ||
    (['pending_review', 'published'].includes(
      data.publication_state as string
    ) && !normalized.fulfilment_methods.length)
  ) {
    fail('Stored Store authority is invalid.')
  }
  return {
    id,
    app_id: marketplaceDocumentId(data.app_id, 'Store App id'),
    ...normalized,
    publication_state: data.publication_state as MarketplaceStore['publication_state'],
    owner_ids: ownerIds,
    editor_ids: editorIds,
    submitted_at: (data.submitted_at || null) as MarketplaceStore['submitted_at'],
    published_at: (data.published_at || null) as MarketplaceStore['published_at'],
    created: data.created as MarketplaceStore['created'],
    updated: data.updated as MarketplaceStore['updated'],
  }
}

export function canonicalMarketplaceOffer(
  id: string,
  value: unknown
): MarketplaceOffer {
  const data = record(value)
  keysOnly(data, [
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
  ], 'Stored Offer')
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
    (data.state === 'published' && (
      !normalized.price ||
      !normalized.fulfilment_methods.length
    )) ||
    !data.created ||
    !data.updated
  ) fail('Stored Offer is invalid.')
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
  keysOnly(data, [
    'id',
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
  ], 'Stored Order')
  if (
    !MARKETPLACE_ORDER_STATUSES.includes(data.status as never) ||
    !Array.isArray(data.lines) ||
    !data.lines.length ||
    data.lines.length > 20 ||
    !data.created ||
    !data.updated
  ) fail('Stored Order is invalid.')
  const lines = data.lines.map((value, index) => {
    const line = record(value)
    keysOnly(line, [
      'offer_id',
      'title',
      'unit_label',
      'quantity',
      'unit_price',
      'line_total',
    ], `Stored Order line ${index + 1}`)
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
    lines.map(line => line.line_total),
    'Stored Order total'
  )
  if (
    !total ||
    total.currency_code !== expectedTotal.currency_code ||
    total.amount_minor !== expectedTotal.amount_minor
  ) fail('Stored Order total is invalid.')
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
