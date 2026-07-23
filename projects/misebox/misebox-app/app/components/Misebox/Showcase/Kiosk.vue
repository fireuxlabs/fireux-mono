<!-- Concurrent edit — 2026-07-22 12:41 CEST — Product Demo app pass: project the featured Demo Kitchen into a local-only canonical Kiosk. -->
<!-- Concurrent edit — 2026-07-22 13:48 CEST — Kiosk Demo selector pass: move preview controls outside the canvas and switch Demo Kitchens. -->
<!-- Concurrent edit — 2026-07-22 13:56 CEST — Kiosk theme contrast pass: separate refined dining and fast-food counter presentation. -->
<!-- Concurrent edit — 2026-07-22 14:45 CEST — Demo Kiosk entry pass: go straight to Eat here with a short catalogue reveal. -->
<!-- Concurrent edit — 2026-07-22 17:11 CEST — Exact viewport preview: retain the user-confirmed 1080 × 1920 popup and selected Demo Kitchen. -->
<!-- Concurrent edit — 2026-07-22 17:15 CEST — Popup Demo controls: keep Kitchen switching available without reducing the Kiosk viewport. -->
<!-- Concurrent edit — 2026-07-22 17:34 CEST — Portable portrait stage: render the exact Kiosk viewport in an app-owned modal across browsers and deployments. -->
<!-- Concurrent edit — 2026-07-22 18:03 CEST — Deanos modernisation pass: replace the retro counter treatment with a clean campaign-led fast-food system. -->
<!-- Concurrent edit — 2026-07-22 18:12 CEST — Pizza Demo pass: add a reusable green-and-yellow pizzeria appearance profile. -->
<!-- Concurrent edit — 2026-07-23 08:42 CEST — Popup restoration: open the portrait demo synchronously and retain the modal only as a blocked-popup fallback. -->
<!-- Concurrent edit — 2026-07-23 08:58 CEST — Firefox popup pass: fit the detached window to the display while preserving a scaled 1080 × 1920 canvas. -->
<!-- Concurrent edit — 2026-07-23 09:11 CEST — Portable popup pass: detect Firefox tab substitution and fall back to the exact app-owned portrait dialog. -->
<template>
  <main
    class="showcase-kiosk"
    :class="[
      `showcase-kiosk--${appearance}`,
      { 'showcase-kiosk--standalone-preview': standalonePreview },
    ]"
    :style="standalonePreviewStyle"
    data-misebox-showcase="kiosk"
    data-showcase-data-source="demo-world"
    :data-demo-kitchen-id="kitchenId"
    :data-demo-kiosk-appearance="appearance"
    :data-demo-kiosk-viewport="standalonePreview ? '1080x1920' : 'responsive'"
  >
    <header
      v-if="!standalonePreview"
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
          Demo preview
        </UBadge>
        <span class="showcase-kiosk__preview-copy">
          <small class="showcase-kiosk__preview-safety">No live orders are sent</small>
          <small class="showcase-kiosk__preview-target">
            <UIcon name="i-lucide-monitor-smartphone" aria-hidden="true" />
            Optimised for 1080 × 1920 portrait
          </small>
        </span>
      </div>

      <div class="showcase-kiosk__preview-controls">
        <UButton
          size="sm"
          color="neutral"
          variant="ghost"
          icon="i-lucide-external-link"
          aria-label="Open the Kiosk demo optimised for 1080 by 1920 portrait"
          data-demo-kiosk-open-portrait-preview
          @click="openPortraitPreview"
        >
          Open demo
        </UButton>

        <div
          class="showcase-kiosk__kitchen-picker"
          role="group"
          aria-label="Demo Kitchen"
        >
          <span class="showcase-kiosk__kitchen-picker-label">Kitchen</span>
          <div class="showcase-kiosk__kitchen-options">
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
          </div>
        </div>
      </div>
    </header>

    <aside
      v-else-if="!embeddedPreview"
      class="showcase-kiosk__popup-switcher"
      aria-label="Demo Kitchen"
      data-demo-kiosk-popup-switcher
    >
      <span class="showcase-kiosk__popup-switcher-label">Demo Kitchen</span>
      <div class="showcase-kiosk__kitchen-options">
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
      </div>
    </aside>

    <UModal
      v-if="!standalonePreview"
      v-model:open="previewOpen"
      title="Kiosk demo"
      description="Exact 1080 × 1920 portrait viewport, scaled to fit this screen."
      :ui="{
        content: 'showcase-kiosk-preview-modal',
        body: 'showcase-kiosk-preview-modal__body',
      }"
    >
      <template #body>
        <div
          class="showcase-kiosk__modal-switcher"
          role="group"
          aria-label="Demo Kitchen"
        >
          <span class="showcase-kiosk__popup-switcher-label">Demo Kitchen</span>
          <div class="showcase-kiosk__kitchen-options">
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
          </div>
        </div>

        <div
          class="showcase-kiosk__portrait-stage"
          :style="previewStageStyle"
          data-demo-kiosk-preview-dialog
        >
          <iframe
            v-if="portraitPreviewUrl"
            class="showcase-kiosk__portrait-frame"
            :src="portraitPreviewUrl"
            title="1080 by 1920 Kiosk demo"
            width="1080"
            height="1920"
          />
        </div>
      </template>
    </UModal>

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
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useMenuThemeSurface } from 'fireux-kitchens/runtime/composables/fireux/menu/useMenuThemeSurface'
import type { MenuManifest } from 'fireux-kitchens/runtime/models/kitchen/menu/menu-detail.model'
import type { MiseboxProductDemoKioskAppearance } from '../../../composables/product-demo/useMiseboxProductDemo'

