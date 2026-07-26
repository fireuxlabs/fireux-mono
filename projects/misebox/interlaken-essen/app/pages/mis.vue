<template>
  <section
    class="market-page market-personal"
    aria-labelledby="personal-title"
  >
    <div class="market-personal__content">
      <ClientOnly>
        <div
          v-if="authPhase === 'loading'"
          class="market-personal__loading"
          :aria-label="copy('account_loading_label')"
        >
          <USkeleton class="market-personal__loading-avatar" />
          <USkeleton class="market-personal__loading-title" />
          <USkeleton class="market-personal__loading-card" />
        </div>

        <div v-else-if="authPhase === 'guest'" class="market-personal__guest">
          <p class="market-eyebrow">{{ copy('account_eyebrow') }}</p>
          <h1 id="personal-title">{{ copy('account_page_title') }}</h1>
          <p class="market-intro">
            {{ copy('account_guest_intro') }}
          </p>
          <NuxtLink to="/auth" class="market-personal__primary-action">
            <UIcon name="i-lucide-log-in" aria-hidden="true" />
            <strong>{{ copy('account_sign_in') }}</strong>
            <UIcon name="i-lucide-arrow-right" aria-hidden="true" />
          </NuxtLink>
        </div>

        <div v-else>
          <header class="market-personal__header">
            <div class="market-personal__identity">
              <UAvatar
                :src="profileAvatarSrc"
                :alt="profileDisplayName"
                :text="profileInitials"
                size="lg"
                class="market-personal__avatar"
              />
              <div>
                <span>Interlaken Essen</span>
                <strong>{{ profileDisplayName }}</strong>
              </div>
            </div>

            <div>
              <p class="market-eyebrow">{{ copy('account_eyebrow') }}</p>
              <h1 id="personal-title">{{ copy('account_page_title') }}</h1>
            </div>
          </header>

          <nav
            v-if="sellerEnabled"
            class="market-personal__tabs"
            :aria-label="surfaceTabsLabel"
            role="tablist"
          >
            <button
              id="personal-buyer-tab"
              type="button"
              role="tab"
              :aria-selected="activeSurface === 'buyer'"
              aria-controls="personal-buyer-panel"
              :class="{ 'is-active': activeSurface === 'buyer' }"
              @click="activeSurface = 'buyer'"
            >
              <UIcon name="i-lucide-shopping-basket" aria-hidden="true" />
              {{ copy('buy') }}
            </button>
            <button
              id="personal-seller-tab"
              type="button"
              role="tab"
              :aria-selected="activeSurface === 'seller'"
              aria-controls="personal-seller-panel"
              :class="{ 'is-active': activeSurface === 'seller' }"
              @click="activeSurface = 'seller'"
            >
              <UIcon name="i-lucide-store" aria-hidden="true" />
              {{ copy('sell') }}
            </button>
          </nav>

          <section
            v-show="!sellerEnabled || activeSurface === 'buyer'"
            id="personal-buyer-panel"
            class="market-personal__workspace"
            :role="sellerEnabled ? 'tabpanel' : 'region'"
            :aria-labelledby="sellerEnabled ? 'personal-buyer-tab' : undefined"
            :aria-label="sellerEnabled ? undefined : copy('buy')"
          >
            <header class="market-personal__workspace-header">
              <p class="market-personal__section-kicker">
                {{ copy('account_buyer_kicker') }}
              </p>
              <h2>{{ copy('buy') }}</h2>
            </header>

            <div class="market-personal__buyer-grid">
              <article class="market-personal__section">
                <header class="market-personal__section-header">
                  <span class="market-personal__section-icon">
                    <UIcon name="i-lucide-receipt-text" aria-hidden="true" />
                  </span>
                  <div>
                    <p class="market-personal__section-kicker">
                      {{ copy('buy') }}
                    </p>
                    <h3>{{ copy('account_orders_title') }}</h3>
                  </div>
                </header>

                <div v-if="buyerOrders.length" class="market-personal__records">
                  <article v-for="order in buyerOrders" :key="order.id">
                    <div>
                      <strong>{{ order.store_name }}</strong>
                      <span>{{ orderStatusLabel(order.status) }}</span>
                    </div>
                    <strong>{{ formatMoney(order.total) }}</strong>
                    <button
                      v-if="order.status === 'requested'"
                      type="button"
                      :disabled="orderActionId === order.id"
                      @click="cancelBuyerOrder(order.id)"
                    >
                      {{ copy('market_cancel_order') }}
                    </button>
                  </article>
                </div>
                <div v-else class="market-personal__empty">
                  <p>{{ copy('account_orders_empty') }}</p>
                  <NuxtLink to="/choufe">
                    {{ copy('account_browse_offers') }}
                    <UIcon name="i-lucide-arrow-right" aria-hidden="true" />
                  </NuxtLink>
                </div>
              </article>

              <article class="market-personal__section">
                <header class="market-personal__section-header">
                  <span class="market-personal__section-icon">
                    <UIcon name="i-lucide-map-pin-house" aria-hidden="true" />
                  </span>
                  <div>
                    <p class="market-personal__section-kicker">
                      {{ copy('account_settings_kicker') }}
                    </p>
                    <h3>{{ copy('account_delivery_address_title') }}</h3>
                  </div>
                </header>

                <form
                  class="market-personal__settings"
                  @submit.prevent="saveSettings"
                >
                  <label for="delivery-address">
                    <span>{{ copy('account_delivery_address_label') }}</span>
                    <textarea
                      id="delivery-address"
                      v-model="deliveryAddress"
                      rows="4"
                      maxlength="500"
                      autocomplete="street-address"
                      :placeholder="copy('account_delivery_address_placeholder')"
                      :disabled="settingsState === 'loading' || settingsState === 'saving'"
                    />
                  </label>

                  <div
                    v-if="settingsMessageKey"
                    class="market-personal__settings-message"
                    :class="{ 'is-error': settingsState === 'error' }"
                    :role="settingsState === 'error' ? 'alert' : 'status'"
                  >
                    {{ copy(settingsMessageKey) }}
                  </div>

                  <button
                    type="submit"
                    :disabled="settingsState === 'loading' || settingsState === 'saving'"
                  >
                    <UIcon
                      :name="settingsState === 'saving' ? 'i-lucide-loader-circle' : 'i-lucide-check'"
                      aria-hidden="true"
                      :class="{ 'is-spinning': settingsState === 'saving' }"
                    />
                    {{
                      copy(
                        settingsState === 'saving'
                          ? 'account_saving'
                          : 'account_save'
                      )
                    }}
                  </button>
                </form>
              </article>
            </div>
          </section>

          <section
            v-if="sellerEnabled"
            v-show="activeSurface === 'seller'"
            id="personal-seller-panel"
            class="market-personal__workspace market-personal__workspace--seller"
            role="tabpanel"
            aria-labelledby="personal-seller-tab"
          >
            <header class="market-personal__workspace-header">
              <p class="market-personal__section-kicker">
                {{ copy('account_seller_kicker') }}
              </p>
              <h2>{{ copy('sell') }}</h2>
            </header>

            <div class="market-personal__seller-grid">
              <article class="market-personal__section">
                <header class="market-personal__section-header">
                  <span class="market-personal__section-icon">
                    <UIcon name="i-lucide-package-open" aria-hidden="true" />
                  </span>
                  <div>
                    <p class="market-personal__section-kicker">
                      {{ copy('account_offer_kicker') }}
                    </p>
                    <h3>{{ copy('account_products_title') }}</h3>
                  </div>
                </header>

                <div class="market-personal__records">
                  <NuxtLink
                    v-for="store in managedStores"
                    :key="store.id"
                    :to="`/mis/stores/${store.id}`"
                  >
                    <div>
                      <strong>{{ store.name }}</strong>
                      <span>{{ storeStateLabel(store.publication_state) }}</span>
                    </div>
                    <UIcon name="i-lucide-arrow-right" aria-hidden="true" />
                  </NuxtLink>
                  <NuxtLink to="/mis/stores">
                    <strong>{{ copy('market_manage_stores') }}</strong>
                    <UIcon name="i-lucide-arrow-right" aria-hidden="true" />
                  </NuxtLink>
                </div>
              </article>

              <article class="market-personal__section">
                <header class="market-personal__section-header">
                  <span class="market-personal__section-icon">
                    <UIcon name="i-lucide-clipboard-list" aria-hidden="true" />
                  </span>
                  <div>
                    <p class="market-personal__section-kicker">
                      {{ copy('sell') }}
                    </p>
                    <h3>{{ copy('account_orders_title') }}</h3>
                  </div>
                </header>

                <div class="market-personal__empty">
                  <p>{{ copy('market_manage_stores') }}</p>
                  <NuxtLink to="/mis/stores">
                    {{ copy('market_orders') }}
                    <UIcon name="i-lucide-arrow-right" aria-hidden="true" />
                  </NuxtLink>
                </div>
              </article>
            </div>
          </section>

          <aside
            v-if="showOnboardingReset"
            class="market-personal__dev-reset"
          >
            <div>
              <strong>{{ copy('account_dev_reset_title') }}</strong>
              <p>{{ copy('account_dev_reset_description') }}</p>
              <p
                v-if="onboardingResetState === 'error'"
                class="market-personal__dev-reset-error"
                role="alert"
              >
                {{ copy('account_dev_reset_error') }}
              </p>
            </div>
            <button
              type="button"
              :disabled="onboardingResetState === 'resetting'"
              @click="resetOnboarding"
            >
              <UIcon
                :name="
                  onboardingResetState === 'resetting'
                    ? 'i-lucide-loader-circle'
                    : 'i-lucide-trash-2'
                "
                aria-hidden="true"
                :class="{
                  'is-spinning': onboardingResetState === 'resetting',
                }"
              />
              {{
                copy(
                  onboardingResetState === 'resetting'
                    ? 'account_dev_resetting'
                    : 'account_dev_reset_action'
                )
              }}
            </button>
          </aside>
        </div>

        <template #fallback>
          <div
            class="market-personal__loading"
            :aria-label="copy('account_loading_label')"
          >
            <USkeleton class="market-personal__loading-avatar" />
            <USkeleton class="market-personal__loading-title" />
            <USkeleton class="market-personal__loading-card" />
          </div>
        </template>
      </ClientOnly>
    </div>
  </section>
</template>

<script setup lang="ts">
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
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
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

definePageMeta({
  layout: 'marketplace',
})

const { copy, locale } = useInterlakenCopy()
const fireux = useFireUXConfig()
const marketplace = useMarketplaceClient()
const { setStatus: setOnboardingStatus } =
  useInterlakenOnboardingStatus()

useSeoMeta({
  title: () => copy('account_page_title'),
  description: () => copy('account_seo_description'),
})

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
</script>
