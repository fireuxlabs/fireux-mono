import { refreshNuxtData } from 'nuxt/app'
import { useRoute } from '#imports'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useUserSession } from 'fireux-core/runtime/user/composables/session/useUserSession'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { ref, watch, type WatchSource } from 'vue'
import type {
  MarketplaceMutationResponse,
  MarketplaceOfferCreateIntent,
  MarketplaceOfferPatchIntent,
  MarketplaceOrderCreateIntent,
  MarketplaceStoreCreateIntent,
  MarketplaceStoreMemberIntent,
  MarketplaceStoreModerationIntent,
  MarketplaceStorePatchIntent,
} from '../models/marketplace-api.model'
import type {
  MarketplaceOffer,
  MarketplaceOfferState,
  MarketplaceOrder,
  MarketplaceOrderStatus,
  MarketplaceStore,
} from '../models/marketplace.model'

export function useMarketplaceCommands(ownerSources: WatchSource[] = []) {
  const { currentUser } = useAuth(),
    config = useFireUXConfig(),
    route = useRoute()
  const { appUser, appPending, appError, appOutcome } = useUserSession()
  const sources = [
    () => currentUser.value?.uid,
    () => config.appId,
    appUser,
    appPending,
    appError,
    appOutcome,
    () => route.fullPath,
    ...ownerSources,
  ]
  const captureIntent = useCommandScope(sources),
    scopeEpoch = ref(0)
  watch(
    sources,
    () => {
      scopeEpoch.value += 1
    },
    { flush: 'sync' }
  )
  async function request<
    T extends { id: string; store_id?: string; slug?: string },
  >(
    path: string,
    options: { method: 'POST' | 'PATCH'; body?: unknown },
    expected: { id?: string; storeId?: string; slug?: string } = {}
  ) {
    const uid = currentUser.value?.uid,
      isCurrent = captureIntent()
    const body =
      options.body === undefined
        ? undefined
        : JSON.parse(JSON.stringify(options.body))
    const assertCurrent = () => {
      if (!uid || !isCurrent())
        throw new Error(
          'The account, App, store or page changed. Reopen this Marketplace action.'
        )
    }
    assertCurrent()
    const user = await useRequireUser()
    assertCurrent()
    if (user.uid !== uid)
      throw new Error('The account changed. Reopen this Marketplace action.')
    const token = await user.getIdToken()
    assertCurrent()
    const result = await $fetch<MarketplaceMutationResponse<T>>(path, {
      onResponse: async ({ options, response }) => {
        if (
          response.ok &&
          !['GET', 'HEAD'].includes(
            String(options.method || 'GET').toUpperCase()
          )
        )
          await refreshNuxtData()
      },
      method: options.method,
      headers: { Authorization: `Bearer ${token}` },
      ...(body === undefined ? {} : { body }),
    })
    if (
      result?.ok !== true ||
      !result.item?.id ||
      (expected.id && result.item.id !== expected.id) ||
      (expected.storeId && result.item.store_id !== expected.storeId) ||
      (expected.slug && result.item.slug !== expected.slug)
    )
      throw new Error(
        'Marketplace response did not match the requested record.'
      )
    return result
  }
  const createStore = async (body: MarketplaceStoreCreateIntent) =>
    request<MarketplaceStore>(
      '/api/marketplace/stores',
      {
        method: 'POST',
        body,
      },
      { slug: body.slug }
    )

  const patchStore = async (
    storeId: string,
    body: MarketplaceStorePatchIntent
  ) =>
    request<MarketplaceStore>(
      `/api/marketplace/stores/${encodeURIComponent(storeId)}`,
      {
        method: 'PATCH',
        body,
      },
      { id: storeId }
    )

  const submitStore = async (storeId: string) =>
    request<MarketplaceStore>(
      `/api/marketplace/stores/${encodeURIComponent(storeId)}/submit`,
      {
        method: 'POST',
      },
      { id: storeId }
    )

  const createOffer = async (
    storeId: string,
    body: MarketplaceOfferCreateIntent
  ) =>
    request<MarketplaceOffer>(
      `/api/marketplace/stores/${encodeURIComponent(storeId)}/offers`,
      {
        method: 'POST',
        body,
      },
      { storeId }
    )

  const patchOffer = async (
    storeId: string,
    offerId: string,
    body: MarketplaceOfferPatchIntent
  ) =>
    request<MarketplaceOffer>(
      `/api/marketplace/stores/${encodeURIComponent(storeId)}/offers/${encodeURIComponent(offerId)}`,
      {
        method: 'PATCH',
        body,
      },
      { id: offerId, storeId }
    )

  const transitionOffer = async (
    storeId: string,
    offerId: string,
    state: MarketplaceOfferState
  ) =>
    request<MarketplaceOffer>(
      `/api/marketplace/stores/${encodeURIComponent(storeId)}/offers/${encodeURIComponent(offerId)}/transition`,
      {
        method: 'POST',
        body: { state },
      },
      { id: offerId, storeId }
    )

  const createOrder = async (body: MarketplaceOrderCreateIntent) =>
    request<MarketplaceOrder>(
      '/api/marketplace/orders',
      {
        method: 'POST',
        body,
      },
      { storeId: body.store_id }
    )

  const transitionOrder = async (
    orderId: string,
    status: MarketplaceOrderStatus
  ) =>
    request<MarketplaceOrder>(
      `/api/marketplace/orders/${encodeURIComponent(orderId)}/transition`,
      {
        method: 'POST',
        body: { status },
      },
      { id: orderId }
    )

  const moderateStore = async (
    storeId: string,
    body: MarketplaceStoreModerationIntent
  ) =>
    request<MarketplaceStore>(
      `/api/admin/marketplace/stores/${encodeURIComponent(storeId)}/moderate`,
      {
        method: 'POST',
        body,
      },
      { id: storeId }
    )

  const mutateStoreMember = async (
    storeId: string,
    body: MarketplaceStoreMemberIntent
  ) =>
    request<MarketplaceStore>(
      `/api/admin/marketplace/stores/${encodeURIComponent(storeId)}/members`,
      {
        method: 'POST',
        body,
      },
      { id: storeId }
    )

  return {
    createStore,
    patchStore,
    submitStore,
    createOffer,
    patchOffer,
    transitionOffer,
    createOrder,
    transitionOrder,
    moderateStore,
    mutateStoreMember,
    captureIntent,
    scopeEpoch,
  }
}
