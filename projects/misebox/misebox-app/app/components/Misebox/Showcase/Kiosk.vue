<!-- Concurrent edit — 2026-07-22 12:41 CEST — Product Demo app pass: project the featured Demo Kitchen into a local-only canonical Kiosk. -->
<template>
  <main
    class="showcase-kiosk"
    data-misebox-showcase="kiosk"
    data-showcase-data-source="demo-world"
  >
    <div class="showcase-kiosk__orientation">
      <UButton
        to="/demo"
        color="neutral"
        variant="solid"
        icon="i-lucide-arrow-left"
        aria-label="Return to all demos"
      >
        All demos
      </UButton>

      <UBadge color="neutral" variant="solid">
        Local preview
      </UBadge>
    </div>

    <article
      class="fireux-menu-detail menu-detail--kiosk showcase-kiosk__canvas"
      :class="themeClassName"
      :style="themeStyleVars"
    >
      <MenuOrderKioskFlow
        :configs="kioskConfigs"
        :currency-code="manifest.presentation.currencyCode"
        :kitchen-id="manifest.source.kitchenId"
        :kitchen-name="manifest.presentation.kitchenName"
        :kitchen-slug="manifest.source.kitchenSlug"
        :logo-image-url="manifest.presentation.kitchenLogoImageUrl"
        :menu-id="manifest.source.menuId"
        :menu-name="manifest.content.name"
        :scope-key="scopeKey"
        :sections="manifest.content.sections"
        :source-menu-id="manifest.source.menuId"
        :wordmark-image-url="manifest.presentation.kitchenWordmarkImageUrl"
      >
        <template #order="{ config, orderType, scopeKey: orderScopeKey }">
          <MiseboxShowcaseKioskOrder
            :key="orderScopeKey"
            :config="config"
            :currency-code="manifest.presentation.currencyCode"
            :next-order-number="nextOrderNumber"
            :order-type="orderType"
            :scope-key="orderScopeKey"
            :sections="manifest.content.sections"
            :source-menu-id="manifest.source.menuId"
          />
        </template>
      </MenuOrderKioskFlow>
    </article>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useMenuThemeSurface } from 'fireux-kitchens/runtime/composables/fireux/menu/useMenuThemeSurface'
import type { MenuManifest } from 'fireux-kitchens/runtime/models/kitchen/menu/menu-detail.model'

const props = defineProps<{
  manifest: MenuManifest
  nextOrderNumber: number
  scopeKey: string
}>()
const kioskConfigs = computed(() =>
  (props.manifest.behaviour.ordering?.order_types || []).filter(
    config => config.type === 'eat_in' || config.type === 'takeaway'
  )
)

const {
  className: themeClassName,
  styleVars: themeStyleVars,
} = useMenuThemeSurface({
  pageStyle: computed(() => props.manifest.presentation.pageStyle),
  colorMode: 'light',
  pageCanvas: true,
})
</script>

<style scoped>
.showcase-kiosk {
  position: relative;
  height: 100vh;
  height: 100svh;
  overflow: hidden;
  background: #000;
}

.showcase-kiosk__orientation {
  position: fixed;
  z-index: 80;
  top: max(calc(var(--spacing) * 3), env(safe-area-inset-top));
  right: max(calc(var(--spacing) * 3), env(safe-area-inset-right));
  left: max(calc(var(--spacing) * 3), env(safe-area-inset-left));
  display: flex;
  justify-content: space-between;
  gap: calc(var(--spacing) * 3);
  pointer-events: none;
}

.showcase-kiosk__orientation > * {
  pointer-events: auto;
  box-shadow: 0 0.4rem 1.5rem rgb(15 23 42 / 18%);
}

.showcase-kiosk__canvas {
  height: 100%;
}

.showcase-kiosk__canvas :deep(.menu-order-kiosk-start) {
  padding-top: max(calc(var(--spacing) * 22), env(safe-area-inset-top));
}

@media (max-width: 520px) {
  .showcase-kiosk__orientation :deep(.badge) {
    display: none;
  }
}
</style>
