<template>
  <article class="market-storefront__content">
    <NuxtLink :to="backTo" class="market-storefront__back">
      <UIcon name="i-lucide-arrow-left" aria-hidden="true" />
      {{
        copy(preview ? 'market_admin_back' : 'storefront_back_to_marketplace')
      }}
    </NuxtLink>

    <p v-if="preview" class="market-storefront__prototype-note">
      <UIcon name="i-lucide-eye" aria-hidden="true" />
      {{ copy('market_draft_preview_notice') }}
    </p>

    <section class="market-storefront__hero market-storefront__hero--canonical">
      <div class="market-storefront__intro">
        <p class="market-eyebrow">
          {{ copy(preview ? 'market_draft_preview' : 'market_live_store') }}
        </p>
        <h1 id="storefront-title">{{ store.name }}</h1>
        <div class="market-storefront__facts">
          <span>
            <UIcon name="i-lucide-map-pin" aria-hidden="true" />
            {{ store.locality.postal_code }} · {{ store.locality.label }}
          </span>
          <span v-for="method in store.fulfilment_methods" :key="method">
            <UIcon
              :name="
                method === 'collection'
                  ? 'i-lucide-shopping-basket'
                  : 'i-lucide-bike'
              "
              aria-hidden="true"
            />
            {{ methodLabel(method) }}
          </span>
        </div>
        <p class="market-storefront__description">{{ store.description }}</p>
      </div>

      <div class="market-canonical-store__art">
        <img
          v-if="store.image_url"
          :src="store.image_url"
          :alt="store.image_alt"
        />
        <span v-else aria-hidden="true">
          <UIcon name="i-lucide-mountain-snow" />
          <UIcon name="i-lucide-store" />
        </span>
      </div>
    </section>

    <section class="market-storefront__offers" aria-labelledby="offer-title">
      <header>
        <div>
          <p class="market-eyebrow">{{ copy('buy') }}</p>
          <h2 id="offer-title">{{ copy('account_products_title') }}</h2>
        </div>
        <p>{{ copy('market_fixed_price_note') }}</p>
      </header>

      <div v-if="store.offers?.length" class="market-storefront__offer-grid">
        <article
          v-for="offer in store.offers"
          :key="offer.id"
          class="market-storefront__offer"
          :class="{ 'is-selected': selectedOfferId === offer.id }"
        >
          <span class="market-storefront__offer-size">
            {{ offer.unit_label }}
          </span>
          <h3>{{ offer.title }}</h3>
          <p v-if="offer.description">{{ offer.description }}</p>
          <strong class="market-canonical-store__price">
            {{ formatMoney(offer.price) }}
          </strong>
          <button v-if="!preview" type="button" @click="selectOffer(offer.id)">
            <UIcon name="i-lucide-shopping-basket" aria-hidden="true" />
            {{ copy('storefront_choose_size') }}
          </button>
        </article>
      </div>
      <p v-else class="market-canonical-store__empty">
        {{ copy('market_no_live_offers') }}
      </p>
    </section>

    <section
      v-if="!preview && selectedOffer"
      class="market-storefront__interest market-canonical-order"
      aria-live="polite"
    >
      <template v-if="requestState === 'sent'">
        <div>
          <p class="market-eyebrow">{{ copy('market_order_requested') }}</p>
          <h2>{{ copy('market_request_success') }}</h2>
        </div>
        <NuxtLink to="/mis" class="market-action market-action--dark">
          <UIcon name="i-lucide-receipt-text" aria-hidden="true" />
          <strong>{{ copy('my_interlaken_essen') }}</strong>
          <UIcon name="i-lucide-arrow-right" aria-hidden="true" />
        </NuxtLink>
      </template>

      <template v-else-if="!authUser">
        <div>
          <p class="market-eyebrow">{{ selectedOffer.title }}</p>
          <h2>{{ formatMoney(selectedOffer.price) }}</h2>
          <p>{{ copy('market_fixed_price_note') }}</p>
        </div>
        <NuxtLink to="/auth" class="market-action market-action--dark">
          <UIcon name="i-lucide-log-in" aria-hidden="true" />
          <strong>{{ copy('market_sign_in_to_order') }}</strong>
          <UIcon name="i-lucide-arrow-right" aria-hidden="true" />
        </NuxtLink>
      </template>

      <form
        v-else
        class="market-canonical-order__form"
        @submit.prevent="sendOrder"
      >
        <div>
          <p class="market-eyebrow">{{ selectedOffer.title }}</p>
          <h2>{{ formatMoney(selectedOffer.price) }}</h2>
        </div>
        <label>
          <span>{{ copy('market_quantity') }}</span>
          <input v-model.number="quantity" type="number" min="1" max="99" />
        </label>
        <label>
          <span>{{ copy('market_fulfilment') }}</span>
          <select v-model="fulfilmentMethod">
            <option
              v-for="method in selectedOffer.fulfilment_methods"
              :key="method"
              :value="method"
            >
              {{ methodLabel(method) }}
            </option>
          </select>
        </label>
        <label v-if="fulfilmentMethod === 'local_delivery'">
          <span>{{ copy('account_delivery_address_label') }}</span>
          <textarea
            v-model="deliveryAddress"
            rows="3"
            maxlength="500"
            required
          />
        </label>
        <label>
          <span>{{ copy('market_order_note') }}</span>
          <textarea v-model="buyerNote" rows="3" maxlength="500" />
        </label>
        <p v-if="requestState === 'error'" role="alert">
          {{ copy('market_request_error') }}
        </p>
        <button
          type="submit"
          class="market-action market-action--dark"
          :disabled="requestState === 'sending'"
        >
          <UIcon
            :name="
              requestState === 'sending'
                ? 'i-lucide-loader-circle'
                : 'i-lucide-send'
            "
            :class="{ 'is-spinning': requestState === 'sending' }"
            aria-hidden="true"
          />
          <strong>
            {{
              copy(
                requestState === 'sending'
                  ? 'market_sending_request'
                  : 'market_send_request'
              )
            }}
          </strong>
        </button>
      </form>
    </section>
  </article>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useInterlakenCopy } from '@/composables/useInterlakenCopy'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import type { MarketplaceStoreDirectoryEntry } from 'fireux-marketplace/runtime/marketplace-store/models/marketplace-api.model'
