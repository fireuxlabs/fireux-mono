import assert from 'node:assert/strict'
import test from 'node:test'
import { projectMarketplaceStoreDirectoryEntry } from '../../dist/runtime/server/marketplace/directory/projection.js'
import {
  MarketplaceValidationError,
  canonicalMarketplaceOffer,
  canonicalMarketplaceOrder,
  canonicalMarketplaceStore,
  normalizeMarketplaceOfferCreate,
  normalizeMarketplaceOrderCreate,
} from '../../dist/runtime/server/marketplace/core/validation.js'

const stamp = {
  created: {
    at: { seconds: 1 },
    by: 'owner-1',
    app_id: 'interlaken-essen',
  },
  updated: {
    at: { seconds: 2 },
    by: 'owner-1',
  },
}

const draftStore = {
  id: 'anja-honey',
  app_id: 'interlaken-essen',
  slug: 'anja-honey',
  name: 'Anja’s Honey',
  description: 'Local Goldsiegel honey from Zweilütschinen.',
  locality: { label: 'Zweilütschinen', postal_code: '3815' },
  image_url: '',
  image_alt: '',
  section_ids: ['honig'],
  fulfilment_methods: [],
  publication_state: 'draft',
  owner_ids: ['owner-1'],
  editor_ids: [],
  submitted_at: null,
  published_at: null,
  ...stamp,
}

const draftOffer = {
  id: 'honey-250',
  app_id: 'interlaken-essen',
  store_id: 'anja-honey',
  title: 'Local Goldsiegel honey',
  description: '',
  unit_label: '250 g jar',
  price: null,
  section_ids: ['honig'],
  fulfilment_methods: [],
  state: 'draft',
  ...stamp,
}

test('draft Stores and Offers can remain free of invented commercial terms', () => {
  assert.deepEqual(
    canonicalMarketplaceStore('anja-honey', draftStore).fulfilment_methods,
    []
  )
  assert.equal(canonicalMarketplaceOffer('honey-250', draftOffer).price, null)
  assert.deepEqual(
    canonicalMarketplaceStore('anja-honey', {
      ...draftStore,
      owner_ids: [],
    }).owner_ids,
    []
  )
})

test('published Stores and Offers require fulfilment and fixed CHF money', () => {
  assert.throws(
    () =>
      canonicalMarketplaceStore('anja-honey', {
        ...draftStore,
        publication_state: 'published',
      }),
    MarketplaceValidationError
  )
  assert.throws(
    () =>
      canonicalMarketplaceOffer('honey-250', {
        ...draftOffer,
        state: 'published',
      }),
    MarketplaceValidationError
  )
  assert.throws(
    () =>
      normalizeMarketplaceOfferCreate({
        title: 'Honey',
        description: '',
        unit_label: '250 g jar',
        price: { amount_minor: 12.5, currency_code: 'CHF' },
        section_ids: ['honig'],
        fulfilment_methods: ['collection'],
      }),
    MarketplaceValidationError
  )
})

test('order requests require bounded lines and a local-delivery address', () => {
  assert.throws(
    () =>
      normalizeMarketplaceOrderCreate({
        store_id: 'anja-honey',
        lines: [{ offer_id: 'honey-250', quantity: 1 }],
        fulfilment_method: 'local_delivery',
        delivery_address: '',
      }),
    MarketplaceValidationError
  )
  assert.throws(
    () =>
      normalizeMarketplaceOrderCreate({
        store_id: 'anja-honey',
        lines: [
          { offer_id: 'honey-250', quantity: 1 },
          { offer_id: 'honey-250', quantity: 2 },
        ],
        fulfilment_method: 'collection',
      }),
    MarketplaceValidationError
  )
})

test('stored Order snapshots reconcile every line and the total', () => {
  const order = {
    id: 'order-1',
    app_id: 'interlaken-essen',
    store_id: 'anja-honey',
    store_name: 'Anja’s Honey',
    buyer_uid: 'buyer-1',
    lines: [
      {
        offer_id: 'honey-250',
        title: 'Local Goldsiegel honey',
        unit_label: '250 g jar',
        quantity: 2,
        unit_price: { amount_minor: 800, currency_code: 'CHF' },
        line_total: { amount_minor: 1600, currency_code: 'CHF' },
      },
    ],
    total: { amount_minor: 1600, currency_code: 'CHF' },
    fulfilment_method: 'collection',
    delivery_address: '',
    buyer_note: '',
    status: 'requested',
    ...stamp,
  }
  assert.equal(
    canonicalMarketplaceOrder('order-1', order).total.amount_minor,
    1600
  )
  assert.throws(
    () =>
      canonicalMarketplaceOrder('order-1', {
        ...order,
        total: { amount_minor: 1599, currency_code: 'CHF' },
      }),
    MarketplaceValidationError
  )
})

test('public projections expose published catalogue fields only', () => {
  const store = canonicalMarketplaceStore('anja-honey', {
    ...draftStore,
    fulfilment_methods: ['collection'],
    publication_state: 'published',
  })
  const publishedOffer = canonicalMarketplaceOffer('honey-250', {
    ...draftOffer,
    price: { amount_minor: 800, currency_code: 'CHF' },
    fulfilment_methods: ['collection'],
    state: 'published',
  })
  const projection = projectMarketplaceStoreDirectoryEntry(store, [
    publishedOffer,
  ])
  assert.equal(projection?.offers?.length, 1)
  assert.equal('owner_ids' in projection, false)
  assert.equal('editor_ids' in projection, false)
  assert.equal('created' in projection, false)
  assert.equal('updated' in projection, false)
  assert.equal('buyer_uid' in projection, false)
})
