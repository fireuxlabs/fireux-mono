<template>
  <div class="min-h-screen bg-muted/30">
    <section class="border-b border-default bg-default/80 py-16 md:py-24">
      <UContainer class="space-y-6">
        <UBadge color="primary" variant="soft">
          Misebox ordering
        </UBadge>

        <div class="max-w-4xl space-y-4">
          <p class="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            {{ content.eyebrow }}
          </p>
          <h1 class="text-5xl font-black tracking-tighter text-highlighted md:text-7xl">
            {{ content.title }}
          </h1>
          <p class="text-lg leading-8 text-muted md:text-xl">
            {{ content.intro }}
          </p>
        </div>

        <div class="flex flex-wrap gap-3">
          <UButton
            to="/ordering"
            color="neutral"
            variant="soft"
            icon="i-lucide-arrow-left"
          >
            Ordering
          </UButton>
          <UButton
            :to="content.primaryTo"
            color="primary"
            icon="i-lucide-utensils"
          >
            {{ content.primaryLabel }}
          </UButton>
        </div>
      </UContainer>
    </section>

    <section class="py-8 md:py-14">
      <UContainer class="space-y-5">
        <UCard
          v-for="screen in screens"
          :key="screen.number"
          :ui="{ body: 'p-4 sm:p-6' }"
        >
          <div class="grid gap-6 lg:grid-cols-[0.8fr_1fr]">
            <div class="space-y-3">
              <p class="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                {{ screen.number }} of {{ screens.length }}
              </p>
              <h2 class="text-2xl font-black tracking-tight text-highlighted">
                {{ screen.title }}
              </h2>
              <p class="text-sm leading-6 text-muted md:text-base">
                {{ screen.body }}
              </p>
            </div>

            <div class="menu-detail rounded-3xl border border-default bg-muted/50 p-3 sm:p-5">
              <component
                :is="screen.component"
                v-if="screen.component"
                v-bind="screen.props"
              />

              <div v-else class="menu-order-dispatch">
                <section class="menu-order-dispatch__section">
                  <UIcon
                    :name="screen.icon || 'i-lucide-circle-dot'"
                    class="menu-order-dispatch__icon"
                    aria-hidden="true"
                  />

                  <div class="menu-order-dispatch__copy">
                    <strong>{{ screen.mockTitle }}</strong>
                    <span>{{ screen.mockBody }}</span>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </UCard>
      </UContainer>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, type Component } from 'vue'
import 'fireux-kitchens/runtime/assets/styles/menu-detail.css'
import type {
  MenuOrderingDeliveryState,
  MenuOrderingFunnelState,
} from 'fireux-kitchens/runtime/models/kitchen/menu/menu-ordering.model'
import { orderingScreenComponents } from '../../utils/orderingScreenRegistry'
import {
  orderingPageContent,
  type OrderingPageKey,
  type OrderingPageScreen,
  type OrderingPageScreenKind,
} from '../../utils/orderingPages'

type RenderedScreen = OrderingPageScreen & {
  number: number
  component?: Component
  props?: Record<string, unknown>
}

const props = defineProps<{
  flow: OrderingPageKey
}>()

const allergenAccepted = ref(true)
const ready = ref(false)
const delivery = ref<MenuOrderingDeliveryState>({
  ready: true,
  address: {
    input: 'Bachtalenweg 21, 3852 Ringgenberg',
    formatted: 'Bachtalenweg 21, 3852 Ringgenberg, Switzerland',
    postal_code: '3852',
    place_id: 'demo-delivery-address',
    lat: 46.700684,
    lng: 7.893843,
  },
})

