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
            Kiosk order
          </h2>
        </div>

        <OrderingObjectShape
          class="mb-5"
          title="starting context + draft"
          :data="screenShapes.start"
        />

        <div
          class="fireux-menu-detail mb-5 grid gap-4"
          :class="themeClassName"
          :style="themeStyleVars"
        >
          <article
            class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.9fr)]"
          >
            <OrderingFunnelStage number="1" order-type="kiosk" total="4">
              <MenuPreviewOrderBasket :order="kioskOrder" />
            </OrderingFunnelStage>

            <OrderingObjectShape title="basket" :data="screenShapes.basket" />
          </article>

          <article
            class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.9fr)]"
          >
            <OrderingFunnelStage number="2" order-type="kiosk" total="4">
              <ClientOnly>
                <MenuPreviewOrderAllergen v-model="allergenAccepted" />
              </ClientOnly>
            </OrderingFunnelStage>

            <OrderingObjectShape
              title="order + allergen"
              :data="screenShapes.withAllergen"
            />
          </article>

          <article
            class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.9fr)]"
          >
            <OrderingFunnelStage number="3" order-type="kiosk" total="4">
              <MenuPreviewOrderKiosk :funnel="kioskFunnel" :step="3" />
            </OrderingFunnelStage>

            <OrderingObjectShape
              title="order + allergen + kiosk"
              :data="screenShapes.withKiosk"
            />
          </article>

          <article
            class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.9fr)]"
          >
            <OrderingFunnelStage number="4" order-type="kiosk" total="4">
              <MenuPreviewOrderConfirmation :funnel="kioskFunnel" />
            </OrderingFunnelStage>

            <OrderingObjectShape
              title="order + allergen + kiosk + submission"
              :data="screenShapes.withSubmission"
            />
          </article>
        </div>

        <section class="grid gap-4 lg:grid-cols-[18rem_minmax(0,1fr)]">
          <div class="space-y-3">
            <h2 class="fx-type-card-heading font-black">Kitchen ticket</h2>

            <WorkspaceKitchenOrdersTicketPresentation :order="kioskTicket" />
          </div>

          <OrderingObjectShape
            title="order + allergen + kiosk + submission + given"
            :data="screenShapes.withGiven"
          />
        </section>
      </section>
    </UContainer>
  </main>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useMenuThemeSurface } from 'fireux-kitchens/runtime/menu/composables/useMenuThemeSurface'
