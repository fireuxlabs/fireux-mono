<!-- Concurrent edit — 2026-07-22 12:41 CEST — Product Demo app pass: project the featured Demo Kitchen into a local-only canonical Kiosk. -->
<!-- Concurrent edit — 2026-07-22 13:48 CEST — Kiosk Demo selector pass: move preview controls outside the canvas and switch Demo Kitchens. -->
<!-- Concurrent edit — 2026-07-22 13:56 CEST — Kiosk theme contrast pass: separate refined dining and fast-food counter presentation. -->
<!-- Concurrent edit — 2026-07-22 14:45 CEST — Demo Kiosk entry pass: go straight to Eat here with a short catalogue reveal. -->
<template>
  <main
    class="showcase-kiosk"
    :class="`showcase-kiosk--${appearance}`"
    data-misebox-showcase="kiosk"
    data-showcase-data-source="demo-world"
    :data-demo-kitchen-id="kitchenId"
    :data-demo-kiosk-appearance="appearance"
  >
    <header
      class="showcase-kiosk__preview-toolbar"
      data-misebox-showcase="kiosk-toolbar"
    >
      <UButton
        to="/demo"
        color="neutral"
        variant="soft"
        icon="i-lucide-arrow-left"
        aria-label="Return to all demos"
      >
        All demos
      </UButton>

      <div class="showcase-kiosk__preview-status">
        <UBadge color="neutral" variant="soft">
          Local preview
        </UBadge>
        <small>No live orders are sent</small>
      </div>

      <div
        class="showcase-kiosk__kitchen-picker"
        role="group"
        aria-label="Demo Kitchen"
      >
        <span class="showcase-kiosk__kitchen-picker-label">Kitchen</span>
        <UButtonGroup class="showcase-kiosk__kitchen-options">
          <UButton
            v-for="kitchen in kitchens"
            :key="kitchen.id"
            size="sm"
            :color="kitchen.id === kitchenId ? 'primary' : 'neutral'"
            :variant="kitchen.id === kitchenId ? 'solid' : 'ghost'"
            :aria-pressed="kitchen.id === kitchenId"
            :data-demo-kitchen-option="kitchen.id"
            @click="$emit('update:kitchenId', kitchen.id)"
          >
            {{ kitchen.label }}
          </UButton>
        </UButtonGroup>
      </div>
    </header>

    <article
      class="fireux-menu-detail menu-detail--kiosk showcase-kiosk__canvas"
      :class="themeClassName"
      :style="themeStyleVars"
      data-misebox-showcase="kiosk-canvas"
      :aria-label="`${manifest.presentation.kitchenName} Kiosk preview`"
    >
      <MenuOrderKioskFlow
        :key="scopeKey"
        :configs="kioskConfigs"
        :currency-code="manifest.presentation.currencyCode"
        fixed-order-type="eat_in"
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

type DemoKitchenOption = {
  id: string
  label: string
  tagline: string
}

const props = defineProps<{
  appearance: 'refined' | 'counter'
  kitchenId: string
  kitchens: readonly DemoKitchenOption[]
  manifest: MenuManifest
  nextOrderNumber: number
  scopeKey: string
}>()

defineEmits<{
  (event: 'update:kitchenId', kitchenId: string): void
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
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  height: 100vh;
  height: 100svh;
  overflow: hidden;
  background: var(--ui-bg);
  color: var(--ui-text);
}

.showcase-kiosk__preview-toolbar {
  position: relative;
  z-index: 80;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: calc(var(--spacing) * 3);
  align-items: center;
  min-height: 4.25rem;
  padding:
    max(calc(var(--spacing) * 2), env(safe-area-inset-top))
    max(calc(var(--spacing) * 3), env(safe-area-inset-right))
    calc(var(--spacing) * 2)
    max(calc(var(--spacing) * 3), env(safe-area-inset-left));
  border-bottom: 1px solid var(--ui-border);
  background: var(--ui-bg);
  box-shadow: 0 0.45rem 1.6rem rgb(15 23 42 / 12%);
}

.showcase-kiosk__preview-status {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: calc(var(--spacing) * 2);
}

