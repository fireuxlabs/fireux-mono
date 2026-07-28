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

<style scoped>
/* Mobile-first baseline. Width queries below may only enhance this layout. */
.landing-ordering-preview {
  display: grid;
  min-width: 0;
  gap: calc(var(--spacing) * 4);
}

.landing-ordering-preview__switcher {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: calc(var(--spacing) * 1);
  padding: calc(var(--spacing) * 1);
  border: 1px solid var(--ui-border);
  border-radius: calc(var(--ui-radius) * 4);
  background: var(--ui-bg-elevated);
}

.landing-ordering-preview__switcher button {
  display: flex;
  min-height: 2.75rem;
  align-items: center;
  justify-content: center;
  gap: calc(var(--spacing) * 2);
  border-radius: calc(var(--ui-radius) * 3);
  color: var(--ui-text-muted);
  font-size: 0.82rem;
  font-weight: 750;
}

.landing-ordering-preview__switcher button[aria-pressed="true"] {
  background: var(--ui-primary);
  color: var(--ui-color-primary-contrast);
}

.landing-ordering-preview__surface.landing-ordering-preview__surface--mobile-hidden,
.landing-ordering-preview__guest.landing-ordering-preview__guest--mobile-hidden {
  display: none;
}

.landing-ordering-preview__surface {
  min-width: 0;
  overflow: hidden;
  border: 1px solid var(--ui-border);
  border-radius: calc(var(--ui-radius) * 6);
  background: var(--ui-bg-elevated);
  box-shadow: 0 2rem 5rem rgb(0 0 0 / 18%);
}

.landing-ordering-preview__surface > header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: calc(var(--spacing) * 3);
  min-height: 3.5rem;
  padding: calc(var(--spacing) * 3) calc(var(--spacing) * 4);
  border-bottom: 1px solid var(--ui-border);
}

.landing-ordering-preview__surface > header span {
  display: inline-flex;
  align-items: center;
  gap: calc(var(--spacing) * 2);
  color: var(--ui-text-highlighted);
  font-size: 0.84rem;
  font-weight: 750;
}

.landing-ordering-preview__surface > header svg {
  color: var(--ui-primary);
}

.landing-ordering-preview__surface > header small {
  color: var(--ui-text-muted);
  font-size: 0.7rem;
  font-weight: 650;
}

.landing-ordering-preview__guest {
  display: grid;
  min-width: 0;
  align-content: end;
}

.landing-ordering-preview__kiosk {
  height: auto;
  overflow: hidden;
  overscroll-behavior: contain;
  background: var(--menu-bg);
  color: var(--menu-text);
  touch-action: pan-y;
  user-select: none;
}

.landing-ordering-preview__kiosk :deep(.menu-order-kiosk-catalogue) {
  grid-template-columns: minmax(0, 1fr);
}

.landing-ordering-preview__kiosk
  :deep(.menu-order-kiosk-catalogue__section) {
  min-height: 2.8rem;
  padding: 0.55rem 0.65rem;
  font-size: 0.72rem;
}

.landing-ordering-preview__kiosk
  :deep(.menu-order-kiosk-catalogue__content) {
  padding: calc(var(--spacing) * 4);
}

.landing-ordering-preview__kiosk
  :deep(.menu-order-kiosk-catalogue__header h2) {
  font-size: var(--text-2xl);
}

.landing-ordering-preview__kiosk
  :deep(.menu-order-kiosk-catalogue__items) {
  grid-template-columns: minmax(0, 1fr);
  gap: calc(var(--spacing) * 3);
}

.landing-ordering-preview__kiosk
  :deep(.menu-order-kiosk-item__media) {
  height: 9rem;
  overflow: hidden;
}

.landing-ordering-preview__kiosk
  :deep(.menu-order-kiosk-item__media img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.landing-ordering-preview__phone {
  display: block;
  width: 100%;
  height: auto;
  margin: 0 auto;
  overflow: visible;
  border: 0;
  border-radius: 0;
  background: var(--menu-bg);
  color: var(--menu-text);
  overscroll-behavior: contain;
  touch-action: pan-y;
  user-select: none;
}

.landing-ordering-preview__phone-bar {
  display: none;
}

.landing-ordering-preview__phone-bar span {
  width: 4rem;
  height: 0.3rem;
  border-radius: 9999px;
  background: color-mix(in srgb, var(--menu-text) 30%, transparent);
}

.landing-ordering-preview__phone-content {
  display: grid;
  gap: calc(var(--spacing) * 1);
  padding: calc(var(--spacing) * 5);
  overflow: visible;
}

.landing-ordering-preview__phone-content > strong {
  color: var(--menu-title);
  font-family: var(--menu-title-font);
  font-size: 1.15rem;
}

.landing-ordering-preview__phone-content > small {
  margin-bottom: calc(var(--spacing) * 3);
  color: var(--menu-muted);
  font-size: 0.72rem;
}

.landing-ordering-preview__phone
  :deep(.menu-order-catalogue) {
  gap: calc(var(--spacing) * 4);
}

.landing-ordering-preview__phone
  :deep(.menu-order-catalogue__sections) {
  column-count: 1;
  column-gap: 0;
  gap: calc(var(--spacing) * 4);
}

.landing-ordering-preview__phone
  :deep(.menu-catalogue-section__heading) {
  font-size: var(--text-xl);
}

.landing-ordering-preview__phone
  :deep(.menu-order-item) {
  font-size: 0.78rem;
}

@media (min-width: 640px) {
  .landing-ordering-preview {
    grid-template-columns: minmax(0, 1.2fr) minmax(22rem, 0.8fr);
    align-items: end;
  }

  .landing-ordering-preview__switcher {
    display: none;
  }

  .landing-ordering-preview__surface.landing-ordering-preview__surface--mobile-hidden {
    display: block;
  }

  .landing-ordering-preview__guest.landing-ordering-preview__guest--mobile-hidden {
    display: grid;
  }

  .landing-ordering-preview__phone {
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
    width: min(100%, 26rem);
    height: 26rem;
    overflow: hidden;
    border: 0.4rem solid color-mix(in srgb, var(--menu-text) 86%, black);
    border-bottom: 0;
    border-radius: calc(var(--ui-radius) * 6);
  border-end-start-radius: 0;
  border-end-end-radius: 0;
  }

  .landing-ordering-preview__phone-bar {
    display: grid;
    height: 1.6rem;
    place-items: center;
  }

  .landing-ordering-preview__phone-content {
    min-height: 0;
    padding: 0 calc(var(--spacing) * 4) calc(var(--spacing) * 5);
    overflow-y: auto;
    overscroll-behavior: contain;
    scrollbar-width: thin;
  }

  .landing-ordering-preview__kiosk {
    height: 26rem;
  }

  .landing-ordering-preview__kiosk :deep(.menu-order-kiosk-catalogue) {
    grid-template-columns: 7rem minmax(0, 1fr);
  }

  .landing-ordering-preview__kiosk
    :deep(.menu-order-kiosk-catalogue__rail) {
    padding: 0.65rem 0.45rem;
  }

  .landing-ordering-preview__kiosk
    :deep(.menu-order-kiosk-catalogue__items) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .landing-ordering-preview__kiosk
    :deep(.menu-order-kiosk-item__media) {
    height: auto;
  }

  .landing-ordering-preview__kiosk
    :deep(.menu-order-kiosk-item__media img) {
    height: auto;
    object-fit: contain;
  }
}
</style>
