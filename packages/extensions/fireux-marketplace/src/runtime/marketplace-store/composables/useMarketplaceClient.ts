import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import type {
  ManagedMarketplaceStoreResponse,
  ManagedMarketplaceStoresResponse,
  MarketplaceAdminStoresResponse,
  MarketplaceOrdersResponse,
  MarketplaceStoreDetailResponse,
  MarketplaceStoreDirectoryPage,
} from '../models/marketplace-api.model.ts'

async function marketplaceAuthorization() {
  const user = await useRequireUser()
  const token = await user.getIdToken()
  return { Authorization: `Bearer ${token}` }
}

export function useMarketplaceClient(fetcher: typeof $fetch = $fetch) {
  const directoryStores = () =>
    fetcher<MarketplaceStoreDirectoryPage>('/api/marketplace-stores')

  const storeDetail = (slug: string) =>
    fetcher<MarketplaceStoreDetailResponse>(
      `/api/marketplace-stores/${encodeURIComponent(slug)}`
    )

  const previewStore = async (slug: string) =>
    fetcher<MarketplaceStoreDetailResponse>(
      `/api/marketplace-stores/${encodeURIComponent(slug)}`,
      import.meta.dev
        ? undefined
        : {
            query: { visibility: 'all' },
            headers: await marketplaceAuthorization(),
          }
    )

  const managedStores = async () =>
    fetcher<ManagedMarketplaceStoresResponse>('/api/marketplace/stores', {
      headers: await marketplaceAuthorization(),
    })

  const managedStore = async (storeId: string) =>
    fetcher<ManagedMarketplaceStoreResponse>(
      `/api/marketplace/stores/${encodeURIComponent(storeId)}`,
      { headers: await marketplaceAuthorization() }
    )

  const orders = async (view: 'buyer' | 'seller', storeId = '') =>
    fetcher<MarketplaceOrdersResponse>('/api/marketplace/orders', {
      headers: await marketplaceAuthorization(),
      query: { view, ...(storeId ? { storeId } : {}) },
    })

  const adminStores = async () =>
    fetcher<MarketplaceAdminStoresResponse>('/api/admin/marketplace/stores', {
      headers: await marketplaceAuthorization(),
    })

  return {
    directoryStores,
    storeDetail,
    previewStore,
    managedStores,
    managedStore,
    orders,
    adminStores,
  }
}
