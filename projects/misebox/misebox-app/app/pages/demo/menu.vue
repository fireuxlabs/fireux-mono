<template>
  <main class="product-demo-page" data-misebox-product-demo="menu">
    <ShowcaseHeader
      eyebrow="Guest view"
      title="Misebox Restaurant Menu"
      description="Explore a fictional restaurant through Misebox’s read-only guest Menu presentation."
    />

    <UAlert
      v-if="error"
      color="error"
      variant="soft"
      icon="i-lucide-triangle-alert"
      title="The Menu demo could not be prepared"
      description="No live data was touched. Return to the demo index and try again."
    />

    <ShowcaseMenu
      v-else-if="productDemo"
      :manifest="productDemo.menu.manifest"
    />

    <nav
      class="product-demo-page__next"
      aria-label="Continue through the Product Demo"
    >
      <UButton
        to="/demo"
        color="neutral"
        variant="soft"
        icon="i-lucide-layout-grid"
      >
        All demos
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