type DemoKitchenOption = {
  id: string
  label: string
  tagline: string
}

const props = defineProps<{
  appearance: MiseboxProductDemoKioskAppearance
  embeddedPreview?: boolean
  kitchenId: string
  kitchens: readonly DemoKitchenOption[]
  manifest: MenuManifest
  nextOrderNumber: number
  scopeKey: string
  standalonePreview?: boolean
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

const previewOpen = ref(false)
const portraitPreviewBaseUrl = ref('')
const portraitPreviewUrl = computed(() => {
  if (!portraitPreviewBaseUrl.value)
    return ''

  const previewUrl = new URL(portraitPreviewBaseUrl.value)
  previewUrl.searchParams.set('kitchen', props.kitchenId)
  return previewUrl.toString()
})
const previewScale = ref(0.5)
const previewStageStyle = computed<Record<string, string>>(() => ({
  '--demo-kiosk-preview-scale': String(previewScale.value),
  'width': `${1080 * previewScale.value}px`,
  'height': `${1920 * previewScale.value}px`,
}))
const standalonePreviewStyle = computed<Record<string, string> | undefined>(() =>
  props.standalonePreview
    ? { '--demo-kiosk-window-scale': String(previewScale.value) }
    : undefined
)

function updatePreviewScale() {
  if (!import.meta.client)
    return

  if (props.standalonePreview) {
    previewScale.value = Math.min(
      window.innerWidth / 1080,
      window.innerHeight / 1920,
      1
    )
    return
  }

  const availableWidth = Math.max(window.innerWidth - 96, 320)
  const availableHeight = Math.max(window.innerHeight - 192, 480)
  previewScale.value = Math.min(availableWidth / 1080, availableHeight / 1920, 1)
}

onMounted(() => {
  updatePreviewScale()
  window.addEventListener('resize', updatePreviewScale)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updatePreviewScale)
})

