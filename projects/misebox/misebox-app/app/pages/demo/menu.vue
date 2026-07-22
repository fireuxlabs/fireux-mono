<!-- Concurrent edit — 2026-07-22 12:41 CEST — Product Demo app pass: compose the featured Demo World through the real Menu surface. -->
<!-- Concurrent edit — 2026-07-22 13:11 CEST — Demo Kitchen identity pass: identify Misebox Restaurant as the default guest demonstration. -->
<template>
  <main class="product-demo-page" data-misebox-product-demo="menu">
    <MiseboxShowcaseHeader
      eyebrow="Guest view"
      title="Misebox Restaurant Menu"
      description="Explore the polished default Demo Kitchen through the responsive guest-facing Menu presentation, without live or Test data."
    >
      <template #actions>
        <UButton to="/demo/kiosk" color="primary" trailing-icon="i-lucide-arrow-right">
          Try the Kiosk
        </UButton>
      </template>
    </MiseboxShowcaseHeader>

    <UAlert
      v-if="error"
      color="error"
      variant="soft"
      icon="i-lucide-triangle-alert"
      title="The Menu demo could not be prepared"
      description="No live data was touched. Return to the demo index and try again."
    />

    <MiseboxShowcaseMenu
      v-else-if="productDemo"
      :manifest="productDemo.menu.manifest"
    />

    <nav class="product-demo-page__next" aria-label="Continue through the Product Demo">
      <UButton to="/demo" color="neutral" variant="soft" icon="i-lucide-layout-grid">
        All demos
      </UButton>
      <UButton to="/demo/kiosk" color="primary" trailing-icon="i-lucide-arrow-right">
        Order at the Kiosk
      </UButton>
    </nav>
  </main>
</template>

<script setup lang="ts">
const { data: productDemo, error } = await useMiseboxProductDemo()

definePageMeta({
  layout: 'landing',
  name: 'MiseboxProductDemoMenuPage',
})

useSeoMeta({
  title: 'Misebox Restaurant Menu Demo · Misebox',
  description:
    'Explore the responsive Misebox guest Menu with photographed and image-free dishes in a safe Product Demo.',
})
</script>

<style scoped>
.product-demo-page {
  display: grid;
  gap: clamp(calc(var(--spacing) * 8), 5vw, calc(var(--spacing) * 16));
  padding: clamp(calc(var(--spacing) * 4), 4vw, calc(var(--spacing) * 12)) 0
    clamp(calc(var(--spacing) * 12), 7vw, calc(var(--spacing) * 24));
}

.product-demo-page__next {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: calc(var(--spacing) * 3);
  width: min(100%, 72rem);
  margin: 0 auto;
}
</style>
