import { useMarketplaceCommands } from 'fireux-marketplace/runtime/marketplace-store/composables/useMarketplaceCommands'
import { useMarketplaceClient } from 'fireux-marketplace/runtime/marketplace-store/composables/useMarketplaceClient'
import { useLiveAsyncData } from 'fireux-core/runtime/composables/fireux/firestore/useLiveAsyncData'
import type {
  MarketplaceAccountResponse,
  MarketplaceAccountSettings,
  MarketplaceAccountSettingsInput,
} from '@/content/marketplace-profile'
import { useInterlakenCopy } from '@/composables/useInterlakenCopy'
import { computed, ref, watch } from '#imports'
import { useWorkspaceEntryState } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceEntryState'
import { useAvatarProxy } from 'fireux-core/runtime/composables/media/useAvatarProxy'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useUserSession } from 'fireux-core/runtime/user/composables/useUserSession'
import type {
  MarketplaceOrder,
  MarketplaceOrderStatus,
  MarketplaceStore,
  MarketplaceStoreState,
} from 'fireux-marketplace/runtime/marketplace-store/models/marketplace.model'

type PersonalSurface = 'buyer' | 'seller'
type SettingsState = 'idle' | 'loading' | 'saving' | 'saved' | 'error'
type SettingsMessageKey =
  | 'account_settings_load_error'
  | 'account_settings_saved'
  | 'account_settings_save_error'

type MarketplaceSettingsResponse = {
  ok: true
  settings: MarketplaceAccountSettings
}

