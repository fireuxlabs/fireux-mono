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

      <section class="rounded-lg border border-default bg-default p-5 shadow-sm">
        <div class="mb-5">
          <p class="text-xs font-bold uppercase tracking-[0.18em] text-muted">
            Guest funnel screens
          </p>
          <h2 class="mt-1 text-2xl font-black tracking-tight text-highlighted">
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
import {
  computed,
  reactive,
  watchEffect,
} from 'vue'
import 'fireux-kitchens/runtime/assets/styles/menu-detail.css'
import { useCollection } from 'fireux-kitchens/runtime/composables/fireux/kitchen/order/funnel/Collection/useCollection'
import { useMenuThemeSurface } from 'fireux-kitchens/runtime/composables/fireux/menu/useMenuThemeSurface'
import { createOrderingFunnelShapeTrack } from '~/utils/orderingFunnelShapes'
import type {
  MenuOrderingBasketItem,
  MenuOrderingFunnelController,
  MenuOrderingFunnelState,
  MenuOrderingIncoming,
  MenuOrderingProcessing,
  MenuOrderingSending,
} from 'fireux-kitchens/runtime/models/kitchen/menu/menu-ordering.model'
import type { MenuServiceHoursConfig } from 'fireux-kitchens/runtime/models/kitchen/menu/menu.model'

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
const collectionShapeTrack = createOrderingFunnelShapeTrack({
  route: {
    menuId: 'pizza-snacks-drinks',
    kitchenSlug: 'baeren-ringgenberg',
  },
  orderType: 'collection',
  modeLabel: 'collection',
  basket: {
    items: basketItems,
    quantity: basketQuantity,
  },
  mode: {
    collection: {
      mode: 'queue',
    },
  },
  submission: {
    id: 'demo-collection-order',
    kitchen_id: 'ChIJE-GP3-Kjj0cRzAv0WviwcsY',
    menu_id: 'pizza-snacks-drinks',
    order_number: 'C-104',
  },
})
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
  panelOpen: true,
  items: basketItems,
  message: '',
  menuId: 'pizza-snacks-drinks',
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
const collectionProcessing = reactive<MenuOrderingProcessing>({
  exists: true,
  order_id: 'demo-collection-order',
  order_number: 'C-104',
  status: 'new',
  fire_state: 'held',
  items: basketItems,
  total_chf: basketTotal,
  order: {
    id: 'demo-collection-order',
    order_number: 'C-104',
    order_type: 'collection',
    status: 'new',
    collection: {
      mode: 'queue',
    },
  },
})
const collectionSending = reactive<MenuOrderingSending>({
  endpoint: '/api/menus/pizza-snacks-drinks/orders',
  body: {
    order_type: 'collection',
    items: basketItems.map((item) => ({
      itemId: item.id,
      quantity: item.quantity,
    })),
    collection: {
      mode: 'queue',
    },
  },
  pending: false,
  expected_result: {
    status: 'new',
    fire_state: 'held',
  },
  sent_order: collectionProcessing.order,
})
const collectionFunnel: MenuOrderingFunnelController = {
  show: true,
  order: collectionOrder,
  incoming: collectionIncoming,
  processing: collectionProcessing,
  sending: collectionSending,
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
  submit: () => collectionProcessing.order,
}
const collectionRequest = useCollection(
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
const {
  className: themeClassName,
  styleVars: themeStyleVars,
} = useMenuThemeSurface({
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
