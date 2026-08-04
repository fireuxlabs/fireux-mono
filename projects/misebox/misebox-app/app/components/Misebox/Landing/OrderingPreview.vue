<!-- The venue-owned Kiosk can stand alone; combined mode keeps it distinct from the guest-owned mobile Menu. -->
<template>
  <div
    v-if="kioskManifest && mobileManifest"
    class="landing-ordering-preview"
    :data-surface="mode"
    :aria-label="previewAriaLabel"
  >
    <div class="landing-ordering-preview__stage">
      <div class="landing-ordering-preview__scene">
        <div v-if="mode === 'mobile'" class="landing-ordering-preview__guest">
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

        <article
          v-else-if="mode === 'kiosk'"
          class="landing-ordering-preview__surface landing-ordering-preview__surface--kiosk"
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

        <article
          v-else-if="mode === 'staff-pos'"
          class="landing-ordering-preview__surface landing-ordering-preview__surface--staff-pos"
        >
          <header>
            <span>
              <UIcon name="i-lucide-monitor" aria-hidden="true" />
              Staff POS
            </span>
            <small>Operator ordering</small>
          </header>

          <div
            class="landing-ordering-preview__staff-pos"
            :class="mobileThemeClassName"
            :style="mobileThemeStyleVars"
          >
            <MenuDetailStaffPos
              :view="staffPosView"
              @update:selected-choice="staffPosChoice = $event"
            />
          </div>
        </article>

        <div v-else class="landing-ordering-preview__console">
          <MiseboxLandingConsolePreview />
        </div>
      </div>
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
import type { MenuDetailView } from 'fireux-kitchens/runtime/composables/fireux/kitchen/order/funnel/shared/useFunnel'
import type {
  MiseboxProductDemo,
  MiseboxProductDemoKiosk,
} from '../../../composables/product-demo/useMiseboxProductDemo'

const { mode = 'mobile' } = defineProps<{
  mode?: 'console' | 'kiosk' | 'mobile' | 'staff-pos'
}>()

type PreviewMenuSection =
  MiseboxProductDemo['ordering']['manifest']['content']['sections'][number]

const { data: productDemo, error } = await useMiseboxProductDemo()
const kioskManifest = computed(
  () =>
    productDemo.value?.kiosk.kitchens.find(
      (kitchen: MiseboxProductDemoKiosk) =>
        kitchen.id === productDemo.value?.kiosk.defaultId
    )?.manifest || null
)
const mobileManifest = computed(
  () => productDemo.value?.ordering.manifest || null
)
const staffPosChoice = ref('eat_in')
const staffPosView = computed<MenuDetailView | null>(() => {
  if (!mobileManifest.value) return null

  return {
    menu: mobileManifest.value,
    choices: [
      { value: 'eat_in', label: 'Eat in', orderType: 'eat_in' },
      { value: 'takeaway', label: 'Take away', orderType: 'takeaway' },
    ],
    surfaceOptions: [],
    surfaceLabel: 'Staff POS',
    selectedChoice: staffPosChoice.value,
    selectedItemId: '',
    orderMode: true,
    dimmed: false,
  }
})
const previewAriaLabel = computed(() => {
  if (mode === 'mobile') return 'Preview of a mobile ordering menu'
  if (mode === 'kiosk') return 'Preview of a self-service ordering kiosk'
  if (mode === 'staff-pos') return 'Preview of Staff POS ordering'
  return 'Preview of the Kitchen Console'
})
const kioskPreviewSections = computed(() =>
  (kioskManifest.value?.content.sections || [])
    .slice(0, 3)
    .map((section: PreviewMenuSection) => ({
      ...section,
      items: section.items.slice(0, mode === 'kiosk' ? 2 : 1),
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
const { className: kioskThemeClassName, styleVars: kioskThemeStyleVars } =
  useMenuThemeSurface({
    pageStyle: computed(() => kioskManifest.value?.presentation.pageStyle),
    colorMode: 'light',
  })
const { className: mobileThemeClassName, styleVars: mobileThemeStyleVars } =
  useMenuThemeSurface({
    pageStyle: computed(() => mobileManifest.value?.presentation.pageStyle),
    colorMode: 'light',
  })
</script>

<style scoped src="./ordering-preview.css"></style>
