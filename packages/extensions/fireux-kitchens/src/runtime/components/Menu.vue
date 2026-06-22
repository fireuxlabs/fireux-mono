<template>
  <slot
    :menu="menu"
    :pending="pending"
    :error="error"
    :render-menu="renderMenu"
  >
    <MenuPublicShell :page-style="renderMenu?.pageStyle">
      <section class="menu-surface">
        <p v-if="pending" class="menu-state">
          Loading menu...
        </p>

        <p v-else-if="error" class="menu-state">
          Menu unavailable.
        </p>

        <article
          v-else-if="renderMenu"
          :class="['menu', { 'menu--order': isOrderMode }]"
        >
          <header class="menu__header">
            <p v-if="renderMenu.kitchenName" class="menu__eyebrow">
              {{ renderMenu.kitchenName }}
            </p>
            <h1>{{ renderMenu.name }}</h1>
            <p v-if="renderMenu.description" class="menu__description">
              {{ renderMenu.description }}
            </p>

            <MenuPublicModeToggle
              v-if="viewModes.length > 1"
              v-model="viewMode"
              :options="viewModes"
            />
          </header>

          <MenuPublicSectionNav
            v-if="isOrderMode && renderMenu.sections.length > 1"
            :sections="renderMenu.sections"
          />

          <MenuPublicOrderNotice
            v-if="isOrderMode && orderNotice"
            :message="orderNotice"
          />

          <MenuPublicManifestSections
            :sections="renderMenu.sections"
            :order-mode="isOrderMode"
            :quantities="orderQuantities"
            @add="addToOrder"
            @remove="removeFromOrder"
          />

          <MenuPublicOrderBasket
            v-if="isOrderMode && basketQuantity"
            :quantity="basketQuantity"
            :pending="creatingItemId === 'order'"
            @clear="clearOrder"
            @place="placeOrder"
          />

          <p
            v-if="orderMessage || orderError"
            class="menu-order-state"
            aria-live="polite"
          >
            {{ orderMessage || orderError }}
          </p>
        </article>

        <p v-else class="menu-state">
          Menu unavailable.
        </p>

        <DevJson
          title="Menu debug"
          context="Menu surface · Menu.vue"
          :data="debug"
        />
      </section>
    </MenuPublicShell>
  </slot>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { KitchenOrderType } from '../models/order.model'
import type { MenuPublicView } from '../models/menu/menu.model'
import { useMenuManifest } from '../composables/fireux/public/menu/useMenuManifest'
import { useMenuOrderCreate } from '../composables/fireux/public/menu/useMenuOrderCreate'

type RenderMenuItem = {
  id: string
  name: string
}

type OrderDraftItem = RenderMenuItem & {
  quantity: number
}

const props = defineProps<{
  menuId: string
  kitchenSlug?: string
}>()

const menuId = computed(() => props.menuId)
const kitchenSlug = computed(() => props.kitchenSlug)
const {
  menu,
  pending,
  error,
  renderMenu,
  debug,
} = useMenuManifest(menuId, { kitchenSlug })
const orderingModes = computed<KitchenOrderType[]>(() =>
  renderMenu.value?.orderingModes || []
)
const defaultOrderType = computed<KitchenOrderType>(() => {
  if (orderingModes.value.includes('dine_in')) return 'dine_in'

  return orderingModes.value[0] || 'dine_in'
})
const canOrder = computed(() =>
  Boolean(renderMenu.value?.orderingEnabled && orderingModes.value.length)
)
const viewModes = computed<MenuPublicView[]>(() => {
  const configured = renderMenu.value?.publicViews || []
  const fallback: MenuPublicView[] = canOrder.value
    ? ['classic', 'order']
    : ['classic']
  const modes = configured.length ? configured : fallback
  const supported = modes.filter((mode) => mode === 'classic' || canOrder.value)

  return supported.length ? supported : ['classic']
})
const viewMode = ref<MenuPublicView>('classic')
const isOrderMode = computed(() =>
  canOrder.value &&
    viewModes.value.includes('order') &&
    viewMode.value === 'order'
)
const orderNotice = computed(() => {
  if (defaultOrderType.value !== 'pre_order') return ''

  return 'For normal service, please order at the bar or at your table. This menu is for pre-orders only.'
})
const orderDraft = ref<Record<string, OrderDraftItem>>({})
const basketItems = computed<OrderDraftItem[]>(() =>
  Object.values(orderDraft.value)
)
const basketQuantity = computed(() =>
  basketItems.value.reduce((total, item) => total + item.quantity, 0)
)
const orderQuantities = computed(() =>
  basketItems.value.reduce<Record<string, number>>((map, item) => {
    map[item.id] = item.quantity
    return map
  }, {})
)
const {
  creatingItemId,
  message: orderMessage,
  error: orderError,
  createOrder,
} = useMenuOrderCreate(menuId, { kitchenSlug })

watch(
  viewModes,
  (modes) => {
    if (!modes.includes(viewMode.value)) {
      viewMode.value = modes[0] || 'classic'
    }
  },
  { immediate: true }
)

function addToOrder(item: RenderMenuItem) {
  if (!canOrder.value) return
  const current = orderDraft.value[item.id]
  orderDraft.value = {
    ...orderDraft.value,
    [item.id]: {
      id: item.id,
      name: item.name,
      quantity: (current?.quantity || 0) + 1,
    },
  }
}

function removeFromOrder(item: RenderMenuItem) {
  const current = orderDraft.value[item.id]
  if (!current) return

  const next = { ...orderDraft.value }
  if (current.quantity <= 1) {
    delete next[item.id]
  } else {
    next[item.id] = {
      ...current,
      quantity: current.quantity - 1,
    }
  }
  orderDraft.value = next
}

function clearOrder() {
  orderDraft.value = {}
}

async function placeOrder() {
  if (!canOrder.value || !basketItems.value.length) return

  const created = await createOrder({
    items: basketItems.value.map((item) => ({
      itemId: item.id,
      quantity: item.quantity,
    })),
    order_type: defaultOrderType.value,
  })
  if (created) clearOrder()
}
</script>

<style scoped>
.menu-surface {
  display: grid;
  gap: clamp(1rem, 3vw, 2rem);
  min-height: 100svh;
  padding: clamp(4.5rem, 8vw, 7rem) clamp(1.5rem, 5vw, 5rem) clamp(5rem, 8vw, 7rem);
  color: var(--menu-text);
  text-align: center;
}

.menu,
.menu__header {
  display: grid;
}

.menu {
  gap: clamp(2rem, 4vw, 3rem);
}

.menu__header {
  gap: 0.75rem;
  justify-items: center;
}

.menu__eyebrow {
  margin: 0;
  color: var(--menu-primary);
  font-size: 0.78rem;
  font-weight: 850;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.menu__header h1 {
  max-width: 11ch;
  margin: 0;
  color: var(--menu-title);
  font-family: var(--menu-title-font);
  font-size: clamp(3.5rem, 9vw, 7rem);
  font-weight: 900;
  letter-spacing: -0.08em;
  line-height: 0.86;
}

.menu__description,
.menu-state {
  margin: 0;
  color: var(--menu-muted);
  font-size: 0.95rem;
  font-weight: 700;
}

.menu-order-state {
  justify-self: center;
  margin: 0;
  color: var(--menu-muted);
  font-size: 0.95rem;
  font-weight: 800;
}
</style>
