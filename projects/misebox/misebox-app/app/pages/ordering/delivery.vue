<template>
  <div class="fireux-menu-detail menu-detail public-menu--light">
    <section>
      <p>0 of 6</p>
      <h2>Menu interaction</h2>

      <MenuDetailSectionList
        :sections="demoSections"
        order-mode
        :quantities="demoQuantities"
        @add="noop"
        @remove="noop"
      />
    </section>

    <MenuDetailFunnelBasket :order="order" />
    <ClientOnly>
      <MenuDetailFunnelAllergen v-model="allergenAccepted" />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import 'fireux-kitchens/runtime/assets/styles/menu-detail.css'
import type {
  MenuFoodOrderItem,
  MenuFoodSection,
} from 'fireux-kitchens/runtime/models/kitchen/menu/menu-food.model'
import type { MenuOrderingFunnelState } from 'fireux-kitchens/runtime/models/kitchen/menu/menu-ordering.model'

const allergenAccepted = ref(false)
const demoSection: MenuFoodSection = {
  id: 'ordering-demo',
  label: 'Demo menu rows',
  items: [
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
      description: 'Choose a size before adding.',
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
  ],
}
const demoSections = [demoSection]
const demoQuantities = {
  'pizza-margherita': 2,
  'banana-colada:2-5-liter': 1,
}
const items = [
  { id: 'pizza-margherita', name: 'Pizza Margherita', quantity: 2, unitPrice: 13 },
  { id: 'red-bull-dose', name: 'Red Bull (Dose)', quantity: 1, unitPrice: 5 },
]
const order: MenuOrderingFunnelState = {
  actionLabel: 'Open delivery basket',
  accepted: false,
  awaitingAcceptance: false,
  panelOpen: true,
  items,
  message: '',
  menuId: 'baeren-ringgenberg-delivery',
  kitchenSlug: 'baeren-ringgenberg',
  orderType: 'delivery',
  pending: false,
  quantity: 3,
  selection: { items, quantity: 3 },
}

function noop(_item: MenuFoodOrderItem) {}

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
