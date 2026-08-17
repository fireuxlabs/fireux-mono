<!-- Concurrent edit — 2026-07-22 11:58 CEST — Out-of-box Kiosk design: frame canonical ordering with generic Kitchen identity and ambient presentation. -->
<!-- Concurrent edit — 2026-07-22 12:20 CEST — Product Demo pass: expose the order layer as a scoped presentation seam while retaining the canonical lifecycle by default. -->
<!-- Concurrent edit — 2026-07-22 14:45 CEST — Demo Kiosk pass: support a fixed valid fulfilment type without changing the canonical route default. -->
<template>
  <section
    class="menu-order-kiosk"
    :class="`menu-order-kiosk--${stage}`"
    data-menu-kiosk-presentation="touch"
    :data-menu-kiosk-stage="stage"
    aria-label="Kiosk ordering"
  >
    <MenuOrderKioskStart
      v-if="!activeType"
      :backdrop-image-url="backdropImageUrl"
      :eat-in-card-image-url="eatInCardImageUrl"
      :menu-name="menuName"
      :options="options"
      :kitchen-name="kitchenName"
      :kitchen-tagline="kitchenTagline"
      :logo-image-url="logoImageUrl"
      :sections="sections"
      :takeaway-card-image-url="takeawayCardImageUrl"
      :wordmark-image-url="wordmarkImageUrl"
      @select="selectedType = $event"
    />

    <template v-else>
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
          :catalogue-background-image-url="catalogueBackgroundImageUrl"
          :currency-code="currencyCode"
          :kitchen-id="kitchenId"
          :kitchen-name="kitchenName"
          :kitchen-slug="kitchenSlug"
          :logo-image-url="logoImageUrl"
          :menu-id="menuId"
          :order-type="activeType"
          :scope-key="`${scopeKey}:${activeType}`"
          :sections="sections"
          :section-card-frame-image-url="sectionCardFrameImageUrl"
          :section-card-image-urls="sectionCardImageUrls"
          :source-menu-id="sourceMenuId"
          @restart="clearSelection"
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
  backdropImageUrl?: string
  catalogueBackgroundImageUrl?: string
  configs: MenuOrderTypeConfig[]
  currencyCode: string
  eatInCardImageUrl?: string
  fixedOrderType?: MenuOrderKioskType
  kitchenId: string
  kitchenName?: string
  kitchenTagline?: string
  kitchenSlug?: string
  logoImageUrl?: string
  menuId: string
  menuName: string
  scopeKey: string
  sections: MenuManifestSection[]
  sectionCardFrameImageUrl?: string
  sectionCardImageUrls?: Record<string, string>
  sourceMenuId: string
  takeawayCardImageUrl?: string
  wordmarkImageUrl?: string
}>()

const selectedType = ref<MenuOrderKioskType | null>(null)
const stage = computed(() => activeType.value ? 'order' : 'mode')
const options = computed(() => props.configs.flatMap((config) => {
  if (config.type !== 'eat_in' && config.type !== 'takeaway') return []

  return [{
    type: config.type,
    label: config.type === 'eat_in' ? 'Eat here' : 'Take away',
    icon: config.type === 'eat_in' ? 'i-lucide-armchair' : 'i-lucide-shopping-bag',
    description: config.type === 'eat_in'
      ? 'We’ll bring it to your table'
      : 'Collect your order at the counter',
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
  grid-template-rows: minmax(0, 1fr);
}
</style>