const content = computed(() => orderingPageContent[props.flow])
const demoOrder = computed<MenuOrderingFunnelState>(() => {
  const orderType = orderTypeForFlow(props.flow)
  const items = [
    { id: 'pizza-margherita', name: 'Pizza Margherita', quantity: 2, unitPrice: 13 },
    { id: 'red-bull-dose', name: 'Red Bull (Dose)', quantity: 1, unitPrice: 5 },
  ]

  return {
    actionLabel: `Open ${props.flow} ordering flow`,
    accepted: false,
    awaitingAcceptance: false,
    panelOpen: true,
    items,
    message: '',
    menuId: 'baeren-ringgenberg-delivery',
    kitchenSlug: 'baeren-ringgenberg',
    orderType,
    pending: false,
    policy: {
      type: orderType,
      message: policyMessage(props.flow),
      fulfilment: {
        delivery_zones: orderType === 'delivery'
          ? [
              {
                id: 'zone-1',
                label: 'Ringgenberg & Goldswil',
                min_order_chf: 15,
                fee_chf: 0,
                postal_codes: ['3852'],
                color: '#ff7a32',
              },
            ]
          : [],
        payment_methods: ['online_card'],
      },
    },
    quantity: 3,
    selection: { items, quantity: 3 },
    sentOrder: {
      id: 'demo-order',
      order_number: 'DEMO',
      status: 'draft',
      order_type: orderType,
      fire_state: 'ready_to_fire',
      path: 'demo/orders/demo-order',
    },
  }
})

const screens = computed<RenderedScreen[]>(() =>
  content.value.screens.map((screen, index) => ({
    ...screen,
    number: index + 1,
    component: orderingScreenComponents[screen.kind],
    props: screenProps(screen.kind),
  }))
)

useSeoMeta({
  title: () => `${content.value.title} · Misebox`,
  description: () => content.value.intro,
})

function screenProps(kind: OrderingPageScreenKind) {
  if (kind === 'basket') return { order: demoOrder.value }
  if (kind === 'allergen') {
    return {
      modelValue: allergenAccepted.value,
      'onUpdate:modelValue': (value: boolean) => {
        allergenAccepted.value = value
      },
    }
  }
  if (kind === 'delivery-zone') {
    return {
      order: demoOrder.value,
      'onUpdate:ready': (value: boolean) => {
        ready.value = value
      },
      'onUpdate:delivery': (value: MenuOrderingDeliveryState) => {
        delivery.value = value
      },
    }
  }
  if (kind === 'delivery-fulfilment') {
    return {
      order: demoOrder.value,
      delivery: delivery.value,
    }
  }
  if (kind === 'collection-rendezvous' || kind === 'pre-order-details') {
    return {
      order: demoOrder.value,
      'onUpdate:ready': (value: boolean) => {
        ready.value = value
      },
    }
  }
  if (orderingScreenComponents[kind]) return { order: demoOrder.value }

  return {}
}

function policyMessage(flow: OrderingPageKey) {
  const orderType = orderTypeForFlow(flow)
  if (orderType === 'collection') return 'Collection timing is confirmed by the kitchen.'
  if (orderType === 'pre_order') return 'Pre-orders require kitchen acceptance before payment.'
  if (orderType === 'dine_in') return 'Dine-in orders route to the active service point.'
  if (orderType === 'room_service') return 'Room service routes to the kitchen and hotel runner.'
  return 'Delivery checks the address, zone, kitchen timing, and driver handoff.'
}

function orderTypeForFlow(flow: OrderingPageKey): MenuOrderingFunnelState['orderType'] {
  if (
    flow === 'collection' ||
    flow === 'takeaway-ordering' ||
    flow === 'click-and-collect' ||
    flow === 'curbside-pickup' ||
    flow === 'drive-thru' ||
    flow === 'dinner-boxes'
  ) {
    return 'collection'
  }
  if (
    flow === 'pre-order' ||
    flow === 'reservation-pre-order' ||
    flow === 'catering-orders' ||
    flow === 'private-event-orders' ||
    flow === 'tasting-menu' ||
    flow === 'airbnb-catering' ||
    flow === 'private-chef-for-airbnb' ||
    flow === 'meal-prep' ||
    flow === 'weekly-meal-prep' ||
    flow === 'mise-en-place-hampers' ||
    flow === 'holiday-rental-food-hampers'
  ) {
    return 'pre_order'
  }
  if (
    flow === 'dine-in' ||
    flow === 'table-ordering' ||
    flow === 'bar-tab' ||
    flow === 'counter-service' ||
    flow === 'kiosk-self-order'
  ) {
    return 'dine_in'
  }
  if (flow === 'room-service') return 'room_service'

  return 'delivery'
}
</script>
