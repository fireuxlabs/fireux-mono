<!-- Concurrent edit — 2026-07-22 11:58 CEST — Out-of-box Kiosk design: frame canonical ordering with generic Kitchen identity and ambient presentation. -->
<!-- Concurrent edit — 2026-07-22 12:20 CEST — Product Demo pass: expose the order layer as a scoped presentation seam while retaining the canonical lifecycle by default. -->
<!-- Concurrent edit — 2026-07-22 14:45 CEST — Demo Kiosk pass: support a fixed valid fulfilment type without changing the canonical route default. -->
<template>
  <section
    class="menu-order-kiosk"
    :class="`menu-order-kiosk--${activeType ? 'order' : 'mode'}`"
    data-menu-kiosk-presentation="touch"
    :data-menu-kiosk-stage="activeType ? 'order' : 'mode'"
    aria-label="Kiosk ordering"
  >
    <MenuOrderKioskStart
      v-if="!activeType"
      :menu-name="menuName"
      :options="options"
      :kitchen-name="kitchenName"
      :logo-image-url="logoImageUrl"
      :wordmark-image-url="wordmarkImageUrl"
      @select="selectedType = $event"
    />

    <template v-else>
      <header class="menu-order-kiosk__toolbar">
        <button
          v-if="!fixedConfig"
          type="button"
          class="menu-order-kiosk__change"
          data-menu-action="change-kiosk-mode"
          @click="clearSelection"
        >
          <UIcon name="i-lucide-arrow-left" aria-hidden="true" />
          <span>Change</span>
        </button>
        <span v-else class="menu-order-kiosk__change-spacer" aria-hidden="true" />

        <span class="menu-order-kiosk__identity">
          <strong>{{ kitchenName || menuName }}</strong>
          <small v-if="kitchenName && menuName !== kitchenName">{{ menuName }}</small>
        </span>

        <span class="menu-order-kiosk__mode">
          {{ selectedLabel }}
        </span>
      </header>

      <slot
        name="order"
        :config="selectedConfig"
        :order-type="activeType"
        :restart="clearSelection"
        :scope-key="`${scopeKey}:${activeType}`"
      >
        <MenuOrderKioskOrderFlow
          :key="activeType"
          :config="selectedConfig"
          :currency-code="currencyCode"
          :kitchen-id="kitchenId"
          :kitchen-slug="kitchenSlug"
          :menu-id="menuId"
          :order-type="activeType"
          :scope-key="`${scopeKey}:${activeType}`"
          :sections="sections"
          :source-menu-id="sourceMenuId"
        />
      </slot>
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
  fixedOrderType?: MenuOrderKioskType
  kitchenId: string
  kitchenName?: string
  kitchenSlug?: string
  logoImageUrl?: string
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
const fixedConfig = computed(() => {
  if (!props.fixedOrderType) return null

  return props.configs.find(config =>
    config.type === props.fixedOrderType
    && config.availability?.paused !== true
  ) || null
})
const activeType = computed<MenuOrderKioskType | null>(() => {
  const fixedType = fixedConfig.value?.type
  if (fixedType === 'eat_in' || fixedType === 'takeaway') return fixedType

  return selectedType.value
})
const selectedConfig = computed(() => props.configs.find(
  config => config.type === activeType.value
) || null)
const selectedLabel = computed(() =>
  activeType.value === 'eat_in' ? 'Eat here' : 'Take away'
)

function clearSelection() {
  if (fixedConfig.value) return
  selectedType.value = null
}
</script>

<style scoped>
.menu-order-kiosk {
  isolation: isolate;
  position: relative;
  display: grid;
  height: 100%;
  min-height: 0;
  background: var(--menu-bg);
  color: var(--menu-text);
}

.menu-order-kiosk::before {
  position: absolute;
  z-index: -1;
  inset: 0;
  background:
    radial-gradient(circle at 14% 8%, color-mix(in srgb, var(--menu-primary) 13%, transparent) 0 14rem, transparent 38rem),
    radial-gradient(circle at 92% 88%, color-mix(in srgb, var(--menu-secondary) 10%, transparent) 0 12rem, transparent 34rem),
    repeating-linear-gradient(135deg, color-mix(in srgb, var(--menu-text) 2.6%, transparent) 0 1px, transparent 1px 9px);
  content: '';
  pointer-events: none;
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

.menu-order-kiosk__change-spacer {
  display: block;
}

.menu-order-kiosk__change:focus-visible {
  outline: 3px solid var(--menu-primary);
  outline-offset: 0.25rem;
}

.menu-order-kiosk__change :deep(.iconify) {
  width: 1.25rem;
  height: 1.25rem;
  flex: 0 0 auto;
}

.menu-order-kiosk__identity {
  display: grid;
  min-width: 0;
  justify-items: center;
  line-height: 1.05;
}

.menu-order-kiosk__identity strong,
.menu-order-kiosk__identity small {
  max-width: min(44vw, 28rem);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.menu-order-kiosk__identity strong {
  color: var(--menu-title);
  font-family: var(--menu-title-font);
  font-size: clamp(0.95rem, 1.7vw, 1.2rem);
  text-align: center;
}

.menu-order-kiosk__identity small {
  margin-top: 0.25rem;
  color: var(--menu-muted);
  font-size: 0.7rem;
  font-weight: var(--font-weight-bold);
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

  .menu-order-kiosk__change-spacer {
    width: 2.75rem;
  }
}
</style>
