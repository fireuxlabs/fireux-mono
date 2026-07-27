import { defineFireuxEntity } from 'fireux-core/runtime/models/core/entity.model.ts'
import type { FireuxStamped } from 'fireux-core/runtime/models/core/meta.model.ts'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase.ts'
import type { FinancialMoney } from 'fireux-finance/runtime/models/money.model.ts'

export const MarketplaceStoreStorage = {
  shape: 'app-scoped',
  path: 'apps/{appId}/marketplace-stores/{storeId}',
  collection: 'marketplace-stores',
  idParam: 'storeId',
} as const

export const MarketplaceStoreEntity = defineFireuxEntity({
  kind: 'entity',
  name: 'MarketplaceStore',
  family: ['commerce'],
  identity: 'parent-scoped',
  authority: 'parent',
  appSupport: 'none',
  publicRead: 'projection',
  status: 'confirmed',
  console: false,
  scoped: MarketplaceStoreStorage.path,
  parent: 'App',
  notes: [
    'Store identity and slug are scoped to one App.',
    'Owner and editor ids are private authority, never public projection fields.',
  ],
})

export const MarketplaceOfferStorage = {
  shape: 'parent-record',
  path: `${MarketplaceStoreStorage.path}/offers/{offerId}`,
  collection: 'offers',
  idParam: 'offerId',
} as const

export const MarketplaceOfferRecord = defineFireuxEntity({
  kind: 'record',
  name: 'MarketplaceOffer',
  family: ['commerce'],
  identity: 'parent-scoped',
  authority: 'parent',
  appSupport: 'none',
  publicRead: 'projection',
  status: 'confirmed',
  console: false,
  scoped: MarketplaceOfferStorage.path,
  parent: 'MarketplaceStore',
})

export const MarketplaceOrderStorage = {
  shape: 'app-record',
  path: 'apps/{appId}/marketplace-orders/{orderId}',
  collection: 'marketplace-orders',
  idParam: 'orderId',
} as const

export const MarketplaceOrderRecord = defineFireuxEntity({
  kind: 'record',
  name: 'MarketplaceOrder',
  family: ['commerce'],
  identity: 'parent-scoped',
  authority: 'parent',
  appSupport: 'none',
  publicRead: 'none',
  status: 'confirmed',
  console: false,
  scoped: MarketplaceOrderStorage.path,
  parent: 'MarketplaceStore',
})

export const MARKETPLACE_STORE_STATES = [
  'draft',
  'pending_review',
  'published',
  'paused',
] as const
export type MarketplaceStoreState = (typeof MARKETPLACE_STORE_STATES)[number]

export const MARKETPLACE_OFFER_STATES = [
  'draft',
  'published',
  'unavailable',
  'archived',
] as const
export type MarketplaceOfferState = (typeof MARKETPLACE_OFFER_STATES)[number]

export const MARKETPLACE_ORDER_STATUSES = [
  'requested',
  'accepted',
  'ready',
  'completed',
  'rejected',
  'cancelled',
] as const
export type MarketplaceOrderStatus =
  (typeof MARKETPLACE_ORDER_STATUSES)[number]

export const MARKETPLACE_FULFILMENT_METHODS = [
  'collection',
  'local_delivery',
] as const
export type MarketplaceFulfilmentMethod =
  (typeof MARKETPLACE_FULFILMENT_METHODS)[number]

export type MarketplaceLocality = {
  label: string
  postal_code: string
}

type MarketplaceAudit = FireuxStamped & {
  created: FireuxStamped['created'] & {
    at: FirebaseTimestamp
    by: string
    app_id: string
  }
  updated: FireuxStamped['updated'] & {
    at: FirebaseTimestamp
    by: string
  }
}

export type MarketplaceStore = MarketplaceAudit & {
  id: string
  app_id: string
  slug: string
  name: string
  description: string
  locality: MarketplaceLocality
  image_url: string
  image_alt: string
  section_ids: string[]
  fulfilment_methods: MarketplaceFulfilmentMethod[]
  publication_state: MarketplaceStoreState
  owner_ids: string[]
  editor_ids: string[]
  submitted_at: FirebaseTimestamp | null
  published_at: FirebaseTimestamp | null
}

export type MarketplaceOffer = MarketplaceAudit & {
  id: string
  app_id: string
  store_id: string
  title: string
  description: string
  unit_label: string
  price: FinancialMoney | null
  section_ids: string[]
  fulfilment_methods: MarketplaceFulfilmentMethod[]
  state: MarketplaceOfferState
}

export type MarketplaceOrderLine = {
  offer_id: string
  title: string
  unit_label: string
  quantity: number
  unit_price: FinancialMoney
  line_total: FinancialMoney
}

export type MarketplaceOrder = MarketplaceAudit & {
  id: string
  app_id: string
  store_id: string
  store_name: string
  buyer_uid: string
  lines: MarketplaceOrderLine[]
  total: FinancialMoney
  fulfilment_method: MarketplaceFulfilmentMethod
  delivery_address: string
  buyer_note: string
  status: MarketplaceOrderStatus
}