export function usePersonalMarketplace() {
  const { copy, locale } = useInterlakenCopy()
  const marketplace = useMarketplaceCommands()

  const { authPhase } = useWorkspaceEntryState()
  const { currentUser, avatarSrc } = useUserSession()
  const { currentUser: authUser } = useAuth()
  const { getProxiedAvatarUrl } = useAvatarProxy()

  const activeSurface = ref<PersonalSurface>('buyer')
  const orderActionId = ref('')
  watch(marketplace.scopeEpoch, () => { orderActionId.value = '' }, { flush: 'sync' })
  const deliveryAddress = ref('')
  const settingsState = ref<SettingsState>('idle')
  const settingsMessageKey = ref<SettingsMessageKey | null>(null)
  const profileEditorOpen = ref(false)
  let storedDeliveryAddress = ''

  const account = useLiveAsyncData<MarketplaceAccountResponse | null>(
    computed(() => `market-account:${authUser.value?.uid || ''}`),
    async (liveFetch) => {
      const user = authUser.value
      if (!user) return null
      return liveFetch<MarketplaceAccountResponse>('/api/marketplace/account', {
        headers: { Authorization: `Bearer ${await user.getIdToken()}` },
      })
    },
    { server: false }
  )
  const accountProfile = computed(() =>
    authUser.value ? (account.data.value?.profile ?? null) : null
  )

  const liveRecords = useLiveAsyncData(
    computed(() => `personal-market:${authUser.value?.uid || ''}`),
    async (liveFetch) => {
      if (!authUser.value)
        return {
          stores: [] as MarketplaceStore[],
          orders: [] as MarketplaceOrder[],
        }
      const client = useMarketplaceClient(liveFetch)
      const [stores, orders] = await Promise.all([
        client.managedStores(),
        client.orders('buyer'),
      ])
      return { stores: stores.items, orders: orders.items }
    },
    { server: false }
  )
  const managedStores = computed<MarketplaceStore[]>(() =>
    authUser.value ? liveRecords.data.value?.stores || [] : []
  )
  const buyerOrders = computed<MarketplaceOrder[]>(() =>
    authUser.value ? liveRecords.data.value?.orders || [] : []
  )
  const sellerEnabled = computed(() => managedStores.value.length > 0)

  const surfaceTabsLabel = computed(() =>
    copy('account_surface_tabs_label', {
      buy: copy('buy'),
      sell: copy('sell'),
    })
  )

  const profileName = computed(() =>
    String(
      currentUser.value?.display_name || authUser.value?.displayName || ''
    ).trim()
  )

  const profileDisplayName = computed(
    () => profileName.value || copy('account_profile_fallback_name')
  )

  const profileInitials = computed(() => {
    const parts = profileDisplayName.value.split(/\s+/).filter(Boolean)
    if (!parts.length) return ''
    if (parts.length === 1) return parts[0]?.slice(0, 2).toUpperCase() || ''
    return `${parts[0]?.[0] ?? ''}${parts[1]?.[0] ?? ''}`.toUpperCase()
  })

  const profileAvatarSrc = computed(() => {
    const authAvatar =
      typeof authUser.value?.photoURL === 'string'
        ? authUser.value.photoURL.trim()
        : ''
    return getProxiedAvatarUrl(avatarSrc.value || authAvatar || undefined)
  })

  watch(
    () => authUser.value?.uid,
    (uid) => {
      profileEditorOpen.value = false
      activeSurface.value = 'buyer'
      deliveryAddress.value = ''
      storedDeliveryAddress = ''
      settingsState.value = uid ? 'loading' : 'idle'
      settingsMessageKey.value = null
    },
    { immediate: true, flush: 'sync' }
  )

  watch(
    [account.data, account.pending, account.error, liveRecords.error],
    () => {
      if (!authUser.value || settingsState.value === 'saving') return
      if (account.error.value || liveRecords.error.value) {
        settingsState.value = 'error'
        settingsMessageKey.value = 'account_settings_load_error'
        return
      }
      const value = account.data.value
      if (!value) {
        if (account.pending.value) settingsState.value = 'loading'
        return
      }
      const address = value.settings.delivery_address
      if (
        deliveryAddress.value === storedDeliveryAddress ||
        settingsState.value === 'loading'
      )
        deliveryAddress.value = address
      storedDeliveryAddress = address
      if (
        settingsState.value === 'loading' ||
        settingsState.value === 'error'
      ) {
        settingsState.value = 'idle'
        settingsMessageKey.value = null
      }
    },
    { immediate: true }
  )

  function formatMoney(money: { amount_minor: number; currency_code: string }) {
    return new Intl.NumberFormat(locale.value, {
      style: 'currency',
      currency: money.currency_code,
    }).format(money.amount_minor / 100)
  }

  function orderStatusLabel(status: MarketplaceOrderStatus) {
    return copy(
      `market_order_${status}` as
        | 'market_order_requested'
        | 'market_order_accepted'
        | 'market_order_ready'
        | 'market_order_completed'
        | 'market_order_rejected'
        | 'market_order_cancelled'
    )
  }

  function storeStateLabel(state: MarketplaceStoreState) {
    return copy(
      `market_store_${state}` as
        | 'market_store_draft'
        | 'market_store_pending_review'
        | 'market_store_published'
        | 'market_store_paused'
    )
  }

  async function cancelBuyerOrder(orderId: string) {
    if (orderActionId.value) return
    const isCurrent = marketplace.captureIntent()
    orderActionId.value = orderId
    try {
      await marketplace.transitionOrder(orderId, 'cancelled')
      if (isCurrent()) await liveRecords.refresh()
    } finally {
      if (isCurrent()) orderActionId.value = ''
    }
  }

  async function saveSettings() {
    const user = authUser.value
    if (!user || settingsState.value === 'saving') return

    const isCurrent = marketplace.captureIntent()
    settingsState.value = 'saving'
    settingsMessageKey.value = null
    const body: MarketplaceAccountSettingsInput = {
      delivery_address: deliveryAddress.value.trim(),
    }

    try {
      const token = await user.getIdToken()
      if (!isCurrent()) return
      const response = await $fetch<MarketplaceSettingsResponse>(
        '/api/marketplace/account',
        {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` },
          body,
        }
      )
      if (!isCurrent()) return
      deliveryAddress.value = response.settings.delivery_address
      settingsState.value = 'saved'
      settingsMessageKey.value = 'account_settings_saved'
    } catch {
      if (!isCurrent()) return
      settingsState.value = 'error'
      settingsMessageKey.value = 'account_settings_save_error'
    }
  }

  return {
    accountProfile,
    accountPending: account.pending,
    accountError: account.error,
    profileEditorOpen,
    activeSurface,
    authPhase,
    buyerOrders,
    cancelBuyerOrder,
    copy,
    deliveryAddress,
    formatMoney,
    managedStores,
    orderActionId,
    orderStatusLabel,
    profileAvatarSrc,
    profileDisplayName,
    profileInitials,
    saveSettings,
    sellerEnabled,
    settingsMessageKey,
    settingsState,
    storeStateLabel,
    surfaceTabsLabel,
  }
}
