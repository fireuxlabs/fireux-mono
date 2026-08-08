import type {
  MarketplaceAccountResponse,
  MarketplaceAccountSettings,
  MarketplaceAccountSettingsInput,
} from '@/content/marketplace-profile'
import { useInterlakenCopy } from '@/composables/useInterlakenCopy'
import { useInterlakenOnboardingStatus } from '@/composables/useInterlakenOnboardingStatus'
import { computed, navigateTo, ref, watch } from '#imports'
import { useConsoleEntryState } from 'fireux-core/runtime/composables/fireux/app/ui/useConsoleEntryState'
import { useAvatarProxy } from 'fireux-core/runtime/composables/fireux/app/ui/useAvatarProxy'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useUser } from 'fireux-core/runtime/composables/fireux/user/useUser'
import type {
  MarketplaceOrder,
  MarketplaceOrderStatus,
  MarketplaceStore,
  MarketplaceStoreState,
} from 'fireux-marketplace/runtime/models/marketplace.model'

type PersonalSurface = 'buyer' | 'seller'
type SettingsState = 'idle' | 'loading' | 'saving' | 'saved' | 'error'
type OnboardingResetState = 'idle' | 'resetting' | 'error'
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
  const fireux = useFireUXConfig()
  const marketplace = useMarketplaceClient()
  const { setStatus: setOnboardingStatus } =
    useInterlakenOnboardingStatus()

  const { authPhase } = useConsoleEntryState()
  const { currentUser, avatarSrc } = useUser()
  const { currentUser: authUser } = useAuth()
  const { getProxiedAvatarUrl } = useAvatarProxy()

  const activeSurface = ref<PersonalSurface>('buyer')
  const sellerEnabled = ref(false)
  const managedStores = ref<MarketplaceStore[]>([])
  const buyerOrders = ref<MarketplaceOrder[]>([])
  const orderActionId = ref('')
  const deliveryAddress = ref('')
  const settingsState = ref<SettingsState>('idle')
  const settingsMessageKey = ref<SettingsMessageKey | null>(null)
  const onboardingResetState = ref<OnboardingResetState>('idle')
  let settingsRequest = 0

  const showOnboardingReset = computed(() =>
    fireux.devMode &&
    Boolean(fireux.developerId) &&
    authUser.value?.uid === fireux.developerId
  )

  const surfaceTabsLabel = computed(() =>
    copy('account_surface_tabs_label', {
      buy: copy('buy'),
      sell: copy('sell'),
    })
  )

  const profileName = computed(() =>
    String(
      currentUser.value?.display_name ||
      authUser.value?.displayName ||
      ''
    ).trim()
  )

  const profileDisplayName = computed(
    () => profileName.value || copy('account_profile_fallback_name')
  )

  const profileInitials = computed(() => {
    const parts = profileDisplayName.value.split(/\s+/).filter(Boolean)
    if (!parts.length) return ''
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
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
    async (uid: string | undefined) => {
      const request = ++settingsRequest
      settingsMessageKey.value = null

      if (!uid || !authUser.value) {
        activeSurface.value = 'buyer'
        sellerEnabled.value = false
        managedStores.value = []
        buyerOrders.value = []
        deliveryAddress.value = ''
        settingsState.value = 'idle'
        return
      }

      settingsState.value = 'loading'
      try {
        const token = await authUser.value.getIdToken()
        const response = await $fetch<MarketplaceAccountResponse>(
          '/api/marketplace/account',
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        if (request !== settingsRequest) return
        const [storeResponse, orderResponse] = await Promise.all([
          marketplace.managedStores(),
          marketplace.orders('buyer'),
        ])
        if (request !== settingsRequest) return
        managedStores.value = storeResponse.items
        buyerOrders.value = orderResponse.items
        sellerEnabled.value = managedStores.value.length > 0
        setOnboardingStatus(response.membership.onboarding_status)
        if (!sellerEnabled.value) activeSurface.value = 'buyer'
        deliveryAddress.value = response.settings.delivery_address
        settingsState.value = 'idle'
      } catch {
        if (request !== settingsRequest) return
        activeSurface.value = 'buyer'
        sellerEnabled.value = false
        managedStores.value = []
        buyerOrders.value = []
        settingsState.value = 'error'
        settingsMessageKey.value = 'account_settings_load_error'
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
    return copy(`market_order_${status}` as
      | 'market_order_requested'
      | 'market_order_accepted'
      | 'market_order_ready'
      | 'market_order_completed'
      | 'market_order_rejected'
      | 'market_order_cancelled')
  }

  function storeStateLabel(state: MarketplaceStoreState) {
    return copy(`market_store_${state}` as
      | 'market_store_draft'
      | 'market_store_pending_review'
      | 'market_store_published'
      | 'market_store_paused')
  }

  async function cancelBuyerOrder(orderId: string) {
    if (orderActionId.value) return
    orderActionId.value = orderId
    try {
      await marketplace.transitionOrder(orderId, 'cancelled')
      buyerOrders.value = (await marketplace.orders('buyer')).items
    } finally {
      orderActionId.value = ''
    }
  }

  async function saveSettings() {
    const user = authUser.value
    if (!user || settingsState.value === 'saving') return

    settingsState.value = 'saving'
    settingsMessageKey.value = null
    const body: MarketplaceAccountSettingsInput = {
      delivery_address: deliveryAddress.value.trim(),
    }

    try {
      const token = await user.getIdToken()
      const response = await $fetch<MarketplaceSettingsResponse>(
        '/api/marketplace/account',
        {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` },
          body,
        }
      )
      deliveryAddress.value = response.settings.delivery_address
      settingsState.value = 'saved'
      settingsMessageKey.value = 'account_settings_saved'
    } catch {
      settingsState.value = 'error'
      settingsMessageKey.value = 'account_settings_save_error'
    }
  }

  async function resetOnboarding() {
    const user = authUser.value
    if (
      !user ||
      !showOnboardingReset.value ||
      onboardingResetState.value === 'resetting'
    ) return

    const confirmed = globalThis.confirm(
      copy('account_dev_reset_confirmation')
    )
    if (!confirmed) return

    onboardingResetState.value = 'resetting'
    try {
      const token = await user.getIdToken()
      const response = await $fetch<{
        ok: true
        onboarding_status: 'pending'
      }>('/api/dev/onboarding-reset', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      setOnboardingStatus(response.onboarding_status)
      await navigateTo('/')
    } catch {
      onboardingResetState.value = 'error'
    }
  }

  return {
    activeSurface,
    authPhase,
    buyerOrders,
    cancelBuyerOrder,
    copy,
    deliveryAddress,
    formatMoney,
    managedStores,
    onboardingResetState,
    orderActionId,
    orderStatusLabel,
    profileAvatarSrc,
    profileDisplayName,
    profileInitials,
    resetOnboarding,
    saveSettings,
    sellerEnabled,
    settingsMessageKey,
    settingsState,
    showOnboardingReset,
    storeStateLabel,
    surfaceTabsLabel,
  }
}