function openPortraitPreview() {
  if (!import.meta.client)
    return

  const previewUrl = new URL(window.location.href)
  previewUrl.searchParams.set('viewport', '1080x1920')
  previewUrl.searchParams.delete('embedded')
  previewUrl.searchParams.delete('previewRequest')

  const availableWidth = Math.max(window.screen.availWidth - 64, 480)
  const availableHeight = Math.max(window.screen.availHeight - 64, 720)
  const popupScale = Math.min(availableWidth / 1080, availableHeight / 1920, 1)
  const popupWidth = Math.round(1080 * popupScale)
  const popupHeight = Math.round(1920 * popupScale)
  const popupLeft = Math.max(
    window.screen.availLeft + Math.round((window.screen.availWidth - popupWidth) / 2),
    window.screen.availLeft
  )
  const popupTop = Math.max(
    window.screen.availTop + Math.round((window.screen.availHeight - popupHeight) / 2),
    window.screen.availTop
  )

  const portraitWindow = window.open(
    'about:blank',
    '_blank',
    [
      `width=${popupWidth}`,
      `height=${popupHeight}`,
      `left=${popupLeft}`,
      `top=${popupTop}`,
      'resizable=yes',
      'scrollbars=no',
      'toolbar=no',
      'location=no',
      'menubar=no',
      'status=no',
    ].join(',')
  )

  if (portraitWindow) {
    portraitWindow.resizeTo(popupWidth, popupHeight)
    portraitWindow.moveTo(popupLeft, popupTop)

    const openedAsDetachedWindow =
      portraitWindow.outerWidth <= popupWidth + 160
      && portraitWindow.outerHeight <= popupHeight + 220

    if (openedAsDetachedWindow) {
      portraitWindow.location.replace(previewUrl.toString())
      portraitWindow.focus()
      return
    }

    portraitWindow.close()
  }

  previewUrl.searchParams.set('embedded', '1')
  portraitPreviewBaseUrl.value = previewUrl.toString()
  updatePreviewScale()
  previewOpen.value = true
}
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

.showcase-kiosk--standalone-preview {
  grid-template-rows: minmax(0, 1fr);
  width: 1080px;
  height: 1920px;
  transform: scale(var(--demo-kiosk-window-scale, 1));
  transform-origin: top left;
}

.showcase-kiosk__popup-switcher {
  position: fixed;
  z-index: 95;
  top: max(calc(var(--spacing) * 3), env(safe-area-inset-top));
  right: max(calc(var(--spacing) * 3), env(safe-area-inset-right));
  display: flex;
  align-items: center;
  gap: calc(var(--spacing) * 2);
  padding: calc(var(--spacing) * 2);
  border: 1px solid rgb(148 163 184 / 40%);
  border-radius: 9999px;
  background: rgb(255 255 255 / 92%);
  box-shadow: 0 0.75rem 2.5rem rgb(15 23 42 / 20%);
  backdrop-filter: blur(1rem);
}

.showcase-kiosk__popup-switcher-label {
  padding-inline-start: calc(var(--spacing) * 1.5);
  color: #475569;
  font-size: 0.75rem;
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  white-space: nowrap;
}

:global(.showcase-kiosk-preview-modal) {
  width: min(96vw, 72rem);
  max-width: 96vw;
  max-height: 96dvh;
  overflow: hidden;
}

:global(.showcase-kiosk-preview-modal__body) {
  display: grid;
  min-height: 0;
  place-items: center;
  gap: calc(var(--spacing) * 3);
  overflow: auto;
  background: #111827;
}

.showcase-kiosk__modal-switcher {
  display: flex;
  align-items: center;
  gap: calc(var(--spacing) * 2);
  padding: calc(var(--spacing) * 2);
  border-radius: 9999px;
  background: rgb(255 255 255 / 94%);
}

.showcase-kiosk__portrait-stage {
  position: relative;
  flex: 0 0 auto;
  overflow: hidden;
  border-radius: 0.75rem;
  background: white;
  box-shadow: 0 1.5rem 4rem rgb(0 0 0 / 35%);
}