import type { MarketplaceFulfilmentMethod } from 'fireux-marketplace/runtime/marketplace-store/models/marketplace.model'

const props = withDefaults(
  defineProps<{
    store: MarketplaceStoreDirectoryEntry
    preview?: boolean
    backTo?: string
  }>(),
  {
    preview: false,
    backTo: '/marktplatz',
  }
)
const { copy, locale } = useInterlakenCopy()
const { currentUser: authUser } = useAuth()
const marketplace = useMarketplaceClient()

const selectedOfferId = ref('')
const quantity = ref(1)
const fulfilmentMethod = ref<MarketplaceFulfilmentMethod>('collection')
const deliveryAddress = ref('')
const buyerNote = ref('')
const requestState = ref<'idle' | 'sending' | 'sent' | 'error'>('idle')

const selectedOffer = computed(() =>
  props.store.offers?.find((offer) => offer.id === selectedOfferId.value)
)

function methodLabel(method: MarketplaceFulfilmentMethod) {
  return copy(
    method === 'collection' ? 'market_collection' : 'market_local_delivery'
  )
}

function formatMoney(money: { amount_minor: number; currency_code: string }) {
  return new Intl.NumberFormat(locale.value, {
    style: 'currency',
    currency: money.currency_code,
  }).format(money.amount_minor / 100)
}

function selectOffer(offerId: string) {
  selectedOfferId.value = offerId
  const offer = props.store.offers?.find((item) => item.id === offerId)
  fulfilmentMethod.value = offer?.fulfilment_methods[0] || 'collection'
  quantity.value = 1
  requestState.value = 'idle'
}

async function sendOrder() {
  const offer = selectedOffer.value
  if (!offer || requestState.value === 'sending') return
  requestState.value = 'sending'
  try {
    await marketplace.createOrder({
      store_id: props.store.id,
      lines: [{ offer_id: offer.id, quantity: quantity.value }],
      fulfilment_method: fulfilmentMethod.value,
      delivery_address:
        fulfilmentMethod.value === 'local_delivery'
          ? deliveryAddress.value.trim()
          : '',
      buyer_note: buyerNote.value.trim(),
    })
    requestState.value = 'sent'
  } catch {
    requestState.value = 'error'
  }
}
</script>
