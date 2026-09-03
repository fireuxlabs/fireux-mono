<template>
  <main class="min-h-screen bg-muted/30 py-10">
    <UContainer class="max-w-7xl space-y-8">
      <UButton
        to="/ordering"
        color="neutral"
        variant="soft"
        icon="i-lucide-arrow-left"
      >
        Ordering
      </UButton>

      <section
        class="rounded-lg border border-default bg-default p-5 shadow-sm"
      >
        <div class="mb-5">
          <p class="fx-type-label">Guest funnel screens</p>
          <h2
            class="fx-type-section-title mt-1 text-2xl font-black tracking-tight"
          >
            Build the order in order
          </h2>
        </div>

        <OrderingObjectShape
          class="mb-5"
          title="starting context + draft"
          :data="collectionShapeTrack.start"
        />

        <OrderingCollectionFunnelScreens
          v-model:allergen-accepted="allergenAccepted"
          :class-name="themeClassName"
          :funnel="collectionFunnel"
          :kitchen-intake="collectionShapeTrack.withSubmission"
          :kitchen-receiving="collectionShapeTrack.kitchen"
          :order="collectionOrder"
          :state="collectionRequest"
          :style-vars="themeStyleVars"
        />
      </section>
    </UContainer>
  </main>
</template>

<script setup lang="ts">
import { computed, reactive, watchEffect } from 'vue'
import { useCollectionFunnel } from 'fireux-kitchens/runtime/kitchen/composables/order/funnel/Collection/useCollectionFunnel'
import { useMenuThemeSurface } from 'fireux-kitchens/runtime/menu/composables/useMenuThemeSurface'
import { createOrderingFunnelShapeTrack } from '~/utils/orderingFunnelShapes'
import type {
  MenuOrderingBasketItem,
  MenuOrderingCollectionState,
  MenuOrderingFunnelController,
  MenuOrderingFunnelState,
  MenuOrderingIncoming,
  MenuOrderingProcessing,
  MenuOrderingSending,
} from 'fireux-kitchens/runtime/menu/models/menu-ordering.model'
import type { MenuServiceHoursConfig } from 'fireux-kitchens/runtime/menu/utils/menu'
import { resolveKitchenOrderPostPaymentStatus } from 'fireux-kitchens/runtime/kitchen/utils/order'

const basketItems: MenuOrderingBasketItem[] = [
  {
    id: 'pizza-margherita',
    lineId: 'pizza-margherita',
    name: 'Pizza Margherita',
    quantity: 1,
    unitPrice: 17,
  },
  {
    id: 'knoblauchbrot',
    lineId: 'knoblauchbrot',
    name: 'Knoblauchbrot',
    quantity: 2,
    unitPrice: 6.5,
  },
]
const basketQuantity = basketItems.reduce((sum, item) => sum + item.quantity, 0)
const basketTotal = basketItems.reduce(
  (sum, item) => sum + Number(item.unitPrice || 0) * item.quantity,
  0
)
const demoServiceHours: MenuServiceHoursConfig = {
  inherit_kitchen_operation_hours: false,
  operation_hours: {
    source: 'custom',
    timezone: 'Europe/Zurich',
    windows: [
      {
        days: [
          'monday',
          'tuesday',
          'wednesday',
          'thursday',
          'friday',
          'saturday',
          'sunday',
        ],
        open: '08:00',
        close: '23:00',
      },
    ],
  },
}
const collectionOrder: MenuOrderingFunnelState = {
  actionLabel: 'Open collection basket',
  accepted: false,
  awaitingAcceptance: false,
  currencyCode: 'CHF',
  channel: 'menu',
  panelOpen: true,
  items: basketItems,
  message: '',
  menuId: 'baeren-ringgenberg--food',
  kitchenSlug: 'baeren-ringgenberg',
  orderType: 'collection',
  pending: false,
  policy: {
    type: 'collection',
  },
  quantity: basketQuantity,
  serviceHours: demoServiceHours,
  selection: {
    items: basketItems,
    quantity: basketQuantity,
  },
}
const collectionIncoming = reactive<MenuOrderingIncoming>({
  order_type: 'collection',
  basket: basketItems.map((item) => ({
    item_id: item.id,
    line_id: item.lineId,
    name: item.name,
    quantity: item.quantity,
    unit_price_chf: item.unitPrice,
  })),
  allergen_checked: true,
  collection: {
    mode: 'queue',
  },
})
const currentCollection = computed<MenuOrderingCollectionState>(
  () =>
    collectionIncoming.collection || {
      mode: 'queue',
    }
)
const collectionShapeTrack = computed(() =>
  createOrderingFunnelShapeTrack({
    channel: 'menu',
    route: {
      menuId: 'baeren-ringgenberg--food',
      kitchenSlug: 'baeren-ringgenberg',
    },
    orderType: 'collection',
    modeLabel: 'collection',
    basket: {
      items: basketItems,
      quantity: basketQuantity,
    },
    mode: {
      collection: currentCollection.value,
    },
    submission: {
      id:
        currentCollection.value.mode === 'scheduled'
          ? 'demo-scheduled-collection-order'
          : 'demo-collection-order',
      kitchen_id: 'ChIJE-GP3-Kjj0cRzAv0WviwcsY',
      menu_id: 'food',
      order_number:
        currentCollection.value.mode === 'scheduled' ? 'C-105' : 'C-104',
    },
  })
)
const collectionProcessing = reactive<MenuOrderingProcessing>({
  exists: true,
  order_id: 'demo-collection-order',
  order_number: 'C-104',
  status: 'pending_acceptance',
  items: basketItems,
  total_chf: basketTotal,
  order: {
    id: 'demo-collection-order',
    order_number: 'C-104',
    order_type: 'collection',
    channel: 'menu',
    status: 'pending_acceptance',
    collection: {
      mode: 'queue',
    },
  },
})
const collectionSending = reactive<MenuOrderingSending>({
  endpoint: '/api/menus/baeren-ringgenberg--food/orders',
  body: {
    channel: 'menu',
    order_type: 'collection',
    items: basketItems.map((item) => ({
      item_id: item.id,
      quantity: item.quantity,
    })),
    collection: {
      mode: 'queue',
    },
  },
  pending: false,
  sent_order: collectionProcessing.order,
})
const collectionResumeStatus =
  resolveKitchenOrderPostPaymentStatus('collection')
