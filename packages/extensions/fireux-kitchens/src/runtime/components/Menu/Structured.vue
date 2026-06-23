<template>
  <section class="structured-menu">
    <p v-if="pending" class="menu-state">
      Loading menu...
    </p>

    <p v-else-if="error" class="menu-state">
      Menu unavailable.
    </p>

    <article v-else-if="menu" class="menu">
      <MenuStructuredHeader
        v-model="viewMode"
        :menu="menu"
        :view-modes="viewModes"
      />

      <MenuStructuredSectionNav
        v-if="isOrderMode && menu.content.sections.length > 1"
        :sections="menu.content.sections"
      />

      <MenuStructuredSections
        :sections="menu.content.sections"
        :order-mode="isOrderMode"
        :quantities="orderQuantities"
        @add="addToOrder"
        @remove="removeFromOrder"
      />

      <MenuOrderBasket
        v-if="isOrderMode && basketQuantity"
        :quantity="basketQuantity"
        :items="orderItems"
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
  </section>
</template>

<script setup lang="ts">
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useMenuOrderDraft } from '../../composables/fireux/public/menu/useMenuOrderDraft'
import { useMenuView } from '../../composables/fireux/public/menu/useMenuView'
import type { MenuManifest } from '../../composables/fireux/public/menu/useMenuManifest'

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
  defaultOrderType,
  canOrder,
  viewModes,
  viewMode,
  isOrderMode,
} = useMenuView(
  behaviour,
  computed(() => `fireux:menu:${menuStorageScope.value}:view`)
)
const {
  items: orderItems,
  quantity: basketQuantity,
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
  orderType: defaultOrderType,
  storageKey: computed(() => `fireux:menu:${menuStorageScope.value}:order`),
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
