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
          <p class="fx-type-label">
            Guest funnel screens
          </p>
          <h2 class="fx-type-section-title mt-1 text-2xl font-black tracking-tight">
            Pre-order compared with collection
          </h2>
        </div>

        <div class="mb-5 grid gap-4 lg:grid-cols-2">
          <OrderingObjectShape
            title="pre_order vs collection"
            :data="preOrderCollectionDiff"
          />

          <OrderingObjectShape
            title="starting context + draft"
            :data="preOrderShapeTrack.start"
          />
        </div>

        <OrderingPreOrderFunnelScreens
          v-model:allergen-accepted="allergenAccepted"
          :class-name="themeClassName"
          :funnel="preOrderFunnel"
          :kitchen-intake="preOrderShapeTrack.withSubmission"
          :kitchen-receiving="preOrderShapeTrack.kitchen"
          :order="preOrderOrder"
          :pre-order="preOrderDetails"
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
} from 'vue'
import { useMenuThemeSurface } from 'fireux-kitchens/runtime/composables/fireux/menu/useMenuThemeSurface'
import { createOrderingFunnelShapeTrack } from '~/utils/orderingFunnelShapes'
import type {
  MenuOrderingBasketItem,
  MenuOrderingFunnelController,
  MenuOrderingFunnelState,
  MenuOrderingIncoming,
  MenuOrderingOperatorPresence,
  MenuOrderingPreOrderState,
  MenuOrderingProcessing,
  MenuOrderingSending,
} from 'fireux-kitchens/runtime/models/kitchen/menu/menu-ordering.model'
import type { MenuOrderDepositPolicy } from 'fireux-kitchens/runtime/models/kitchen/menu/menu.model'
import { resolveKitchenOrderPostPaymentStatus } from 'fireux-kitchens/runtime/models/kitchen/order.model'

