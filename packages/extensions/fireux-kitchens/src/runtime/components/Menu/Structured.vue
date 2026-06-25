<template>
  <section class="structured-menu">
    <p v-if="pending" class="menu-state">
      Loading menu...
    </p>

    <p v-else-if="error" class="menu-state">
      Menu unavailable.
    </p>

    <article v-else-if="menu" class="menu">
      <MenuStructuredBaseLayer
        v-if="baseLayer"
        :view="baseLayer"
        @update:selected-choice="setSelectedChoice"
        @add="addToOrder"
        @remove="removeFromOrder"
      />

      <!-- Menu ordering spine: base menu stays readable; selection/funnel overlays it. See docs/concepts/menu-ordering.md. -->
      <MenuStructuredOrderOverlay
        v-if="isOrderMode && (basketQuantity || awaitingAcceptance)"
        :order="orderOverlay"
        @clear="clearOrder"
        @close-funnel="showOrderPanel = false"
        @open-funnel="showOrderPanel = true"
        @submit="placeOrder"
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
  </section>
</template>

<script setup lang="ts">
import { computed, ref, toValue, watch, type MaybeRefOrGetter } from 'vue'
import { useMenuOrderDraft } from '../../composables/fireux/public/menu/useMenuOrderDraft'
import { useMenuViewMode } from '../../composables/fireux/public/menu/useMenuViewMode'
import type { MenuManifest } from '../../composables/fireux/public/menu/useMenuManifest'
import { menuOrderBasketActionLabel } from '../../utils/menu-ordering-ui'
import type {
  MenuChoiceValue,
  MenuStructuredBaseLayerView,
  MenuStructuredOrderOverlayState,
} from './Structured/types'

const props = defineProps<{
  menu: MenuManifest | null
  menuId: MaybeRefOrGetter<string>
  kitchenSlug?: MaybeRefOrGetter<string | null | undefined>
  pending?: boolean
  error?: unknown
}>()

// Public menu detail spine: docs/concepts/family-menu.md. Structured menus split into content, behaviour, and presentation before ordering/fulfilment build on top.
const text = (value: unknown) => String(value ?? '').trim()
const menuStorageScope = computed(() => {
  const kitchenSlug = text(toValue(props.kitchenSlug))
  const menuId = text(toValue(props.menuId))

  return kitchenSlug ? `${kitchenSlug}:${menuId}` : menuId
})
const behaviour = computed(() => props.menu?.behaviour)
const {
  choiceOptions,
  selectedChoice,
  selectedOrderType,
  selectedOrderTypeConfig,
  canOrder,
  isOrderMode,
  orderNotice,
} = useMenuViewMode(
  behaviour,
  computed(() => `fireux:menu:${menuStorageScope.value}:view`)
)
const {
  items: orderItems,
  quantity: basketQuantity,
  awaitingAcceptance,
  quantities: orderQuantities,
  creatingItemId,
  message: orderMessage,
  error: orderError,
  add: addToOrder,
  remove: removeFromOrder,
  clear: clearOrder,
  place: placeOrder,
} = useMenuOrderDraft(props.menuId, {
  kitchenSlug: props.kitchenSlug,
  canOrder,
  orderType: selectedOrderType,
  storageKey: computed(() => `fireux:menu:${menuStorageScope.value}:order`),
})
const baseLayer = computed<MenuStructuredBaseLayerView | null>(() => {
  if (!props.menu) return null

  return {
    menu: props.menu,
    choices: choiceOptions.value,
    selectedChoice: selectedChoice.value,
    orderMode: isOrderMode.value,
    orderNotice: orderNotice.value,
    quantities: orderQuantities.value,
    dimmed: showOrderPanel.value,
  }
})
const orderOverlay = computed<MenuStructuredOrderOverlayState>(() => {
  const policy = selectedOrderTypeConfig.value

  return {
    actionLabel: menuOrderBasketActionLabel(selectedOrderType.value),
    awaitingAcceptance: awaitingAcceptance.value,
    funnelOpen: showOrderPanel.value,
    items: orderItems.value,
    message: orderMessage.value,
    menuId: text(toValue(props.menuId)),
    kitchenSlug: text(toValue(props.kitchenSlug)),
    orderType: selectedOrderType.value,
    pending: creatingItemId.value === 'order',
    ...(policy ? { policy } : {}),
    quantity: basketQuantity.value,
    selection: {
      items: orderItems.value,
      quantity: basketQuantity.value,
    },
  }
})
const showOrderPanel = ref(false)

function setSelectedChoice(value: MenuChoiceValue) {
  selectedChoice.value = value
}

watch([selectedOrderType, basketQuantity], () => {
  showOrderPanel.value = false
})
</script>

<style scoped>
.structured-menu {
  display: grid;
  gap: clamp(1rem, 3vw, 2rem);
  color: var(--menu-text);
  text-align: center;
}

.menu {
  display: grid;
  gap: clamp(2rem, 4vw, 3rem);
}

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