const collectionPayment = reactive({
  pending: false,
  message: '',
  error: '',
})
const collectionFunnel: MenuOrderingFunnelController = {
  show: true,
  order: collectionOrder,
  incoming: collectionIncoming,
  processing: collectionProcessing,
  sending: collectionSending,
  payment: collectionPayment,
  collect: (payload) => {
    Object.assign(collectionIncoming, payload)
    if (payload.collection) {
      if (collectionProcessing.order) {
        collectionProcessing.order.collection = payload.collection
      }
      collectionSending.body.collection = payload.collection
    }
  },
  clear: () => {},
  close: () => {},
  open: () => {},
  pay: () => {
    if (collectionPayment.pending) return
    if (collectionProcessing.order?.payment?.status === 'paid') return

    collectionPayment.pending = true
    collectionPayment.message = 'Payment is in progress.'
    collectionPayment.error = ''
    collectionProcessing.status = 'pending_payment'
    if (collectionProcessing.order) {
      collectionProcessing.order.status = 'pending_payment'
      collectionProcessing.order.payment = {
        required: true,
        status: 'pending',
        method: 'online_card',
        amount_chf: basketTotal,
        currency_code: 'CHF',
        reason: 'Order payment',
        resume_status: collectionResumeStatus,
      }
    }

    const acceptPayment = () => {
      collectionPayment.pending = false
      collectionPayment.message = 'Payment accepted.'
      collectionProcessing.status = collectionResumeStatus
      if (!collectionProcessing.order) return

      collectionProcessing.order.status = collectionResumeStatus
      collectionProcessing.order.payment = {
        ...collectionProcessing.order.payment,
        required: true,
        status: 'paid',
        method: 'online_card',
        amount_chf: basketTotal,
        currency_code: 'CHF',
        reason: 'Order payment',
        resume_status: collectionResumeStatus,
        paid_at: new Date().toISOString(),
      }
    }

    if (!import.meta.client) {
      acceptPayment()
      return
    }

    window.setTimeout(acceptPayment, 1000)
  },
  submit: () => collectionProcessing.order,
}
const collectionRequest = useCollectionFunnel(
  () => collectionOrder,
  () => 3,
  () => collectionIncoming
)
const allergenAccepted = computed({
  get: () => Boolean(collectionIncoming.allergen_checked),
  set: (accepted: boolean) => {
    collectionFunnel.collect({
      allergen_checked: accepted,
    })
  },
})
const { className: themeClassName, styleVars: themeStyleVars } =
  useMenuThemeSurface({
    pageStyle: {
      background_color_light: '#F8FAFC',
      background_color_dark: '#111827',
      font_color_light: '#111827',
      font_color_dark: '#F8FAFC',
      title_color_light: '#111827',
      title_color_dark: '#F8FAFC',
      primary_color: '#0F766E',
      secondary_color: '#64748B',
    },
  })

watchEffect(() => {
  collectionFunnel.collect({
    collection: collectionRequest.collection.value,
  })
})

definePageMeta({
  layout: 'landing',
  name: 'MiseboxOrderingCollectionPage',
})

useSeoMeta({
  title: 'Collection Ordering · Misebox',
  description:
    'Misebox collection ordering model for funnel drafts, submitted kitchen tickets, and operator status strings.',
})
</script>
