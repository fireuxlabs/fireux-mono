<!-- Concurrent edit — 2026-07-22 12:41 CEST — Product Demo app pass: host the full-viewport local-only Kiosk demonstration. -->
<!-- Concurrent edit — 2026-07-22 13:11 CEST — Demo Kitchen identity pass: identify Misebox Restaurant as the default Kiosk demonstration. -->
<!-- Concurrent edit — 2026-07-22 13:48 CEST — Kiosk Demo selector pass: switch the local preview between both Demo Kitchens. -->
<!-- Concurrent edit — 2026-07-22 13:56 CEST — Kiosk theme contrast pass: apply the selected restaurant's distinct presentation profile. -->
<!-- Concurrent edit — 2026-07-22 14:49 CEST — Demo Kiosk entry verification: retain the typed Demo Kitchen selector during direct catalogue entry. -->
<!-- Concurrent edit — 2026-07-22 17:11 CEST — Exact viewport preview: restore the selected Kitchen in a toolbar-free 1080 × 1920 popup. -->
<!-- Concurrent edit — 2026-07-22 17:34 CEST — Portable portrait stage: only resize genuine detached windows; modal previews retain their isolated viewport. -->
<!-- Concurrent edit — 2026-07-23 08:58 CEST — Firefox popup pass: let the opener size the window and scale the exact logical viewport inside it. -->
<template>
  <ShowcaseKiosk
    v-if="activeKiosk && productDemo"
    v-model:kitchen-id="activeKioskId"
    :appearance="activeKiosk.appearance"
    :embedded-preview="embeddedPreview"
    :kitchens="productDemo.kiosk.kitchens"
    :manifest="activeKiosk.manifest"
    :next-order-number="activeKiosk.nextOrderNumber"
    :scope-key="activeKiosk.scopeKey"
    :standalone-preview="standalonePreview"
  />

  <main v-else class="product-demo-kiosk-error">
    <UAlert
      color="error"
      variant="soft"
      icon="i-lucide-triangle-alert"
      title="The Kiosk demo could not be prepared"
      description="No Order was created and no live data was touched."
    />
    <UButton to="/demo" color="neutral" variant="soft" icon="i-lucide-arrow-left">
      All demos
    </UButton>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { MiseboxProductDemoKiosk } from '../../composables/product-demo/useMiseboxProductDemo'

const { data: productDemo } = await useMiseboxProductDemo()
const route = useRoute()
const requestedKioskId = typeof route.query.kitchen === 'string'
  ? route.query.kitchen
  : ''
const requestedKioskExists = productDemo.value?.kiosk.kitchens.some(
  (kitchen: MiseboxProductDemoKiosk) => kitchen.id === requestedKioskId
)
const activeKioskId = ref(
  requestedKioskExists
    ? requestedKioskId
    : productDemo.value?.kiosk.defaultId || ''
)
const standalonePreview = computed(() => route.query.viewport === '1080x1920')
const embeddedPreview = computed(() => route.query.embedded === '1')
const activeKiosk = computed(() => {
  const kitchens = productDemo.value?.kiosk.kitchens || []

  return kitchens.find((kitchen: MiseboxProductDemoKiosk) =>
    kitchen.id === activeKioskId.value
  )
    || kitchens[0]
    || null
})

definePageMeta({
  layout: false,
  name: 'MiseboxProductDemoKioskPage',
})

useSeoMeta({
  title: 'Restaurant Kiosk Demo · Misebox',
  description:
    'Compare three Kitchen themes in one touch-first, local-only Kiosk demo.',
})
</script>

<style scoped>
.product-demo-kiosk-error {
  display: grid;
  min-height: 100vh;
  min-height: 100svh;
  place-items: center;
  align-content: center;
  gap: calc(var(--spacing) * 4);
  padding: calc(var(--spacing) * 4);
  background: var(--ui-bg);
}
</style>
