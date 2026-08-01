<!-- Section 3 keeps the venue-owned Kiosk and guest-owned mobile Menu as distinct Demo surfaces. -->
<template>
  <div
    v-if="kioskManifest && mobileManifest"
    class="landing-ordering-preview"
    aria-label="Previews of a self-service Kiosk and mobile ordering Menu"
  >
    <div
      class="landing-ordering-preview__switcher"
      aria-label="Guest ordering preview"
    >
      <button
        type="button"
        :aria-pressed="selectedPreview === 'mobile'"
        @click="selectedPreview = 'mobile'"
      >
        <UIcon name="i-lucide-smartphone" aria-hidden="true" />
        Mobile
      </button>
      <button
        type="button"
        :aria-pressed="selectedPreview === 'kiosk'"
        @click="selectedPreview = 'kiosk'"
      >
        <UIcon name="i-lucide-monitor-smartphone" aria-hidden="true" />
        Kiosk
      </button>
    </div>

    <article
      class="landing-ordering-preview__surface landing-ordering-preview__surface--kiosk"
      :class="{
        'landing-ordering-preview__surface--mobile-hidden':
          selectedPreview !== 'kiosk',
      }"
    >
      <header>
        <span>
          <UIcon name="i-lucide-monitor-smartphone" aria-hidden="true" />
          Self-service kiosk
        </span>
        <small>Touch ordering</small>
      </header>

      <div
        class="landing-ordering-preview__kiosk"
        :class="kioskThemeClassName"
        :style="kioskThemeStyleVars"
      >
        <MenuOrderKioskCatalogue
          :currency-code="kioskManifest.presentation.currencyCode"
          :sections="kioskPreviewSections"
        />
      </div>
    </article>

    <div
      class="landing-ordering-preview__guest"
      :class="{
        'landing-ordering-preview__guest--mobile-hidden':
          selectedPreview !== 'mobile',
      }"
    >
      <article
        class="landing-ordering-preview__surface landing-ordering-preview__surface--phone"
      >
        <header>
          <span>
            <UIcon name="i-lucide-smartphone" aria-hidden="true" />
            Mobile ordering
          </span>
          <small>Published Menu · configured fulfilment</small>
        </header>

        <div
          class="landing-ordering-preview__phone"
          :class="mobileThemeClassName"
          :style="mobileThemeStyleVars"
        >
          <div class="landing-ordering-preview__phone-bar">
            <span />
          </div>
          <div class="landing-ordering-preview__phone-content">
            <strong>{{ mobileManifest.presentation.kitchenName }}</strong>
            <small>{{ mobileManifest.content.name }}</small>
            <MenuOrderCatalogue
              :currency-code="mobileManifest.presentation.currencyCode"
              :sections="mobilePreviewSections"
            />
          </div>
        </div>
      </article>
    </div>
  </div>

  <UAlert
    v-else-if="error"
    color="neutral"
    variant="soft"
    title="Ordering preview unavailable"
    description="No live Kitchen data was loaded."
  />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useMenuThemeSurface } from 'fireux-kitchens/runtime/composables/fireux/menu/useMenuThemeSurface'
import type {
  MiseboxProductDemo,
  MiseboxProductDemoKiosk,
} from '../../../composables/product-demo/useMiseboxProductDemo'

type PreviewMenuSection =
  MiseboxProductDemo['ordering']['manifest']['content']['sections'][number]

const { data: productDemo, error } = await useMiseboxProductDemo()
const selectedPreview = ref<'mobile' | 'kiosk'>('mobile')
const kioskManifest = computed(() =>
  productDemo.value?.kiosk.kitchens.find(
    (kitchen: MiseboxProductDemoKiosk) =>
      kitchen.id === productDemo.value?.kiosk.defaultId
  )?.manifest || null
)
const mobileManifest = computed(() =>
  productDemo.value?.ordering.manifest || null
)
const kioskPreviewSections = computed(() =>
  (kioskManifest.value?.content.sections || [])
    .slice(0, 3)
    .map((section: PreviewMenuSection) => ({
      ...section,
      items: section.items.slice(0, 1),
    }))
)
const mobilePreviewSections = computed(() =>
  (mobileManifest.value?.content.sections || [])
    .slice(0, 3)
    .map((section: PreviewMenuSection) => ({
      ...section,
      items: section.items.slice(0, 1),
    }))
)
const {
  className: kioskThemeClassName,
  styleVars: kioskThemeStyleVars,
} = useMenuThemeSurface({
  pageStyle: computed(() => kioskManifest.value?.presentation.pageStyle),
  colorMode: 'light',
})
const {
  className: mobileThemeClassName,
  styleVars: mobileThemeStyleVars,
} = useMenuThemeSurface({
  pageStyle: computed(() => mobileManifest.value?.presentation.pageStyle),
  colorMode: 'light',
})
</script>

<style scoped src="./ordering-preview.css"></style>
