import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'
import type { FireuxEntityManagement } from 'fireux-core/runtime/types/entity-management'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'
import type { FinancialMoney } from 'fireux-finance/runtime/models/money.model'

export const MarketplaceStoreStorage = {
  shape: 'root',
  path: 'marketplace-stores/{storeId}',
  collection: 'marketplace-stores',
  idParam: 'storeId',
} as const

export const MarketplaceStoreTeamStorage = {
  shape: 'scoped',
  path: 'marketplace-stores/{storeId}/team/{userId}',
  collection: 'team',
  parent: 'marketplace-store',
  idParam: 'userId',
} as const

export const MarketplaceOfferStorage = {
  shape: 'parent-record',
  path: `${MarketplaceStoreStorage.path}/offers/{offerId}`,
  collection: 'offers',
  idParam: 'offerId',
} as const

export const MarketplaceOrderStorage = {
  shape: 'parent-record',
  path: `${MarketplaceStoreStorage.path}/orders/{orderId}`,
  collection: 'orders',
  idParam: 'orderId',
} as const

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
export type MarketplaceOrderStatus = (typeof MARKETPLACE_ORDER_STATUSES)[number]

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
  management: FireuxEntityManagement
  slug: string
  name: string
  description: string
  locality: MarketplaceLocality
  image_url: string
  image_alt: string
  section_ids: string[]
  fulfilment_methods: MarketplaceFulfilmentMethod[]
  publication_state: MarketplaceStoreState
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
  record_type: 'marketplace-order'
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
