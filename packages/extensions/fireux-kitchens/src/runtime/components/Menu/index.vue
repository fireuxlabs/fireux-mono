<template>
  <slot
    :menu="menu"
    :pending="pending"
    :error="error"
    :render-menu="renderMenu"
  >
    <MenuSource
      v-if="isSourceMenu && menu"
      :kitchen-name="menu.source?.kitchen_name"
      :menu="menu"
      :source-url="sourceUrl"
      :page-style="menu.page_style"
    />

    <MenuPublicShell v-else :page-style="renderMenu?.pageStyle">
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
import { computed } from 'vue'
import { useMenuManifest } from '../../composables/fireux/public/menu/useMenuManifest'
import { useMenuOrderDraft } from '../../composables/fireux/public/menu/useMenuOrderDraft'
import { useMenuPublicView } from '../../composables/fireux/public/menu/useMenuPublicView'

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
const isSourceMenu = computed(() => menu.value?.kind === 'doc')
const sourceUrl = computed(() => menu.value?.file?.url || '')

const {
  defaultOrderType,
  canOrder,
  viewModes,
  viewMode,
  isOrderMode,
  orderNotice,
} = useMenuPublicView(renderMenu)
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
} = useMenuOrderDraft(menuId, {
  kitchenSlug,
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
