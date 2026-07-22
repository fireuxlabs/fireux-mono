<!-- Concurrent edit — 2026-07-22 12:41 CEST — Product Demo app pass: host the full-viewport local-only Kiosk demonstration. -->
<!-- Concurrent edit — 2026-07-22 13:11 CEST — Demo Kitchen identity pass: identify Misebox Restaurant as the default Kiosk demonstration. -->
<template>
  <MiseboxShowcaseKiosk
    v-if="productDemo"
    :manifest="productDemo.kiosk.manifest"
    :next-order-number="productDemo.kiosk.nextOrderNumber"
    :scope-key="productDemo.kiosk.scopeKey"
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
const { data: productDemo } = await useMiseboxProductDemo()

definePageMeta({
  layout: false,
  name: 'MiseboxProductDemoKioskPage',
})

useSeoMeta({
  title: 'Misebox Restaurant Kiosk Demo · Misebox',
  description:
    'Try the touch-first Misebox Restaurant Kiosk with Eat here, Take away and a local-only basket.',
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