.showcase-kiosk__portrait-frame {
  position: absolute;
  inset: 0 auto auto 0;
  width: 1080px;
  max-width: none;
  height: 1920px;
  border: 0;
  transform: scale(var(--demo-kiosk-preview-scale));
  transform-origin: top left;
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

.showcase-kiosk__preview-copy {
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

.showcase-kiosk__preview-target {
  display: inline-flex;
  align-items: center;
  gap: calc(var(--spacing) * 1.25);
  color: var(--ui-text-muted);
  font-weight: var(--font-weight-semibold);
}

.showcase-kiosk__preview-target :deep(svg) {
  width: 0.9rem;
  height: 0.9rem;
  flex: 0 0 auto;
}

.showcase-kiosk__preview-controls {
  display: flex;
  min-width: 0;
  align-items: center;
  justify-content: flex-end;
  gap: calc(var(--spacing) * 2);
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
  display: flex;
  min-width: 0;
  gap: calc(var(--spacing) * 1);
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

.showcase-kiosk--pizzeria .showcase-kiosk__canvas {
  --menu-radius: 1.8rem;
  --menu-radius-control: 1.2rem;
}

.showcase-kiosk--pizzeria .showcase-kiosk__kitchen-options :deep(button[aria-pressed='true']) {
  background: #1f6b45;
  color: #fff7d6;
}

.showcase-kiosk--pizzeria :deep(.menu-order-kiosk::before) {
  background:
    radial-gradient(circle at 90% 12%, color-mix(in srgb, var(--menu-secondary) 72%, transparent) 0 9rem, transparent 9.15rem),
    radial-gradient(circle at 83% 20%, transparent 0 13rem, color-mix(in srgb, var(--menu-primary) 18%, transparent) 13.1rem 14rem, transparent 14.1rem),
    radial-gradient(circle at 12% 88%, color-mix(in srgb, var(--menu-secondary) 42%, transparent) 0 7rem, transparent 7.1rem),
    radial-gradient(circle, color-mix(in srgb, var(--menu-primary) 10%, transparent) 1.25px, transparent 1.4px);
  background-size: auto, auto, auto, 1.35rem 1.35rem;
  opacity: 0.86;
}

.showcase-kiosk--pizzeria :deep(.menu-order-kiosk-start) {
  width: min(100%, 62rem);
  gap: clamp(2.75rem, 6vh, 4.75rem);
}

.showcase-kiosk--pizzeria :deep(.menu-order-kiosk-start__identity h1),
.showcase-kiosk--pizzeria :deep(.menu-order-kiosk-start__prompt h2) {
  font-weight: 800;
  letter-spacing: -0.06em;
}

.showcase-kiosk--pizzeria :deep(.menu-order-kiosk-start__identity h1) {
  font-size: clamp(2.8rem, 5vw, 4.8rem);
}

.showcase-kiosk--pizzeria :deep(.menu-order-kiosk-start__identity p) {
  color: var(--menu-primary);
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.08em;
}

.showcase-kiosk--pizzeria :deep(.menu-order-kiosk-start__prompt h2) {
  font-size: clamp(3.6rem, 7vw, 6.4rem);
  line-height: 0.94;
}

.showcase-kiosk--pizzeria :deep(.menu-order-kiosk-start__option) {
  min-height: clamp(10rem, 18vh, 13rem);
  border: 2px solid color-mix(in srgb, var(--menu-primary) 18%, transparent);
  border-radius: 1.8rem;
  background: color-mix(in srgb, var(--menu-bg) 82%, white);
  box-shadow: 0 1.5rem 4rem color-mix(in srgb, var(--menu-primary) 10%, transparent);
}

.showcase-kiosk--pizzeria :deep(.menu-order-kiosk-start__option-icon) {
  border: 0;
  border-radius: 9999px;
  background: var(--menu-secondary);
  color: var(--menu-primary);
}

.showcase-kiosk--pizzeria :deep(.menu-order-kiosk__toolbar) {
  border-bottom: 0;
  background: var(--menu-primary);
  box-shadow: 0 0.75rem 2.5rem color-mix(in srgb, var(--menu-primary) 22%, transparent);
}

.showcase-kiosk--pizzeria :deep(.menu-order-kiosk__change),
.showcase-kiosk--pizzeria :deep(.menu-order-kiosk__identity strong),
.showcase-kiosk--pizzeria :deep(.menu-order-kiosk__identity small),
.showcase-kiosk--pizzeria :deep(.menu-order-kiosk__mode) {
  color: var(--menu-bg);
}

.showcase-kiosk--pizzeria :deep(.menu-order-kiosk__mode) {
  border-color: color-mix(in srgb, var(--menu-secondary) 64%, transparent);
  background: color-mix(in srgb, var(--menu-secondary) 16%, transparent);
}

.showcase-kiosk--pizzeria :deep(.menu-order-kiosk-catalogue__rail) {
  border-right: 0;
  background: var(--menu-primary);
}

.showcase-kiosk--pizzeria :deep(.menu-order-kiosk-catalogue__section) {
  font-family: var(--menu-title-font);
  font-weight: var(--font-weight-bold);
  letter-spacing: -0.025em;
  color: color-mix(in srgb, var(--menu-bg) 72%, transparent);
}

.showcase-kiosk--pizzeria :deep(.menu-order-kiosk-catalogue__section--active) {
  border-radius: 9999px;
  background: var(--menu-secondary);
  box-shadow: none;
  color: var(--menu-primary);
}

.showcase-kiosk--pizzeria :deep(.menu-order-kiosk-catalogue__header h2) {
  font-size: clamp(2.6rem, 4.8vw, 4.2rem);
  font-weight: 800;
  letter-spacing: -0.065em;
}

.showcase-kiosk--pizzeria :deep(.menu-order-kiosk-item) {
  border: 2px solid color-mix(in srgb, var(--menu-primary) 14%, transparent);
  border-radius: 1.65rem;
  background: color-mix(in srgb, var(--menu-bg) 72%, white);
  box-shadow: 0 1.25rem 3.5rem color-mix(in srgb, var(--menu-primary) 9%, transparent);
}

.showcase-kiosk--pizzeria :deep(.menu-order-kiosk-item__media) {
  border-bottom: 0;
  background: color-mix(in srgb, var(--menu-secondary) 30%, var(--menu-bg));
}

.showcase-kiosk--pizzeria :deep(.menu-order-kiosk-item__media img) {
  padding: 0;
  object-fit: cover;
}

.showcase-kiosk--pizzeria :deep(.menu-order-kiosk-item h3) {
  font-weight: 800;
  letter-spacing: -0.045em;
}

.showcase-kiosk--pizzeria :deep(.menu-order-kiosk-item__variants button) {
  border: 1px solid color-mix(in srgb, var(--menu-primary) 28%, transparent);
  border-radius: 9999px;
  background: transparent;
}

.showcase-kiosk--pizzeria :deep(.menu-order-kiosk-item__add) {
  padding: 0.8rem 1rem;
  border: 0;
  border-radius: 9999px;
  background: var(--menu-primary);
  color: var(--menu-bg);
  font-family: var(--menu-title-font);
  letter-spacing: -0.02em;
}

.showcase-kiosk--pizzeria :deep(.menu-order-kiosk-item--without-media) {
  background:
    radial-gradient(circle at 86% 14%, color-mix(in srgb, var(--menu-secondary) 55%, transparent) 0 4rem, transparent 9rem),
    color-mix(in srgb, var(--menu-bg) 72%, white);
}

.showcase-kiosk--pizzeria :deep(.menu-order-basket-summary) {
  border: 2px solid color-mix(in srgb, var(--menu-secondary) 70%, transparent);
  border-radius: 1.4rem;
  background: var(--menu-primary);
  box-shadow: 0 1.5rem 4rem color-mix(in srgb, var(--menu-primary) 22%, transparent);
  color: var(--menu-bg);
}

.showcase-kiosk--pizzeria :deep(.menu-order-basket-summary__checkout) {
  border-radius: 9999px;
  background: var(--menu-secondary);
  color: var(--menu-primary);
}

.showcase-kiosk--counter .showcase-kiosk__canvas {
  --menu-radius: 1.75rem;
  --menu-radius-control: 1.25rem;
}

.showcase-kiosk--counter .showcase-kiosk__kitchen-options :deep(button[aria-pressed='true']) {
  background: #ff4f2e;
  color: white;
}

.showcase-kiosk--counter :deep(.menu-order-kiosk::before) {
  background:
    radial-gradient(circle at 92% 8%, color-mix(in srgb, var(--menu-primary) 15%, transparent) 0 11rem, transparent 27rem),
    radial-gradient(circle at 62% 100%, color-mix(in srgb, var(--menu-primary) 8%, transparent) 0 8rem, transparent 24rem),
    radial-gradient(circle, color-mix(in srgb, var(--menu-secondary) 9%, transparent) 1px, transparent 1.2px);
  background-size: auto, auto, 1.15rem 1.15rem;
  opacity: 0.8;
}

.showcase-kiosk--counter :deep(.menu-order-kiosk-start) {
  width: min(100%, 64rem);
  gap: clamp(2.5rem, 6vh, 4.5rem);
}

.showcase-kiosk--counter :deep(.menu-order-kiosk-start__identity h1) {
  font-size: clamp(2.75rem, 5vw, 4.75rem);
  font-weight: 750;
  letter-spacing: -0.065em;
}

.showcase-kiosk--counter :deep(.menu-order-kiosk-start__identity p) {
  color: var(--menu-primary);
  font-family: var(--menu-font);
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.08em;
}

.showcase-kiosk--counter :deep(.menu-order-kiosk-start__prompt h2) {
  font-size: clamp(3.5rem, 7vw, 6.5rem);
  font-weight: 750;
  line-height: 0.94;
  letter-spacing: -0.075em;
}

.showcase-kiosk--counter :deep(.menu-order-kiosk-start__options) {
  gap: clamp(1.75rem, 3vw, 2.75rem);
}

.showcase-kiosk--counter :deep(.menu-order-kiosk-start__option) {
  min-height: clamp(10rem, 18vh, 13rem);
  border: 1px solid color-mix(in srgb, var(--menu-secondary) 12%, transparent);
  border-radius: 1.75rem;
  background: color-mix(in srgb, var(--menu-bg) 84%, white);
  box-shadow: 0 1.75rem 4.5rem color-mix(in srgb, var(--menu-secondary) 10%, transparent);
}

.showcase-kiosk--counter :deep(.menu-order-kiosk-start__option:hover),
.showcase-kiosk--counter :deep(.menu-order-kiosk-start__option:focus-visible) {
  border-color: color-mix(in srgb, var(--menu-primary) 48%, transparent);
  background: white;
  box-shadow: 0 2rem 5rem color-mix(in srgb, var(--menu-secondary) 14%, transparent);
  transform: translateY(-0.2rem);
}

.showcase-kiosk--counter :deep(.menu-order-kiosk-start__option-icon) {
  border: 0;
  border-radius: 1rem;
  background: var(--menu-primary);
  color: white;
}

.showcase-kiosk--counter :deep(.menu-order-kiosk-start__option-copy strong) {
  font-family: var(--menu-title-font);
  font-size: clamp(1.75rem, 3vw, 2.6rem);
  letter-spacing: -0.045em;
}

.showcase-kiosk--counter :deep(.menu-order-kiosk__toolbar) {
  border-bottom: 0;
  background: var(--menu-secondary);
  box-shadow: 0 0.75rem 2.5rem color-mix(in srgb, var(--menu-secondary) 24%, transparent);
}

.showcase-kiosk--counter :deep(.menu-order-kiosk__change),
.showcase-kiosk--counter :deep(.menu-order-kiosk__identity strong),
.showcase-kiosk--counter :deep(.menu-order-kiosk__identity small),
.showcase-kiosk--counter :deep(.menu-order-kiosk__mode) {
  color: var(--menu-bg);
}

.showcase-kiosk--counter :deep(.menu-order-kiosk__mode) {
  border-color: color-mix(in srgb, var(--menu-bg) 24%, transparent);
  background: color-mix(in srgb, var(--menu-bg) 10%, transparent);
}

.showcase-kiosk--counter :deep(.menu-order-kiosk-catalogue__rail) {
  border-right: 0;
  background: var(--menu-secondary);
}

.showcase-kiosk--counter :deep(.menu-order-kiosk-catalogue__section) {
  font-family: var(--menu-title-font);
  font-weight: var(--font-weight-bold);
  letter-spacing: -0.025em;
  color: color-mix(in srgb, var(--menu-bg) 68%, transparent);
}

.showcase-kiosk--counter :deep(.menu-order-kiosk-catalogue__section--active) {
  border-radius: 1rem;
  background: var(--menu-primary);
  box-shadow: none;
  color: white;
}

.showcase-kiosk--counter :deep(.menu-order-kiosk-catalogue__header h2) {
  font-size: clamp(2.6rem, 4.8vw, 4.25rem);
  font-weight: 750;
  letter-spacing: -0.07em;
}

.showcase-kiosk--counter :deep(.menu-order-kiosk-item) {
  border: 1px solid color-mix(in srgb, var(--menu-secondary) 9%, transparent);
  border-radius: 1.5rem;
  background: color-mix(in srgb, var(--menu-bg) 72%, white);
  box-shadow: 0 1.25rem 3.5rem color-mix(in srgb, var(--menu-secondary) 9%, transparent);
}

.showcase-kiosk--counter :deep(.menu-order-kiosk-item__media) {
  border-bottom: 0;
  background: #f4eee3;
}

.showcase-kiosk--counter :deep(.menu-order-kiosk-item__media img) {
  padding: 0;
  object-fit: cover;
}

.showcase-kiosk--counter :deep(.menu-order-kiosk-item h3) {
  font-weight: 750;
  letter-spacing: -0.045em;
}

.showcase-kiosk--counter :deep(.menu-order-kiosk-item__variants button) {
  border: 1px solid color-mix(in srgb, var(--menu-secondary) 16%, transparent);
  border-radius: 9999px;
  background: transparent;
}

.showcase-kiosk--counter :deep(.menu-order-kiosk-item__add) {
  padding: 0.8rem 1rem;
  border: 0;
  border-radius: 9999px;
  background: var(--menu-primary);
  color: white;
  font-family: var(--menu-title-font);
  letter-spacing: -0.02em;
}

.showcase-kiosk--counter :deep(.menu-order-kiosk-item--without-media) {
  background:
    radial-gradient(circle at 85% 12%, color-mix(in srgb, var(--menu-primary) 13%, transparent) 0 5rem, transparent 12rem),
    color-mix(in srgb, var(--menu-bg) 72%, white);
}

.showcase-kiosk--counter :deep(.menu-order-basket-summary) {
  border: 0;
  border-radius: 1.35rem;
  background: var(--menu-secondary);
  box-shadow: 0 1.5rem 4rem color-mix(in srgb, var(--menu-secondary) 24%, transparent);
  color: var(--menu-bg);
}

.showcase-kiosk--counter :deep(.menu-order-basket-summary__checkout) {
  border-radius: 9999px;
  background: var(--menu-primary);
  color: white;
}

@media (max-width: 820px) {
  .showcase-kiosk__preview-toolbar {
    grid-template-columns: auto minmax(0, 1fr);
  }

  .showcase-kiosk__preview-status {
    justify-self: end;
  }

  .showcase-kiosk__preview-controls {
    grid-column: 1 / -1;
    justify-content: space-between;
  }

  .showcase-kiosk__kitchen-picker {
    flex: 1;
    justify-content: flex-end;
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
  .showcase-kiosk__preview-safety,
  .showcase-kiosk__kitchen-picker-label {
    display: none;
  }

  .showcase-kiosk__preview-status {
    flex-direction: column;
    align-items: flex-end;
    gap: calc(var(--spacing) * 0.5);
  }

  .showcase-kiosk__preview-target {
    font-size: 0.68rem;
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