.showcase-kiosk__preview-status small {
  overflow: hidden;
  color: var(--ui-text-dimmed);
  font-size: 0.75rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.showcase-kiosk__kitchen-picker {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: calc(var(--spacing) * 2);
}

.showcase-kiosk__kitchen-picker-label {
  color: var(--ui-text-muted);
  font-size: 0.75rem;
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.showcase-kiosk__kitchen-options {
  min-width: 0;
}

.showcase-kiosk__canvas {
  min-height: 0;
  height: 100%;
  overflow: hidden;
}

.showcase-kiosk__canvas :deep(.menu-order-kiosk--order) {
  animation: showcase-kiosk-enter 420ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

.showcase-kiosk__canvas :deep(.menu-order-kiosk-catalogue__rail) {
  animation: showcase-kiosk-enter-rail 520ms 80ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

.showcase-kiosk__canvas :deep(.menu-order-kiosk-catalogue__content) {
  animation: showcase-kiosk-enter-content 560ms 120ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes showcase-kiosk-enter {
  from {
    opacity: 0;
    transform: scale(0.992);
  }
}

@keyframes showcase-kiosk-enter-rail {
  from {
    opacity: 0;
    transform: translateX(-1.25rem);
  }
}

@keyframes showcase-kiosk-enter-content {
  from {
    opacity: 0;
    transform: translateY(1.25rem);
  }
}

.showcase-kiosk--refined .showcase-kiosk__canvas {
  --menu-radius: 2.25rem;
  --menu-radius-control: 1.65rem;
}

.showcase-kiosk--refined .showcase-kiosk__kitchen-options :deep(button[aria-pressed='true']) {
  background: #61715c;
  color: #fffaf1;
}

.showcase-kiosk--refined :deep(.menu-order-kiosk::before) {
  background:
    radial-gradient(circle at 18% 12%, color-mix(in srgb, var(--menu-primary) 9%, transparent) 0 13rem, transparent 38rem),
    radial-gradient(circle at 88% 84%, color-mix(in srgb, var(--menu-secondary) 8%, transparent) 0 11rem, transparent 34rem),
    repeating-linear-gradient(105deg, color-mix(in srgb, var(--menu-text) 1.8%, transparent) 0 1px, transparent 1px 13px);
}

.showcase-kiosk--refined :deep(.menu-order-kiosk-start) {
  width: min(100%, 58rem);
  gap: clamp(3rem, 8vh, 6rem);
}

.showcase-kiosk--refined :deep(.menu-order-kiosk-start__identity h1) {
  font-size: clamp(2.25rem, 4vw, 3.75rem);
  font-weight: 600;
  letter-spacing: -0.035em;
}

.showcase-kiosk--refined :deep(.menu-order-kiosk-start__identity p) {
  font-family: var(--menu-font);
  font-size: 0.75rem;
  letter-spacing: 0.24em;
}

.showcase-kiosk--refined :deep(.menu-order-kiosk-start__prompt h2) {
  font-size: clamp(3.1rem, 6.5vw, 5.4rem);
  font-weight: 600;
  letter-spacing: -0.025em;
}

.showcase-kiosk--refined :deep(.menu-order-kiosk-start__options) {
  gap: clamp(1.5rem, 3vw, 2.25rem);
}

.showcase-kiosk--refined :deep(.menu-order-kiosk-start__option) {
  grid-template-columns: 1fr;
  justify-items: center;
  min-height: clamp(12rem, 22vh, 15rem);
  border-color: color-mix(in srgb, var(--menu-secondary) 32%, transparent);
  border-radius: 2.25rem;
  background: color-mix(in srgb, var(--menu-bg) 93%, var(--menu-secondary));
  text-align: center;
  box-shadow: 0 2rem 5rem color-mix(in srgb, var(--menu-text) 7%, transparent);
}

.showcase-kiosk--refined :deep(.menu-order-kiosk-start__option-icon) {
  width: 4.5rem;
  height: 4.5rem;
  border: 1px solid color-mix(in srgb, var(--menu-primary) 35%, transparent);
  background: transparent;
}

.showcase-kiosk--refined :deep(.menu-order-kiosk-start__option-copy) {
  justify-items: center;
}

.showcase-kiosk--refined :deep(.menu-order-kiosk-start__option-copy strong) {
  font-family: var(--menu-title-font);
  font-weight: 600;
}

.showcase-kiosk--refined :deep(.menu-order-kiosk__toolbar) {
  border-bottom-color: color-mix(in srgb, var(--menu-secondary) 24%, transparent);
  background: color-mix(in srgb, var(--menu-bg) 96%, var(--menu-secondary));
}

.showcase-kiosk--refined :deep(.menu-order-kiosk-catalogue__section--active) {
  border-radius: 9999px;
  background: var(--menu-secondary);
  box-shadow: none;
  color: var(--menu-bg);
}

.showcase-kiosk--refined :deep(.menu-order-kiosk-item) {
  border-color: color-mix(in srgb, var(--menu-secondary) 16%, transparent);
  border-radius: 1.75rem;
  box-shadow: 0 1.25rem 3.5rem color-mix(in srgb, var(--menu-text) 7%, transparent);
}

.showcase-kiosk--refined :deep(.menu-order-kiosk-item__add) {
  padding: 0.7rem 0.9rem;
  border: 0;
  border-radius: 9999px;
  background: var(--menu-primary);
  color: var(--menu-bg);
}

.showcase-kiosk--refined :deep(.menu-order-basket-summary) {
  border-color: color-mix(in srgb, var(--menu-secondary) 30%, transparent);
  background: color-mix(in srgb, var(--menu-bg) 90%, var(--menu-secondary));
  box-shadow: 0 1.5rem 4rem color-mix(in srgb, var(--menu-text) 12%, transparent);
}

.showcase-kiosk--counter .showcase-kiosk__canvas {
  --menu-radius: 0.35rem;
  --menu-radius-control: 0.25rem;
}

.showcase-kiosk--counter .showcase-kiosk__kitchen-options :deep(button[aria-pressed='true']) {
  background: #e93b1b;
  color: white;
  box-shadow: 0.2rem 0.2rem 0 #f8d238;
}

.showcase-kiosk--counter :deep(.menu-order-kiosk::before) {
  background:
    linear-gradient(45deg, color-mix(in srgb, var(--menu-text) 7%, transparent) 25%, transparent 25% 75%, color-mix(in srgb, var(--menu-text) 7%, transparent) 75%),
    linear-gradient(45deg, color-mix(in srgb, var(--menu-text) 7%, transparent) 25%, transparent 25% 75%, color-mix(in srgb, var(--menu-text) 7%, transparent) 75%);
  background-position: 0 0, 1.5rem 1.5rem;
  background-size: 3rem 3rem;
}

.showcase-kiosk--counter :deep(.menu-order-kiosk-start) {
  width: min(100%, 72rem);
  gap: clamp(2rem, 5vh, 3.5rem);
}

.showcase-kiosk--counter :deep(.menu-order-kiosk-start__identity h1) {
  font-size: clamp(2.4rem, 4.5vw, 4.25rem);
  font-weight: 700;
  letter-spacing: 0.035em;
  text-transform: uppercase;
  text-shadow: 0.08em 0.08em 0 var(--menu-primary);
}

.showcase-kiosk--counter :deep(.menu-order-kiosk-start__identity p) {
  padding: 0.35rem 0.8rem;
  background: var(--menu-secondary);
  color: var(--menu-bg);
  font-family: var(--menu-title-font);
  letter-spacing: 0.12em;
  transform: rotate(-1deg);
}

.showcase-kiosk--counter :deep(.menu-order-kiosk-start__prompt h2) {
  font-size: clamp(3.8rem, 8vw, 7rem);
  font-weight: 700;
  line-height: 0.88;
  letter-spacing: 0.01em;
  text-transform: uppercase;
  text-shadow: 0.07em 0.07em 0 var(--menu-primary);
}

.showcase-kiosk--counter :deep(.menu-order-kiosk-start__options) {
  gap: clamp(1.75rem, 3vw, 2.75rem);
}

.showcase-kiosk--counter :deep(.menu-order-kiosk-start__option) {
  min-height: clamp(9rem, 17vh, 12rem);
  border: 0.3rem solid var(--menu-secondary);
  border-radius: 0.3rem;
  background: color-mix(in srgb, var(--menu-bg) 22%, white);
  box-shadow: 0.7rem 0.7rem 0 var(--menu-secondary);
}

.showcase-kiosk--counter :deep(.menu-order-kiosk-start__option:hover),
.showcase-kiosk--counter :deep(.menu-order-kiosk-start__option:focus-visible) {
  border-color: var(--menu-secondary);
  background: color-mix(in srgb, var(--menu-bg) 12%, white);
  box-shadow: 0.95rem 0.95rem 0 var(--menu-secondary);
  transform: translate(-0.2rem, -0.2rem);
}

.showcase-kiosk--counter :deep(.menu-order-kiosk-start__option-icon) {
  border: 0.2rem solid var(--menu-secondary);
  border-radius: 0.25rem;
  background: var(--menu-primary);
  color: white;
  transform: rotate(-3deg);
}

.showcase-kiosk--counter :deep(.menu-order-kiosk-start__option-copy strong) {
  font-family: var(--menu-title-font);
  font-size: clamp(1.9rem, 3.5vw, 3rem);
  letter-spacing: 0.025em;
  text-transform: uppercase;
}

.showcase-kiosk--counter :deep(.menu-order-kiosk__toolbar) {
  border-bottom: 0.3rem solid var(--menu-primary);
  background: var(--menu-secondary);
}

.showcase-kiosk--counter :deep(.menu-order-kiosk__change),
.showcase-kiosk--counter :deep(.menu-order-kiosk__identity strong),
.showcase-kiosk--counter :deep(.menu-order-kiosk__identity small),
.showcase-kiosk--counter :deep(.menu-order-kiosk__mode) {
  color: var(--menu-bg);
}

.showcase-kiosk--counter :deep(.menu-order-kiosk-catalogue__rail) {
  border-right: 0.25rem solid var(--menu-secondary);
  background: transparent;
}

.showcase-kiosk--counter :deep(.menu-order-kiosk-catalogue__section) {
  font-family: var(--menu-title-font);
  letter-spacing: 0.035em;
  text-transform: uppercase;
}

.showcase-kiosk--counter :deep(.menu-order-kiosk-catalogue__section--active) {
  background: var(--menu-secondary);
  box-shadow: 0.3rem 0.3rem 0 var(--menu-primary);
  color: var(--menu-bg);
}

.showcase-kiosk--counter :deep(.menu-order-kiosk-catalogue__header h2) {
  font-size: clamp(2.5rem, 4.5vw, 4rem);
  letter-spacing: 0.02em;
  text-transform: uppercase;
  text-shadow: 0.06em 0.06em 0 var(--menu-primary);
}

.showcase-kiosk--counter :deep(.menu-order-kiosk-item) {
  border: 0.22rem solid var(--menu-secondary);
  border-radius: 0.25rem;
  background: color-mix(in srgb, var(--menu-bg) 20%, white);
  box-shadow: 0.55rem 0.55rem 0 var(--menu-secondary);
}

.showcase-kiosk--counter :deep(.menu-order-kiosk-item h3) {
  letter-spacing: 0.025em;
  text-transform: uppercase;
}

.showcase-kiosk--counter :deep(.menu-order-kiosk-item__variants button) {
  border: 0.12rem solid var(--menu-secondary);
  border-radius: 0.2rem;
}

.showcase-kiosk--counter :deep(.menu-order-kiosk-item__add) {
  padding: 0.75rem 0.9rem;
  border: 0.16rem solid var(--menu-secondary);
  border-radius: 0.2rem;
  background: var(--menu-primary);
  box-shadow: 0.2rem 0.2rem 0 var(--menu-secondary);
  color: white;
  font-family: var(--menu-title-font);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.showcase-kiosk--counter :deep(.menu-order-kiosk-item--without-media) {
  background:
    repeating-linear-gradient(-45deg, color-mix(in srgb, var(--menu-primary) 12%, transparent) 0 0.75rem, transparent 0.75rem 1.5rem),
    color-mix(in srgb, var(--menu-bg) 20%, white);
}

.showcase-kiosk--counter :deep(.menu-order-basket-summary) {
  border: 0.22rem solid var(--menu-secondary);
  border-radius: 0.25rem;
  background: color-mix(in srgb, var(--menu-bg) 18%, white);
  box-shadow: 0.5rem 0.5rem 0 var(--menu-secondary);
}

@media (max-width: 820px) {
  .showcase-kiosk__preview-toolbar {
    grid-template-columns: auto minmax(0, 1fr);
  }

  .showcase-kiosk__preview-status {
    justify-self: end;
  }

  .showcase-kiosk__kitchen-picker {
    grid-column: 1 / -1;
    justify-content: space-between;
  }

  .showcase-kiosk__kitchen-options {
    flex: 1;
  }

  .showcase-kiosk__kitchen-options :deep(button) {
    flex: 1;
    justify-content: center;
  }
}

@media (max-width: 520px) {
  .showcase-kiosk__preview-status small,
  .showcase-kiosk__kitchen-picker-label {
    display: none;
  }

  .showcase-kiosk__preview-toolbar {
    column-gap: calc(var(--spacing) * 2);
    padding-inline: calc(var(--spacing) * 2);
  }
}

@media (prefers-reduced-motion: reduce) {
  .showcase-kiosk__canvas :deep(.menu-order-kiosk--order),
  .showcase-kiosk__canvas :deep(.menu-order-kiosk-catalogue__rail),
  .showcase-kiosk__canvas :deep(.menu-order-kiosk-catalogue__content) {
    animation: none;
  }
}
</style>
