<template>
  <div
    class="fireux-menu-detail menu-detail"
    :class="themeClassName"
    :style="themeStyleVars"
  >
    <OrderingFunnelStage>
      <MenuDetailItem
        v-for="item in demoItems"
        :key="item.id"
        :item="item"
        order-mode
        :quantities="demoQuantities"
        @add="addToBasket"
        @remove="removeFromBasket"
      />
    </OrderingFunnelStage>

    <OrderingFunnelStage
      v-if="basketQuantity"
      number="1"
      total="6"
    >
      <MenuDetailFunnelBasket :order="order" />
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
      <MenuDetailFunnelPreOrderDetails
        :order="order"
        @update:ready="preOrderReady = $event"
      />
    </OrderingFunnelStage>

    <OrderingFunnelStage
      number="4"
      total="6"
    >
      <MenuDetailFunnelPreOrderKitchen :order="order" />
    </OrderingFunnelStage>

    <OrderingFunnelShapeTrack :track="shapeTrack" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import 'fireux-kitchens/runtime/assets/styles/menu-detail.css'
import { useMenuThemeSurface } from 'fireux-kitchens/runtime/composables/fireux/menu/useMenuThemeSurface'
import { createOrderingFunnelShapeTrack } from '~/utils/orderingFunnelShapes'
import type {
  MenuFoodItem,
  MenuFoodOrderItem,
} from 'fireux-kitchens/runtime/models/kitchen/menu/menu-food.model'
import type {
  MenuOrderingBasketItem,
  MenuOrderingFunnelState,
} from 'fireux-kitchens/runtime/models/kitchen/menu/menu-ordering.model'

const allergenAccepted = ref(false)
const preOrderReady = ref(false)
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
const demoItems: MenuFoodItem[] = [
  {
    id: 'tortilla-de-patata',
    dishId: 'tortilla-de-patata',
    name: 'Tortilla de Patata',
    description: 'Die spanische Kartoffel-Omelette.',
    imageUrl: '',
    price: 9.5,
    priceLabel: '9.50 / 16 / 25',
    priceOptions: [
      {
        id: 'klein',
        label: 'Klein',
        price: 9.5,
        priceLabel: '9.50',
      },
      {
        id: 'mittel',
        label: 'Mittel',
        price: 16,
        priceLabel: '16',
      },
      {
        id: 'gross',
        label: 'Gross',
        price: 25,
        priceLabel: '25',
      },
    ],
    addOns: [],
  },
  {
    id: 'zorza-schwein-poulet',
    dishId: 'zorza-schwein-poulet',
    name: 'Zorza Schwein/Poulet',
    description: 'Marinierte Streifen auf Pommes allumettes und geröstete Paprika.',
    imageUrl: '',
    price: 27,
    priceLabel: '27',
    priceOptions: [],
    addOns: [
      {
        id: 'manchego',
        label: 'Manchego',
        price: 2.5,
        priceLabel: '2.50',
      },
      {
        id: 'spiegelei',
        label: 'Spiegelei',
        price: 2.5,
        priceLabel: '2.50',
      },
    ],
  },
]
const demoQuantities = ref<Record<string, number>>({
  'tortilla-de-patata:gross': 1,
  'zorza-schwein-poulet': 1,
})
const basketItems = computed<MenuOrderingBasketItem[]>(() =>
  Object.keys(demoQuantities.value)
    .map((lineId) => basketItemFromLine(lineId, demoQuantities.value[lineId] || 0))
    .filter((item): item is MenuOrderingBasketItem => Boolean(item))
)
const basketQuantity = computed(() =>
  basketItems.value.reduce((sum, item) => sum + item.quantity, 0)
)
const order = computed<MenuOrderingFunnelState>(() => ({
  actionLabel: 'Open pre-order basket',
  accepted: false,
  awaitingAcceptance: false,
  panelOpen: true,
  items: basketItems.value,
  message: '',
  menuId: 'la-tapberne-main',
  kitchenSlug: 'la-tapberne',
  orderType: 'pre_order',
  pending: false,
  policy: {
    type: 'pre_order',
    message: 'Pre-orders need 24 hours notice and kitchen acceptance.',
  },
  quantity: basketQuantity.value,
  selection: {
    items: basketItems.value,
    quantity: basketQuantity.value,
  },
}))
const shapeTrack = computed(() =>
  createOrderingFunnelShapeTrack({
    route: {
      menuId: 'la-tapberne-main',
      kitchenSlug: 'la-tapberne',
    },
    orderType: 'pre_order',
    modeLabel: 'preOrder',
    basket: {
      items: basketItems.value,
      quantity: basketQuantity.value,
    },
    mode: {
      preOrder: {
        requested_for: '2026-07-08T18:30:00+02:00',
        notice_hours: 24,
      },
    },
    submission: {
      id: 'demo-pre-order',
      kitchen_id: 'ChIJ08WSgYSjj0cRD6oE3RwUFk0',
      menu_id: 'main',
      order_number: 'P-104',
    },
  })
)

function addToBasket(item: MenuFoodOrderItem) {
  setQuantity(item.lineId, (demoQuantities.value[item.lineId] || 0) + 1)
}

function removeFromBasket(item: MenuFoodOrderItem) {
  setQuantity(item.lineId, Math.max(0, (demoQuantities.value[item.lineId] || 0) - 1))
}

function setQuantity(lineId: string, quantity: number) {
  const next = { ...demoQuantities.value }
  if (quantity > 0) {
    next[lineId] = quantity
  } else {
    delete next[lineId]
  }
  demoQuantities.value = next
}

function basketItemFromLine(
  lineId: string,
  quantity: number
): MenuOrderingBasketItem | null {
  if (quantity <= 0) return null

  const [itemId, variantId, ...addOnIds] = lineId.split(':')
  const item = demoItems.find((entry) => entry.id === itemId)
  if (!item) return null

  const variant = item.priceOptions.find((entry) => entry.id === variantId)
  const addOns = addOnIds
    .map((id) => item.addOns.find((entry) => entry.id === id))
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
  const addOnTotal = addOns.reduce((sum, addOn) => sum + addOn.price, 0)
  const addOnLabel = addOns.length
    ? ` + ${addOns.map((addOn) => addOn.label).join(', ')}`
    : ''

  return {
    id: item.id,
    lineId,
    name: `${item.name}${variant ? ` · ${variant.label}` : ''}${addOnLabel}`,
    quantity,
    unitPrice: (variant?.price || item.price) + addOnTotal,
  }
}

definePageMeta({
  layout: 'landing',
  name: 'MiseboxOrderingPreOrderPage',
})

useSeoMeta({
  title: 'Pre-order Funnel · Misebox',
  description:
    'A La Tap Berne-style pre-order funnel walkthrough using reusable menu and funnel components.',
})
</script>
