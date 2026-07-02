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
      title="Basket"
    >
      <MenuDetailFunnelBasket :order="order" />
    </OrderingFunnelStage>

    <OrderingFunnelStage
      number="2"
      total="6"
      title="Allergy check"
    >
      <ClientOnly>
        <MenuDetailFunnelAllergen v-model="allergenAccepted" />
      </ClientOnly>
    </OrderingFunnelStage>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import 'fireux-kitchens/runtime/assets/styles/menu-detail.css'
import { useMenuThemeSurface } from 'fireux-kitchens/runtime/composables/fireux/menu/useMenuThemeSurface'
import type {
  MenuFoodItem,
  MenuFoodOrderItem,
} from 'fireux-kitchens/runtime/models/kitchen/menu/menu-food.model'
import type {
  MenuOrderingBasketItem,
  MenuOrderingFunnelState,
} from 'fireux-kitchens/runtime/models/kitchen/menu/menu-ordering.model'

const allergenAccepted = ref(false)
const {
  className: themeClassName,
  styleVars: themeStyleVars,
} = useMenuThemeSurface()
const demoItems: MenuFoodItem[] = [
  {
    id: 'pizza-margherita',
    dishId: 'pizza-margherita',
    name: 'Pizza Margherita',
    description: 'Tomato, mozzarella, oregano.',
    imageUrl: '',
    price: 13,
    priceLabel: '13',
    priceOptions: [],
    addOns: [],
  },
  {
    id: 'banana-colada',
    dishId: 'banana-colada',
    name: 'Banana Colada',
    description: 'Banana, coconut, pineapple.',
    imageUrl: '',
    price: 42,
    priceLabel: '42 / 60',
    priceOptions: [
      {
        id: '1-5-liter',
        label: '1.5 Liter',
        price: 42,
        priceLabel: '42',
      },
      {
        id: '2-5-liter',
        label: '2.5 Liter',
        price: 60,
        priceLabel: '60',
      },
    ],
    addOns: [],
  },
]
const demoQuantities = ref<Record<string, number>>({
  'pizza-margherita': 2,
  'banana-colada:2-5-liter': 1,
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
  actionLabel: 'Open delivery basket',
  accepted: false,
  awaitingAcceptance: false,
  panelOpen: true,
  items: basketItems.value,
  message: '',
  menuId: 'baeren-ringgenberg-delivery',
  kitchenSlug: 'baeren-ringgenberg',
  orderType: 'delivery',
  pending: false,
  quantity: basketQuantity.value,
  selection: {
    items: basketItems.value,
    quantity: basketQuantity.value,
  },
}))

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

  const [itemId, variantId] = lineId.split(':')
  const item = demoItems.find((entry) => entry.id === itemId)
  if (!item) return null

  const variant = item.priceOptions.find((entry) => entry.id === variantId)
  return {
    id: item.id,
    lineId,
    name: variant ? `${item.name} · ${variant.label}` : item.name,
    quantity,
    unitPrice: variant?.price || item.price,
  }
}

definePageMeta({
  layout: 'landing',
  name: 'MiseboxOrderingDeliveryPage',
})

useSeoMeta({
  title: 'Delivery Ordering Funnel · Misebox',
  description:
    'Screen 1 of the Misebox delivery ordering funnel: the customer basket.',
})
</script>
