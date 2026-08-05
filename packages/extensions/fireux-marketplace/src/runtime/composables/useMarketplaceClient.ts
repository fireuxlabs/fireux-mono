import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import type {
  ManagedMarketplaceStoreResponse,
  ManagedMarketplaceStoresResponse,
  MarketplaceAdminStoresResponse,
  MarketplaceMutationResponse,
  MarketplaceOfferCreateIntent,
  MarketplaceOfferPatchIntent,
  MarketplaceOrderCreateIntent,
  MarketplaceOrdersResponse,
  MarketplaceStoreCreateIntent,
  MarketplaceStoreMemberIntent,
  MarketplaceStoreModerationIntent,
  MarketplaceStorePatchIntent,
  PublicMarketplaceStoreListResponse,
  PublicMarketplaceStoreResponse,
} from '../models/marketplace-api.model'
import type {
  MarketplaceOffer,
  MarketplaceOfferState,
  MarketplaceOrder,
  MarketplaceOrderStatus,
  MarketplaceStore,
} from '../models/marketplace.model'

async function marketplaceAuthorization() {
  const user = await useRequireUser()
  const token = await user.getIdToken()
  return { Authorization: `Bearer ${token}` }
}

export function useMarketplaceClient() {
  const publicStores = () =>
    $fetch<PublicMarketplaceStoreListResponse>(
      '/api/public/marketplace/stores'
    )

  const publicStore = (slug: string) =>
    $fetch<PublicMarketplaceStoreResponse>(
      `/api/public/marketplace/stores/${encodeURIComponent(slug)}`
    )

  const previewStore = async (slug: string) =>
    $fetch<PublicMarketplaceStoreResponse>(
      `/api/public/marketplace/stores/${encodeURIComponent(slug)}`,
      import.meta.dev
        ? undefined
        : {
            query: { visibility: 'all' },
            headers: await marketplaceAuthorization(),
          }
    )

  const managedStores = async () =>
    $fetch<ManagedMarketplaceStoresResponse>('/api/marketplace/stores', {
      headers: await marketplaceAuthorization(),
    })

  const managedStore = async (storeId: string) =>
    $fetch<ManagedMarketplaceStoreResponse>(
      `/api/marketplace/stores/${encodeURIComponent(storeId)}`,
      { headers: await marketplaceAuthorization() }
    )

  const createStore = async (body: MarketplaceStoreCreateIntent) =>
    $fetch<MarketplaceMutationResponse<MarketplaceStore>>(
      '/api/marketplace/stores',
      {
        method: 'POST',
        headers: await marketplaceAuthorization(),
        body,
      }
    )

  const patchStore = async (
    storeId: string,
    body: MarketplaceStorePatchIntent
  ) =>
    $fetch<MarketplaceMutationResponse<MarketplaceStore>>(
      `/api/marketplace/stores/${encodeURIComponent(storeId)}`,
      {
        method: 'PATCH',
        headers: await marketplaceAuthorization(),
        body,
      }
    )

  const submitStore = async (storeId: string) =>
    $fetch<MarketplaceMutationResponse<MarketplaceStore>>(
      `/api/marketplace/stores/${encodeURIComponent(storeId)}/submit`,
      {
        method: 'POST',
        headers: await marketplaceAuthorization(),
      }
    )

  const createOffer = async (
    storeId: string,
    body: MarketplaceOfferCreateIntent
  ) =>
    $fetch<MarketplaceMutationResponse<MarketplaceOffer>>(
      `/api/marketplace/stores/${encodeURIComponent(storeId)}/offers`,
      {
        method: 'POST',
        headers: await marketplaceAuthorization(),
        body,
      }
    )

  const patchOffer = async (
    storeId: string,
    offerId: string,
    body: MarketplaceOfferPatchIntent
  ) =>
    $fetch<MarketplaceMutationResponse<MarketplaceOffer>>(
      `/api/marketplace/stores/${encodeURIComponent(storeId)}/offers/${encodeURIComponent(offerId)}`,
      {
        method: 'PATCH',
        headers: await marketplaceAuthorization(),
        body,
      }
    )

  const transitionOffer = async (
    storeId: string,
    offerId: string,
    state: MarketplaceOfferState
  ) =>
    $fetch<MarketplaceMutationResponse<MarketplaceOffer>>(
      `/api/marketplace/stores/${encodeURIComponent(storeId)}/offers/${encodeURIComponent(offerId)}/transition`,
      {
        method: 'POST',
        headers: await marketplaceAuthorization(),
        body: { state },
      }
    )

  const orders = async (
    view: 'buyer' | 'seller',
    storeId = ''
  ) =>
    $fetch<MarketplaceOrdersResponse>('/api/marketplace/orders', {
      headers: await marketplaceAuthorization(),
      query: { view, ...(storeId ? { storeId } : {}) },
    })

  const createOrder = async (body: MarketplaceOrderCreateIntent) =>
    $fetch<MarketplaceMutationResponse<MarketplaceOrder>>(
      '/api/marketplace/orders',
      {
        method: 'POST',
        headers: await marketplaceAuthorization(),
        body,
      }
    )

  const transitionOrder = async (
    orderId: string,
    status: MarketplaceOrderStatus
  ) =>
    $fetch<MarketplaceMutationResponse<MarketplaceOrder>>(
      `/api/marketplace/orders/${encodeURIComponent(orderId)}/transition`,
      {
        method: 'POST',
        headers: await marketplaceAuthorization(),
        body: { status },
      }
    )

  const adminStores = async () =>
    $fetch<MarketplaceAdminStoresResponse>('/api/admin/marketplace/stores', {
      headers: await marketplaceAuthorization(),
    })

  const moderateStore = async (
    storeId: string,
    body: MarketplaceStoreModerationIntent
  ) =>
    $fetch<MarketplaceMutationResponse<MarketplaceStore>>(
      `/api/admin/marketplace/stores/${encodeURIComponent(storeId)}/moderate`,
      {
        method: 'POST',
        headers: await marketplaceAuthorization(),
        body,
      }
    )

  const mutateStoreMember = async (
    storeId: string,
    body: MarketplaceStoreMemberIntent
  ) =>
    $fetch<MarketplaceMutationResponse<MarketplaceStore>>(
      `/api/admin/marketplace/stores/${encodeURIComponent(storeId)}/members`,
      {
        method: 'POST',
        headers: await marketplaceAuthorization(),
        body,
      }
    )

  return {
    publicStores,
    publicStore,
    previewStore,
    managedStores,
    managedStore,
    createStore,
    patchStore,
    submitStore,
    createOffer,
    patchOffer,
    transitionOffer,
    orders,
    createOrder,
    transitionOrder,
    adminStores,
    moderateStore,
    mutateStoreMember,
  }
}