import {
  KitchenOrderDefaults,
  type KitchenOrder,
} from 'fireux-kitchens/runtime/kitchen/utils/order'
import type { MenuOrderingBasketItem } from 'fireux-kitchens/runtime/menu/models/menu-order-draft.model'
import type {
  MenuOrderPreviewController,
  MenuOrderPreviewState,
  MenuOrderingIncoming,
  MenuOrderingProcessing,
  MenuOrderingSending,
} from 'fireux-kitchens/runtime/menu/models/menu-order-preview.model'

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
const receiptItems = basketItems.map((item) => ({
  id: item.id,
  label: item.name,
  quantity: item.quantity,
  unit_price_chf: item.unitPrice || 0,
  total_chf: Number(item.unitPrice || 0) * item.quantity,
}))
const kioskOrder: MenuOrderPreviewState = {
  actionLabel: 'Open kiosk basket',
  accepted: true,
  awaitingAcceptance: false,
  currencyCode: 'CHF',
  channel: 'kiosk',
  panelOpen: true,
  items: basketItems,
  message: '',
  menuId: 'baeren-ringgenberg--food',
  kitchenSlug: 'baeren-ringgenberg',
  orderType: 'takeaway',
  pending: false,
  policy: {
    kitchen_offering_id: 'service-counter',
    kitchen_offering_name: 'Counter service',
    type: 'takeaway',
  },
  quantity: basketQuantity,
  selection: {
    items: basketItems,
    quantity: basketQuantity,
  },
}
const kioskIncoming = reactive<MenuOrderingIncoming>({
  order_type: 'takeaway',
  basket: basketItems.map((item) => ({
    item_id: item.id,
    line_id: item.lineId,
    name: item.name,
    quantity: item.quantity,
    unit_price_chf: item.unitPrice,
  })),
  allergen_checked: true,
  customer: {
    name: 'Daniel',
  },
})
const kioskProcessing = reactive<MenuOrderingProcessing>({
  exists: true,
  order_id: 'demo-kiosk-order',
  order_number: 'K-104',
  status: 'ready',
  items: basketItems,
  total_chf: basketTotal,
  order: {
    id: 'demo-kiosk-order',
    order_number: 'K-104',
    kitchen_offering_id: 'service-counter',
    order_type: 'takeaway',
    channel: 'kiosk',
    status: 'ready',
    payment: {
      required: false,
      status: 'not_required',
      currency_code: 'CHF',
    },
    receipt: {
      id: 'demo-kiosk-order',
      order_number: 'K-104',
      kitchen_offering_id: 'service-counter',
      order_type: 'takeaway',
      channel: 'kiosk',
      status: 'ready',
      created_at: new Date().toISOString(),
      currency: 'CHF',
      subtotal_chf: basketTotal,
      total_chf: basketTotal,
      customer: {
        name: 'Daniel',
      },
      items: receiptItems,
      kitchen: {
        id: 'ChIJE-GP3-Kjj0cRzAv0WviwcsY',
      },
      menu: {
        id: 'food',
      },
    },
  },
})
const kioskSending = reactive<MenuOrderingSending>({
  endpoint: '/api/menus/baeren-ringgenberg--food/orders',
  body: {
    channel: 'kiosk',
    kitchen_offering_id: 'service-counter',
    order_type: 'takeaway',
    items: basketItems.map((item) => ({
      item_id: item.id,
      quantity: item.quantity,
    })),
    customer: {
      name: 'Daniel',
    },
  },
  pending: false,
  sent_order: kioskProcessing.order,
})
const kioskFunnel: MenuOrderPreviewController = {
  show: true,
  order: kioskOrder,
  incoming: kioskIncoming,
  processing: kioskProcessing,
  sending: kioskSending,
  payment: reactive({
    pending: false,
    message: '',
    error: '',
  }),
  collect: (payload) => {
    Object.assign(kioskIncoming, payload)
    if (payload.customer) {
      kioskSending.body.customer = payload.customer
      if (kioskProcessing.order?.receipt) {
        kioskProcessing.order.receipt.customer = payload.customer
      }
    }
  },
  clear: () => {},
  close: () => {},
  open: () => {},
  pay: () => {},
  submit: () => kioskProcessing.order,
}
const screenShapes = computed(() => {
  const basket = {
    items: basketItems,
    quantity: basketQuantity,
  }
  const withAllergen = {
    orderType: kioskOrder.orderType,
    basket,
    allergen: {
      checked: Boolean(kioskIncoming.allergen_checked),
    },
  }
  const withKiosk = {
    ...withAllergen,
    kiosk: {
      mode: kioskOrder.orderType,
      handoff: 'bag',
      queueArea: 'Counter',
    },
    customer: kioskIncoming.customer,
  }
  const withSubmission = {
    ...withKiosk,
    submission: {
      id: kioskProcessing.order_id,
      kitchen_id: 'ChIJE-GP3-Kjj0cRzAv0WviwcsY',
      menu_id: kioskOrder.menuId,
      order_number: kioskProcessing.order_number,
    },
  }

  return {
    start: {
      route: {
        menuId: kioskOrder.menuId,
        kitchenSlug: kioskOrder.kitchenSlug,
      },
      draft: {
        orderType: kioskOrder.orderType,
        basket: {
          items: [],
          quantity: 0,
        },
      },
    },
    basket,
    withAllergen,
    withKiosk,
    withSubmission,
    withGiven: {
      ...withSubmission,
      given: {
        status: 'ready',
        message: `${kioskIncoming.customer?.name || 'Guest'}, your order is ready. Please collect from the counter.`,
      },
    },
  }
})
const kioskTicket = computed<KitchenOrder>(() => ({
  ...KitchenOrderDefaults,
  id: kioskProcessing.order_id,
  kitchen_id: 'ChIJE-GP3-Kjj0cRzAv0WviwcsY',
  menu_id: kioskOrder.menuId,
  order_number: kioskProcessing.order_number,
  status: 'ready',
  order_type: kioskOrder.orderType,
  channel: 'kiosk',
  customer: kioskIncoming.customer || {},
  fulfilment_match: {
    type: 'counter',
    reference: kioskProcessing.order_number,
    handoff: 'bag',
  },
  items: basketItems.map((item, index) => ({
    id: `item-${index + 1}`,
    dish_id: item.id,
    label: item.name,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    checked: false,
  })),
  payment: {
    required: false,
    status: 'not_required',
    currency_code: 'CHF',
  },
}))
const allergenAccepted = computed({
  get: () => Boolean(kioskIncoming.allergen_checked),
  set: (accepted: boolean) => {
    kioskFunnel.collect({
      allergen_checked: accepted,
    })
  },
})
const { className: themeClassName, styleVars: themeStyleVars } =
  useMenuThemeSurface({
    theme: {
      palette: {
        canvas: '#F8FAFC',
        text: '#111827',
        accent: '#2563EB',
        accent_contrast: '#ffffff',
      },
    },
  })

definePageMeta({
  layout: 'landing',
  name: 'MiseboxOrderingKioskPage',
})

useSeoMeta({
  title: 'Kiosk Ordering · Misebox',
  description:
    'Misebox kiosk ordering for eat-in trays, takeaway bags, order names, and counter handoff.',
})
</script>
