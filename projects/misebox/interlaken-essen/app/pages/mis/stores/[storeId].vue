<template>
  <section class="market-page market-personal market-workbench">
    <div class="market-personal__content">
      <header class="market-workbench__header">
        <div>
          <p class="market-eyebrow">{{ copy('sell') }}</p>
          <h1>{{ store?.name || copy('market_loading') }}</h1>
          <p v-if="store">
            {{ storeStateLabel(store.publication_state) }} ·
            /marktplatz/{{ store.slug }}
          </p>
        </div>
        <NuxtLink to="/mis/stores" class="market-storefront__back">
          <UIcon name="i-lucide-arrow-left" aria-hidden="true" />
          {{ copy('market_my_stores') }}
        </NuxtLink>
      </header>

      <p v-if="state === 'loading'">{{ copy('market_loading') }}</p>
      <p v-if="message" :class="{ 'is-error': state === 'error' }">
        {{ message }}
      </p>

      <template v-if="store">
        <form class="market-workbench__form-card market-workbench__form" @submit.prevent="saveStore">
          <label>
            <span>{{ copy('market_store_name') }}</span>
            <input v-model="storeForm.name" required maxlength="80">
          </label>
          <label>
            <span>{{ copy('market_locality') }}</span>
            <input v-model="storeForm.locality" required maxlength="80">
          </label>
          <label class="market-workbench__wide">
            <span>{{ copy('market_store_description') }}</span>
            <textarea
              v-model="storeForm.description"
              required
              minlength="10"
              maxlength="1000"
              rows="4"
            />
          </label>
          <label>
            <span>{{ copy('market_postcode') }}</span>
            <input
              v-model="storeForm.postcode"
              required
              pattern="[0-9]{4}"
              maxlength="4"
            >
          </label>
          <fieldset class="market-workbench__wide">
            <legend>{{ copy('buy_categories_label') }}</legend>
            <label
              v-for="section in marketSections"
              :key="section.id"
              class="market-workbench__check"
            >
              <input
                v-model="storeForm.sections"
                type="checkbox"
                :value="section.id"
              >
              <span>{{ copy(section.labelKey) }}</span>
            </label>
          </fieldset>
          <fieldset class="market-workbench__wide">
            <legend>{{ copy('market_fulfilment') }}</legend>
            <label class="market-workbench__check">
              <input
                v-model="storeForm.methods"
                type="checkbox"
                value="collection"
                :disabled="store.publication_state === 'published'"
              >
              <span>{{ copy('market_collection') }}</span>
            </label>
            <label class="market-workbench__check">
              <input
                v-model="storeForm.methods"
                type="checkbox"
                value="local_delivery"
                :disabled="store.publication_state === 'published'"
              >
              <span>{{ copy('market_local_delivery') }}</span>
            </label>
          </fieldset>
          <div class="market-workbench__actions market-workbench__wide">
            <button type="submit" :disabled="state === 'saving'">
              <UIcon name="i-lucide-save" aria-hidden="true" />
              {{ copy('market_save_store') }}
            </button>
            <button
              v-if="store.publication_state === 'draft'"
              type="button"
              :disabled="state === 'saving'"
              @click="submitStore"
            >
              <UIcon name="i-lucide-send" aria-hidden="true" />
              {{ copy('market_submit_store') }}
            </button>
          </div>
        </form>

        <section class="market-workbench__section">
          <header>
            <div>
              <p class="market-eyebrow">{{ copy('account_products_title') }}</p>
              <h2>{{ copy('market_add_offer') }}</h2>
            </div>
          </header>

          <form class="market-workbench__form" @submit.prevent="addOffer">
            <label>
              <span>{{ copy('market_offer_title') }}</span>
              <input v-model="offerForm.title" required maxlength="120">
            </label>
            <label>
              <span>{{ copy('market_offer_unit') }}</span>
              <input v-model="offerForm.unit" required maxlength="40">
            </label>
            <label>
              <span>{{ copy('market_offer_price') }}</span>
              <input
                v-model="offerForm.price"
                inputmode="decimal"
                placeholder="12.50"
              >
            </label>
            <label class="market-workbench__wide">
              <span>{{ copy('market_store_description') }}</span>
              <textarea v-model="offerForm.description" maxlength="1000" rows="3" />
            </label>
            <button type="submit" :disabled="state === 'saving'">
              <UIcon name="i-lucide-circle-plus" aria-hidden="true" />
              {{ copy('market_add_offer') }}
            </button>
          </form>

          <div class="market-offer-admin">
            <article v-for="offer in store.offers" :key="offer.id">
              <header>
                <div>
                  <span>{{ offerStateLabel(offer.state) }}</span>
                  <h3>{{ offer.title }} · {{ offer.unit_label }}</h3>
                </div>
                <strong>
                  {{ offer.price ? formatMoney(offer.price) : '—' }}
                </strong>
              </header>
              <form @submit.prevent="saveOfferPrice(offer)">
                <label>
                  <span>{{ copy('market_offer_price') }}</span>
                  <input
                    v-model="offerPrices[offer.id]"
                    inputmode="decimal"
                    placeholder="12.50"
                  >
                </label>
                <button type="submit">{{ copy('account_save') }}</button>
              </form>
              <div class="market-workbench__actions">
                <button
                  v-if="offer.state === 'draft' || offer.state === 'unavailable'"
                  type="button"
                  :disabled="store.publication_state !== 'published' || !offer.price"
                  @click="transitionOffer(offer.id, 'published')"
                >
                  {{ copy('market_publish_offer') }}
                </button>
                <button
                  v-if="offer.state === 'published'"
                  type="button"
                  @click="transitionOffer(offer.id, 'unavailable')"
                >
                  {{ copy('market_make_unavailable') }}
                </button>
              </div>
            </article>
          </div>
        </section>

        <section class="market-workbench__section">
          <header>
            <div>
              <p class="market-eyebrow">{{ copy('sell') }}</p>
              <h2>{{ copy('market_orders') }}</h2>
            </div>
          </header>
          <p v-if="!orders.length">{{ copy('account_orders_empty') }}</p>
          <div class="market-order-admin">
            <article v-for="order in orders" :key="order.id">
              <header>
                <div>
                  <span>{{ orderStatusLabel(order.status) }}</span>
                  <h3>{{ formatMoney(order.total) }}</h3>
                </div>
                <small>{{ order.id }}</small>
              </header>
              <ul>
                <li v-for="line in order.lines" :key="line.offer_id">
                  {{ line.quantity }} × {{ line.title }} · {{ line.unit_label }}
                </li>
              </ul>
              <p>
                {{
                  order.fulfilment_method === 'collection'
                    ? copy('market_collection')
                    : copy('market_local_delivery')
                }}
              </p>
              <p v-if="order.delivery_address">{{ order.delivery_address }}</p>
              <p v-if="order.buyer_note">{{ order.buyer_note }}</p>
              <div class="market-workbench__actions">
                <button
                  v-if="order.status === 'requested'"
                  type="button"
                  @click="transitionOrder(order.id, 'accepted')"
                >
                  {{ copy('market_order_accepted') }}
                </button>
                <button
                  v-if="order.status === 'requested'"
                  type="button"
                  @click="transitionOrder(order.id, 'rejected')"
                >
                  {{ copy('market_order_rejected') }}
                </button>
                <button
                  v-if="order.status === 'accepted'"
                  type="button"
                  @click="transitionOrder(order.id, 'ready')"
                >
                  {{ copy('market_order_ready') }}
                </button>
                <button
                  v-if="order.status === 'ready'"
                  type="button"
                  @click="transitionOrder(order.id, 'completed')"
                >
                  {{ copy('market_order_completed') }}
                </button>
                <button
                  v-if="['requested', 'accepted', 'ready'].includes(order.status)"
                  type="button"
                  @click="transitionOrder(order.id, 'cancelled')"
                >
                  {{ copy('market_cancel_order') }}
                </button>
              </div>
            </article>
          </div>
        </section>
      </template>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { useInterlakenCopy } from '@/composables/useInterlakenCopy'
