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
        <UBadge color="neutral" variant="soft"> Demo preview </UBadge>
        <span class="showcase-kiosk__preview-copy">
          <small class="showcase-kiosk__preview-safety"
            >No live orders are sent</small
          >
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

    <ShowcaseKioskPreview
      v-if="!standalonePreview"
      v-model:open="previewOpen"
      :kitchen-id="kitchenId"
      :kitchens="kitchens"
      @update:kitchen-id="$emit('update:kitchenId', $event)"
    />

    <article
      class="fireux-menu-detail menu-detail--kiosk showcase-kiosk__canvas"
      :class="themeClassName"
      :style="themeStyleVars"
      data-misebox-showcase="kiosk-canvas"
      :aria-label="`${manifest.presentation.kitchenName} Kiosk preview`"
    >
      <ShowcaseKioskAttract
        v-if="!started"
        :backdrop-image-url="attractImageUrl"
        :kitchen-name="manifest.presentation.kitchenName"
        :logo-image-url="manifest.presentation.kitchenLogoImageUrl"
        :wordmark-image-url="manifest.presentation.kitchenWordmarkImageUrl"
        @start="started = true"
      />

      <MenuOrderKioskFlow
        v-else
        :key="scopeKey"
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
          <ShowcaseKioskOrder
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
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useMenuThemeSurface } from 'fireux-kitchens/runtime/menu/composables/useMenuThemeSurface'
import type { MenuManifest } from 'fireux-kitchens/runtime/menu/models/menu-detail.model'
import type { MiseboxProductDemoKioskAppearance } from '../../composables/product-demo/useMiseboxProductDemo'

type DemoKitchenOption = {
  id: string
  label: string
  tagline: string
}

type PositionedScreen = Screen & {
  availLeft?: number
  availTop?: number
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
    (config) => config.type === 'eat_in' || config.type === 'takeaway'
  )
)

const { className: themeClassName, styleVars: themeStyleVars } =
  useMenuThemeSurface({
    theme: computed(() => props.manifest.presentation.theme),
    pageCanvas: true,
  })

const previewOpen = ref(false)
const started = ref(false)
const attractImageUrl = computed(() =>
  String(props.manifest.presentation.kitchenImageUrl || '').trim()
  || props.manifest.content.sections
    .flatMap(section => section.items)
    .map(item => String(item.imageUrl || '').trim())
    .find(Boolean)
)
const previewScale = ref(0.5)
const standalonePreviewStyle = computed<Record<string, string> | undefined>(
  () =>
    props.standalonePreview
      ? { '--demo-kiosk-window-scale': String(previewScale.value) }
      : undefined
)

function updatePreviewScale() {
  if (!import.meta.client) return

  if (props.standalonePreview) {
    previewScale.value = Math.min(
      window.innerWidth / 1080,
      window.innerHeight / 1920,
      1
    )
    return
  }
}

onMounted(() => {
  updatePreviewScale()
  window.addEventListener('resize', updatePreviewScale)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updatePreviewScale)
})

watch(() => props.scopeKey, () => {
  started.value = false
})

function openPortraitPreview() {
  if (!import.meta.client) return

  const previewUrl = new URL(window.location.href)
  previewUrl.searchParams.set('viewport', '1080x1920')
  previewUrl.searchParams.delete('embedded')
  previewUrl.searchParams.delete('previewRequest')

  const availableScreen = window.screen as PositionedScreen
  const availableLeft = availableScreen.availLeft ?? 0
  const availableTop = availableScreen.availTop ?? 0
  const availableWidth = Math.max(availableScreen.availWidth - 64, 480)
  const availableHeight = Math.max(availableScreen.availHeight - 64, 720)
  const popupScale = Math.min(availableWidth / 1080, availableHeight / 1920, 1)
  const popupWidth = Math.round(1080 * popupScale)
  const popupHeight = Math.round(1920 * popupScale)
  const popupLeft = Math.max(
    availableLeft + Math.round((availableScreen.availWidth - popupWidth) / 2),
    availableLeft
  )
  const popupTop = Math.max(
    availableTop + Math.round((availableScreen.availHeight - popupHeight) / 2),
    availableTop
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
      portraitWindow.outerWidth <= popupWidth + 160 &&
      portraitWindow.outerHeight <= popupHeight + 220

    if (openedAsDetachedWindow) {
      portraitWindow.location.replace(previewUrl.toString())
      portraitWindow.focus()
      return
    }

    portraitWindow.close()
  }

  previewOpen.value = true
}
</script>

<style scoped src="./kiosk.css"></style>
