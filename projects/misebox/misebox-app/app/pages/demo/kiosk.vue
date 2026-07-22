<!-- Concurrent edit — 2026-07-22 12:41 CEST — Product Demo app pass: host the full-viewport local-only Kiosk demonstration. -->
<!-- Concurrent edit — 2026-07-22 13:11 CEST — Demo Kitchen identity pass: identify Misebox Restaurant as the default Kiosk demonstration. -->
<!-- Concurrent edit — 2026-07-22 13:48 CEST — Kiosk Demo selector pass: switch the local preview between both Demo Kitchens. -->
<!-- Concurrent edit — 2026-07-22 13:56 CEST — Kiosk theme contrast pass: apply the selected restaurant's distinct presentation profile. -->
<!-- Concurrent edit — 2026-07-22 14:49 CEST — Demo Kiosk entry verification: retain the typed Demo Kitchen selector during direct catalogue entry. -->
<template>
  <MiseboxShowcaseKiosk
    v-if="activeKiosk && productDemo"
    v-model:kitchen-id="activeKioskId"
    :appearance="activeKiosk.appearance"
    :kitchens="productDemo.kiosk.kitchens"
    :manifest="activeKiosk.manifest"
    :next-order-number="activeKiosk.nextOrderNumber"
    :scope-key="activeKiosk.scopeKey"
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
const activeKioskId = ref(productDemo.value?.kiosk.defaultId || '')
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
    'Compare the Misebox Restaurant and Deanos Smash Burger themes in one touch-first, local-only Kiosk demo.',
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