import { marketSections } from '@/content/market-sections'
import type {
  ManagedMarketplaceStore,
} from 'fireux-marketplace/runtime/models/marketplace-api.model'
import type {
  MarketplaceFulfilmentMethod,
  MarketplaceOffer,
  MarketplaceOfferState,
  MarketplaceOrder,
  MarketplaceOrderStatus,
  MarketplaceStoreState,
} from 'fireux-marketplace/runtime/models/marketplace.model'

definePageMeta({ layout: 'marketplace' })
const { copy, locale } = useInterlakenCopy()
const marketplace = useMarketplaceClient()
const storeId = useRouteParam('storeId')
const store = ref<ManagedMarketplaceStore>()
const orders = ref<MarketplaceOrder[]>([])
const state = ref<'loading' | 'idle' | 'saving' | 'error'>('loading')
const message = ref('')
const offerPrices = reactive<Record<string, string>>({})
const storeForm = reactive({
  name: '',
  description: '',
  locality: '',
  postcode: '',
  sections: [] as string[],
  methods: [] as MarketplaceFulfilmentMethod[],
})
const offerForm = reactive({
  title: '',
  description: '',
  unit: '',
  price: '',
})

function fillStoreForm() {
  if (!store.value) return
  storeForm.name = store.value.name
  storeForm.description = store.value.description
  storeForm.locality = store.value.locality.label
  storeForm.postcode = store.value.locality.postal_code
  storeForm.sections = [...store.value.section_ids]
  storeForm.methods = [...store.value.fulfilment_methods]
  for (const offer of store.value.offers) {
    offerPrices[offer.id] = offer.price
      ? (offer.price.amount_minor / 100).toFixed(2)
      : ''
  }
}

