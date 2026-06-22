<template>
  <MenuThemeSurface :page-style="menu?.pageStyle">
    <section class="menu-surface">
      <p v-if="pending" class="menu-state">
        Loading menu...
      </p>

      <p v-else-if="error" class="menu-state">
        Menu unavailable.
      </p>

      <article
        v-else-if="menu"
        :class="['menu', { 'menu--order': isOrderMode }]"
      >
        <header class="menu__header">
          <p v-if="menu.kitchenName" class="menu__eyebrow">
            {{ menu.kitchenName }}
          </p>
          <h1>{{ menu.name }}</h1>
          <p v-if="menu.description" class="menu__description">
            {{ menu.description }}
          </p>

          <MenuStructuredViewToggle
            v-if="viewModes.length > 1"
            v-model="viewMode"
            :options="viewModes"
          />
        </header>

        <MenuStructuredSectionNav
          v-if="isOrderMode && menu.sections.length > 1"
          :sections="menu.sections"
        />

        <MenuOrderNotice
          v-if="isOrderMode && orderNotice"
          :message="orderNotice"
        />

        <MenuStructuredSections
          :sections="menu.sections"
          :order-mode="isOrderMode"
          :quantities="orderQuantities"
          @add="addToOrder"
          @remove="removeFromOrder"
        />

        <MenuOrderBasket
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
    </section>
  </MenuThemeSurface>
</template>

<script setup lang="ts">
import { computed, type MaybeRefOrGetter } from 'vue'
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

const source = computed(() => props.menu)
const {
  defaultOrderType,
  canOrder,
  viewModes,
  viewMode,
  isOrderMode,
  orderNotice,
} = useMenuView(source)
const {
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
})
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
