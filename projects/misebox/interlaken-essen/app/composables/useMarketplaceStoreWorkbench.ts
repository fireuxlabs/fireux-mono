import { onMounted, reactive, ref } from 'vue'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { useInterlakenCopy } from '@/composables/useInterlakenCopy'
import { marketSections } from '@/content/market-sections'
import type {
  ManagedMarketplaceStore,
} from 'fireux-marketplace/runtime/marketplace-store/models/marketplace-api.model'
import type {
  MarketplaceFulfilmentMethod,
  MarketplaceOffer,
  MarketplaceOfferState,
  MarketplaceOrder,
  MarketplaceOrderStatus,
  MarketplaceStoreState,
} from 'fireux-marketplace/runtime/marketplace-store/models/marketplace.model'

export function useMarketplaceStoreWorkbench() {
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

  return {
    addOffer,
    copy,
    formatMoney,
    marketSections,
    message,
    offerForm,
    offerPrices,
    offerStateLabel,
    orderStatusLabel,
    orders,
    saveOfferPrice,
    saveStore,
    state,
    store,
    storeForm,
    storeStateLabel,
    submitStore,
    transitionOffer,
    transitionOrder,
  }
}