async function load() {
  state.value = 'loading'
  message.value = ''
  try {
    store.value = (await marketplace.managedStore(storeId.value)).store
    orders.value = (
      await marketplace.orders('seller', storeId.value)
    ).items
    fillStoreForm()
    state.value = 'idle'
  } catch {
    state.value = 'error'
    message.value = copy('market_generic_error')
  }
}

function chf(value: string) {
  const normalized = value.trim().replace(',', '.')
  if (!normalized) return null
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) {
    throw new Error('Invalid CHF price')
  }
  return {
    amount_minor: Math.round(Number(normalized) * 100),
    currency_code: 'CHF',
  }
}

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

function offerStateLabel(state: MarketplaceOfferState) {
  return copy(`market_offer_${state}` as
    | 'market_offer_draft'
    | 'market_offer_published'
    | 'market_offer_unavailable'
    | 'market_offer_archived')
}

async function saveStore() {
  if (!store.value || !storeForm.methods.length) return
  state.value = 'saving'
  try {
    await marketplace.patchStore(store.value.id, {
      name: storeForm.name.trim(),
      description: storeForm.description.trim(),
      locality: {
        label: storeForm.locality.trim(),
        postal_code: storeForm.postcode.trim(),
      },
      section_ids: storeForm.sections,
      ...(
        store.value.publication_state !== 'published'
          ? { fulfilment_methods: storeForm.methods }
          : {}
      ),
    })
    message.value = copy('market_store_saved')
    await load()
  } catch {
    state.value = 'error'
    message.value = copy('market_generic_error')
  }
}

async function submitStore() {
  if (!store.value) return
  state.value = 'saving'
  try {
    await marketplace.submitStore(store.value.id)
    await load()
  } catch {
    state.value = 'error'
    message.value = copy('market_generic_error')
  }
}

async function addOffer() {
  if (!store.value) return
  state.value = 'saving'
  try {
    await marketplace.createOffer(store.value.id, {
      title: offerForm.title.trim(),
      description: offerForm.description.trim(),
      unit_label: offerForm.unit.trim(),
      price: chf(offerForm.price),
      section_ids: store.value.section_ids,
      fulfilment_methods: store.value.fulfilment_methods,
    })
    Object.assign(offerForm, {
      title: '',
      description: '',
      unit: '',
      price: '',
    })
    await load()
  } catch {
    state.value = 'error'
    message.value = copy('market_generic_error')
  }
}

async function saveOfferPrice(offer: MarketplaceOffer) {
  if (!store.value) return
  state.value = 'saving'
  try {
    await marketplace.patchOffer(store.value.id, offer.id, {
      price: chf(offerPrices[offer.id] || ''),
    })
    await load()
  } catch {
    state.value = 'error'
    message.value = copy('market_generic_error')
  }
}

async function transitionOffer(
  offerId: string,
  next: MarketplaceOfferState
) {
  if (!store.value) return
  state.value = 'saving'
  try {
    await marketplace.transitionOffer(store.value.id, offerId, next)
    await load()
  } catch {
    state.value = 'error'
    message.value = copy('market_generic_error')
  }
}

async function transitionOrder(
  orderId: string,
  next: MarketplaceOrderStatus
) {
  state.value = 'saving'
  try {
    await marketplace.transitionOrder(orderId, next)
    await load()
  } catch {
    state.value = 'error'
    message.value = copy('market_generic_error')
  }
}

onMounted(load)
</script>