const basketItems: MenuOrderingBasketItem[] = [
  {
    id: 'tortilla-de-patata',
    lineId: 'tortilla-de-patata:gross',
    name: 'Tortilla de Patata · Gross',
    quantity: 1,
    unitPrice: 25,
  },
  {
    id: 'zorza-schwein-poulet',
    lineId: 'zorza-schwein-poulet',
    name: 'Zorza Schwein/Poulet',
    quantity: 1,
    unitPrice: 27,
  },
]
const basketQuantity = basketItems.reduce((sum, item) => sum + item.quantity, 0)
const basketTotal = basketItems.reduce(
  (sum, item) => sum + Number(item.unitPrice || 0) * item.quantity,
  0
)
const depositPolicy: MenuOrderDepositPolicy = {
  type: 'fixed_per_person',
  amount: 10,
  currency_code: 'CHF',
  label: 'Pre-order deposit',
}
const preOrderDetails: MenuOrderingPreOrderState = {
  requested_for: '2026-07-08T18:30:00+02:00',
  notice_hours: 24,
  party_size: 4,
}
const preOrderOperator: MenuOrderingOperatorPresence = {
  role: 'kitchen_operator',
  status: 'online',
}
const depositTotal = depositPolicy.amount * Math.max(1, preOrderDetails.party_size || 1)
const preOrderCollectionDiff = {
  same: [
    'basket',
    'allergen',
    'kitchen can accept or reject after any required payment',
    'one kitchen order shape',
  ],
  collection: {
    timing: 'queue or scheduled pickup',
    payment: 'configured online payment before kitchen acceptance',
    kitchen_receives: 'after required payment',
    mode_key: 'collection',
  },
  pre_order: {
    timing: 'requested_for is required',
    payment: 'deposit before kitchen acceptance',
    kitchen_receives: 'after the deposit is paid',
    mode_key: 'preOrder',
    needs: [
      'notice_hours',
      'party_size',
      'confirmation email',
    ],
  },
}
const preOrderOrder: MenuOrderingFunnelState = {
  actionLabel: 'Open pre-order basket',
  accepted: false,
  awaitingAcceptance: false,
  currencyCode: 'CHF',
  channel: 'menu',
  panelOpen: true,
  items: basketItems,
  message: '',
  menuId: 'la-tapberne-main',
  kitchenSlug: 'la-tapberne',
  orderType: 'pre_order',
  pending: false,
  policy: {
    type: 'pre_order',
    notice_hours: preOrderDetails.notice_hours,
    message: 'For large groups, we appreciate a pre-order. A kitchen operator needs to receive it at least 24 hours before you arrive.',
    fulfilment: {
      deposit: depositPolicy,
    },
  },
  quantity: basketQuantity,
  selection: {
    items: basketItems,
    quantity: basketQuantity,
  },
}
const preOrderIncoming = reactive<MenuOrderingIncoming>({
  order_type: 'pre_order',
  basket: basketItems.map((item) => ({
    item_id: item.id,
    line_id: item.lineId,
    name: item.name,
    quantity: item.quantity,
    unit_price_chf: item.unitPrice,
  })),
  allergen_checked: true,
  pre_order: preOrderDetails,
})
const preOrderPayment = {
  required: true,
  status: 'requires_payment' as const,
  method: 'deposit' as const,
  amount_chf: depositTotal,
  currency_code: 'CHF',
  reason: depositPolicy.label || 'Deposit',
  resume_status: resolveKitchenOrderPostPaymentStatus('pre_order'),
}
const preOrderShapeTrack = computed(() =>
  createOrderingFunnelShapeTrack({
    channel: 'menu',
    route: {
      menuId: 'la-tapberne-main',
      kitchenSlug: 'la-tapberne',
    },
    orderType: 'pre_order',
    modeLabel: 'preOrder',
    basket: {
      items: basketItems,
      quantity: basketQuantity,
    },
    mode: {
      preOrder: preOrderDetails,
    },
    payment: {
      ...preOrderPayment,
      status: preOrderProcessing.order?.payment?.status || preOrderPayment.status,
      paid_at: preOrderProcessing.order?.payment?.paid_at,
    },
    operator: preOrderOperator,
    submission: {
      id: 'demo-pre-order',
      kitchen_id: 'ChIJ08WSgYSjj0cRD6oE3RwUFk0',
      menu_id: 'main',
      order_number: 'P-104',
    },
  })
)
const preOrderProcessing = reactive<MenuOrderingProcessing>({
  exists: true,
  order_id: 'demo-pre-order',
  order_number: 'P-104',
  status: 'pending_payment',
  items: basketItems,
  total_chf: basketTotal,
  order: {
    id: 'demo-pre-order',
    order_number: 'P-104',
    order_type: 'pre_order',
    channel: 'menu',
    status: 'pending_payment',
    requested_for: preOrderDetails.requested_for,
    payment: preOrderPayment,
  },
})
const preOrderSending = reactive<MenuOrderingSending>({
  endpoint: '/api/menus/la-tapberne-main/orders',
  body: {
    channel: 'menu',
    order_type: 'pre_order',
    items: basketItems.map((item) => ({
      item_id: item.id,
      quantity: item.quantity,
    })),
    requested_for: preOrderDetails.requested_for,
    customer: {
      party_size: preOrderDetails.party_size,
    },
  },
  pending: false,
  sent_order: preOrderProcessing.order,
})
const preOrderPaymentState = reactive({
  pending: false,
  message: '',
  error: '',
})
const preOrderFunnel: MenuOrderingFunnelController = {
  show: true,
  order: preOrderOrder,
  incoming: preOrderIncoming,
  processing: preOrderProcessing,
  sending: preOrderSending,
  payment: preOrderPaymentState,
  collect: (payload) => {
    Object.assign(preOrderIncoming, payload)
  },
  clear: () => {},
  close: () => {},
  open: () => {},
  pay: () => {
    if (preOrderPaymentState.pending) return
    if (preOrderProcessing.order?.payment?.status === 'paid') return

    preOrderPaymentState.pending = true
    preOrderPaymentState.message = 'Deposit payment is in progress.'
    preOrderPaymentState.error = ''
    if (preOrderProcessing.order) {
      preOrderProcessing.order.status = 'pending_payment'
      preOrderProcessing.order.payment = {
        ...preOrderPayment,
        status: 'pending',
      }
    }

    const acceptDeposit = () => {
      preOrderPaymentState.pending = false
      preOrderPaymentState.message = 'Deposit accepted.'
      preOrderProcessing.status = 'pending_acceptance'
      if (!preOrderProcessing.order) return

      preOrderProcessing.order.status = 'pending_acceptance'
      preOrderProcessing.order.payment = {
        ...preOrderPayment,
        status: 'paid',
        paid_at: new Date().toISOString(),
      }
    }

    if (!import.meta.client) {
      acceptDeposit()
      return
    }

    window.setTimeout(acceptDeposit, 1000)
  },
  submit: () => preOrderProcessing.order,
}
const allergenAccepted = computed({
  get: () => Boolean(preOrderIncoming.allergen_checked),
  set: (accepted: boolean) => {
    preOrderFunnel.collect({
      allergen_checked: accepted,
    })
  },
})
const {
  className: themeClassName,
  styleVars: themeStyleVars,
} = useMenuThemeSurface({
  pageStyle: {
    background_color_light: '#F4E8D2',
    background_color_dark: '#171717',
    font_color_light: '#1F1A14',
    font_color_dark: '#F7F1E6',
    title_color_light: '#1F1A14',
    title_color_dark: '#F7F1E6',
    primary_color: '#9C2C18',
    secondary_color: '#E99F5E',
  },
})

definePageMeta({
  layout: 'landing',
  name: 'MiseboxOrderingPreOrderPage',
})

useSeoMeta({
  title: 'Pre-order Funnel · Misebox',
  description:
    'A pre-order funnel simulator showing the differences from collection ordering.',
})
</script>
