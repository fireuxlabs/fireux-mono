<!-- Concurrent edit — 2026-07-22 11:45 CEST — MenuOrder naming spine: consume the renamed Kiosk order delta. -->
<template>
  <section
    class="menu-order-kiosk"
    :class="`menu-order-kiosk--${selectedType ? 'order' : 'mode'}`"
    data-menu-kiosk-presentation="touch"
    :data-menu-kiosk-stage="selectedType ? 'order' : 'mode'"
    aria-label="Kiosk ordering"
  >
    <MenuOrderKioskStart
      v-if="!selectedType"
      :menu-name="menuName"
      :options="options"
      :wordmark-image-url="wordmarkImageUrl"
      @select="selectedType = $event"
    />

    <template v-else>
      <header class="menu-order-kiosk__toolbar">
        <button
          type="button"
          class="menu-order-kiosk__change"
          data-menu-action="change-kiosk-mode"
          @click="selectedType = null"
        >
          <UIcon name="i-lucide-arrow-left" aria-hidden="true" />
          <span>Change</span>
        </button>

        <strong class="menu-order-kiosk__title">{{ menuName }}</strong>

        <span class="menu-order-kiosk__mode">
          {{ selectedLabel }}
        </span>
      </header>

      <MenuOrderKioskOrderFlow
        :key="selectedType"
        :config="selectedConfig"
        :currency-code="currencyCode"
        :kitchen-id="kitchenId"
        :kitchen-slug="kitchenSlug"
        :menu-id="menuId"
        :order-type="selectedType"
        :scope-key="`${scopeKey}:${selectedType}`"
        :sections="sections"
        :source-menu-id="sourceMenuId"
      />
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { MenuOrderTypeConfig } from '../../../models/kitchen/menu/menu.model'
import type { MenuManifestSection } from '../../../models/kitchen/menu/menu-detail.model'
import type { MenuOrderKioskType } from '../../../composables/fireux/menu/order/useMenuOrderKiosk'

const props = defineProps<{
  configs: MenuOrderTypeConfig[]
  currencyCode: string
  kitchenId: string
  kitchenSlug?: string
  menuId: string
  menuName: string
  scopeKey: string
  sections: MenuManifestSection[]
  sourceMenuId: string
  wordmarkImageUrl?: string
}>()

const selectedType = ref<MenuOrderKioskType | null>(null)
const options = computed(() => props.configs.flatMap((config) => {
  if (config.type !== 'eat_in' && config.type !== 'takeaway') return []

  return [{
    type: config.type,
    label: config.type === 'eat_in' ? 'Eat here' : 'Take away',
    icon: config.type === 'eat_in' ? 'i-lucide-utensils' : 'i-lucide-shopping-bag',
    paused: config.availability?.paused === true,
  }]
}))
const selectedConfig = computed(() => props.configs.find(
  config => config.type === selectedType.value
) || null)
const selectedLabel = computed(() =>
  selectedType.value === 'eat_in' ? 'Eat here' : 'Take away'
)
</script>

<style scoped>
.menu-order-kiosk {
  display: grid;
  height: 100%;
  min-height: 0;
  background: var(--menu-bg);
  color: var(--menu-text);
}

.menu-order-kiosk--order {
  grid-template-rows: auto minmax(0, 1fr);
}

.menu-order-kiosk__toolbar {
  display: grid;
  grid-template-columns: minmax(6rem, 1fr) auto minmax(6rem, 1fr);
  gap: 1rem;
  align-items: center;
  min-height: 4.5rem;
  padding:
    max(0.75rem, env(safe-area-inset-top))
    clamp(0.75rem, 2vw, 1.5rem)
    0.75rem;
  border-bottom: 1px solid color-mix(in srgb, var(--menu-text) 13%, transparent);
  background: var(--menu-bg);
}

.menu-order-kiosk__change {
  display: inline-flex;
  width: max-content;
  min-height: 2.75rem;
  align-items: center;
  gap: 0.55rem;
  padding: 0.55rem 0.75rem;
  border: 0;
  border-radius: var(--menu-radius-control);
  background: transparent;
  color: var(--menu-text);
  cursor: pointer;
  font: inherit;
  font-weight: var(--font-weight-extrabold);
}

.menu-order-kiosk__change:focus-visible {
  outline: 3px solid var(--menu-primary);
  outline-offset: 0.25rem;
}

.menu-order-kiosk__title {
  min-width: 0;
  overflow: hidden;
  color: var(--menu-title);
  font-size: 0.95rem;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.menu-order-kiosk__mode {
  justify-self: end;
  color: var(--menu-muted);
  font-size: 0.82rem;
  font-weight: var(--font-weight-bold);
  white-space: nowrap;
}

@media (max-width: 700px) {
  .menu-order-kiosk__toolbar {
    grid-template-columns: auto minmax(0, 1fr) auto;
    min-height: 4.5rem;
    padding-inline: 0.75rem;
  }

  .menu-order-kiosk__change span {
    display: none;
  }

  .menu-order-kiosk__change {
    width: 2.75rem;
    justify-content: center;
    padding: 0;
  }
}
</style>
