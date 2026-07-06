<template>
  <main class="min-h-screen bg-muted/30 py-10">
    <UContainer class="max-w-6xl space-y-8">
      <UButton
        to="/ordering"
        color="neutral"
        variant="soft"
        icon="i-lucide-arrow-left"
      >
        Ordering
      </UButton>

      <section class="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <section class="rounded-lg border border-default bg-default p-5 shadow-sm">
          <div class="mb-5">
            <p class="text-xs font-bold uppercase tracking-[0.18em] text-muted">
              Guest funnel screens
            </p>
            <h2 class="mt-1 text-2xl font-black tracking-tight text-highlighted">
              Build the order in order
            </h2>
          </div>

          <div
            class="fireux-menu-detail collection-funnel-demo mb-4"
            :class="themeClassName"
            :style="themeStyleVars"
          >
            <OrderingFunnelStage
              number="1"
              total="6"
            >
              <MenuDetailFunnelBasket :order="collectionOrder" />
            </OrderingFunnelStage>

            <OrderingFunnelStage
              number="2"
              total="6"
            >
              <ClientOnly>
                <MenuDetailFunnelAllergen v-model="allergenAccepted" />
              </ClientOnly>
            </OrderingFunnelStage>

            <OrderingFunnelStage
              number="3"
              total="6"
            >
              <MenuDetailFunnelCollectionRequest :state="collectionRequest" />
            </OrderingFunnelStage>

            <OrderingFunnelStage
              number="4"
              total="6"
            >
              <MenuDetailFunnelCollectionKitchen :funnel="collectionFunnel" />
            </OrderingFunnelStage>

            <OrderingFunnelStage
              number="5"
              total="6"
            >
              <MenuDetailFunnelPayment :funnel="collectionFunnel" />
            </OrderingFunnelStage>

            <OrderingFunnelStage
              number="6"
              total="6"
            >
              <MenuDetailFunnelConfirmation :funnel="collectionFunnel" />
            </OrderingFunnelStage>
          </div>
        </section>

        <section class="rounded-lg border border-default bg-default p-5 shadow-sm">
          <div class="mb-5">
            <p class="text-xs font-bold uppercase tracking-[0.18em] text-muted">
              Kitchen screens
            </p>
            <h2 class="mt-1 text-2xl font-black tracking-tight text-highlighted">
              Manage the ticket in order
            </h2>
          </div>

          <div class="space-y-3">
            <article
              v-for="screen in kitchenScreens"
              :key="screen.label"
              class="grid gap-3 rounded-md border border-default p-4 sm:grid-cols-[auto_1fr_auto] sm:items-center"
            >
              <span class="flex size-8 items-center justify-center rounded-full bg-primary/10 text-sm font-black text-primary">
                {{ screen.step }}
              </span>
              <div>
                <div class="flex flex-wrap items-center gap-2">
                  <h3 class="font-bold text-highlighted">
                    {{ screen.label }}
                  </h3>
                  <UBadge
                    :color="screen.color"
                    variant="soft"
                  >
                    {{ screen.status }}
                  </UBadge>
                </div>
                <p class="text-sm leading-6 text-muted">
                  {{ screen.detail }}
                </p>
              </div>
              <UBadge
                color="neutral"
                variant="soft"
              >
                {{ screen.lane }}
              </UBadge>
            </article>
          </div>
        </section>
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
import type {
  MenuOrderingBasketItem,
  MenuOrderingFunnelController,
  MenuOrderingFunnelState,
  MenuOrderingIncoming,
  MenuOrderingProcessing,
  MenuOrderingSending,
} from 'fireux-kitchens/runtime/models/kitchen/menu/menu-ordering.model'

type KitchenState = {
  step: number
  label: string
  detail: string
  status: string
  color: 'primary' | 'success' | 'warning' | 'neutral'
  lane: string
}

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

const kitchenScreens: KitchenState[] = [
  {
    step: 1,
    label: 'No kitchen screen yet',
    status: 'funneling',
    detail: 'Guest is still building the order. Keep it away from the kitchen board.',
    color: 'neutral',
    lane: 'hidden',
  },
  {
    step: 2,
    label: 'Incoming ticket',
    status: 'new',
    detail: 'Ticket has been submitted and needs operator attention.',
    color: 'warning',
    lane: 'incoming',
  },
  {
    step: 3,
    label: 'Set pickup promise',
    status: 'accepted',
    detail: 'Operator owns the order and can give the pickup promise.',
    color: 'primary',
    lane: 'queue',
  },
  {
    step: 4,
    label: 'Prepare order',
    status: 'preparing',
    detail: 'Kitchen is actively making and packing the order.',
    color: 'primary',
    lane: 'queue',
  },
  {
    step: 5,
    label: 'Mark ready',
    status: 'ready',
    detail: 'Order waits at the pickup point.',
    color: 'success',
    lane: 'ready',
  },
  {
    step: 6,
    label: 'Complete pickup',
    status: 'completed',
    detail: 'Guest has collected the order.',
    color: 'neutral',
    lane: 'recent',
  },
]

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

<style scoped>
.collection-funnel-demo {
  width: 100%;
  min-height: 0;
  margin: 0;
  padding: 0;
  background: transparent;
  text-align: left;
}

.collection-funnel-demo :deep(.menu-order-card) {
  width: 100%;
  max-height: none;
  box-shadow: none;
}
</style>
