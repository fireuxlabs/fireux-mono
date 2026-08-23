import type { FinancialMoney } from 'fireux-finance/runtime/models/money.model'
import type {
  MarketplaceFulfilmentMethod,
  MarketplaceLocality,
  MarketplaceOffer,
  MarketplaceOfferState,
  MarketplaceOrder,
  MarketplaceOrderStatus,
  MarketplaceStore,
  MarketplaceStoreState,
} from './marketplace.model.ts'

export type MarketplaceStoreCreateIntent = Pick<
  MarketplaceStore,
  | 'slug'
  | 'name'
  | 'description'
  | 'locality'
  | 'image_url'
  | 'image_alt'
  | 'section_ids'
  | 'fulfilment_methods'
>

export type MarketplaceStorePatchIntent = Partial<
  Omit<MarketplaceStoreCreateIntent, 'slug'>
>

export type MarketplaceOfferCreateIntent = Pick<
  MarketplaceOffer,
  | 'title'
  | 'description'
  | 'unit_label'
  | 'price'
  | 'section_ids'
  | 'fulfilment_methods'
>

export type MarketplaceOfferPatchIntent = Partial<MarketplaceOfferCreateIntent>

export type MarketplaceOrderCreateIntent = {
  store_id: string
  lines: Array<{ offer_id: string; quantity: number }>
  fulfilment_method: MarketplaceFulfilmentMethod
  delivery_address?: string
  buyer_note?: string
}

export type MarketplaceOfferDirectoryEntry = {
  id: string
  title: string
  description: string
  unit_label: string
  price: FinancialMoney
  section_ids: string[]
  fulfilment_methods: MarketplaceFulfilmentMethod[]
}

export type MarketplaceStoreDirectoryEntry = {
  id: string
  slug: string
  name: string
  description: string
  locality: MarketplaceLocality
  image_url: string
  image_alt: string
  section_ids: string[]
  fulfilment_methods: MarketplaceFulfilmentMethod[]
  publication_state?: MarketplaceStoreState
  offers?: MarketplaceOfferDirectoryEntry[]
}

export type MarketplaceStoreDirectoryPage = {
  items: MarketplaceStoreDirectoryEntry[]
  truncated: boolean
}

export type MarketplaceStoreDetailResponse = {
  store: MarketplaceStoreDirectoryEntry
}

export type ManagedMarketplaceStore = MarketplaceStore & {
  offers: MarketplaceOffer[]
}

export type ManagedMarketplaceStoresResponse = {
  items: MarketplaceStore[]
  role: 'user' | 'admin' | 'dev'
  truncated: boolean
}

export type ManagedMarketplaceStoreResponse = {
  store: ManagedMarketplaceStore
}

export type MarketplaceOrdersResponse = {
  items: MarketplaceOrder[]
  view: 'buyer' | 'seller'
  truncated: boolean
}

export type MarketplaceStoreModerationIntent = {
  action: 'approve' | 'return' | 'pause' | 'resume'
}

export type MarketplaceStoreMemberIntent = {
  uid: string
  role: 'owner' | 'editor'
  action: 'add' | 'remove'
}

export type MarketplaceOfferTransitionIntent = {
  state: MarketplaceOfferState
}

export type MarketplaceOrderTransitionIntent = {
  status: MarketplaceOrderStatus
}

export type MarketplaceMutationResponse<T> = {
  ok: true
  item: T
}

export type MarketplaceAdminStoresResponse = {
  items: MarketplaceStore[]
  truncated: boolean
}

export type MarketplaceStorePublishedState = Extract<
  MarketplaceStoreState,
  'published'
>
