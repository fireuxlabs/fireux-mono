<!-- Concurrent edit — 2026-07-22 12:41 CEST — Product Demo app pass: compose Demo Orders into the local canonical Kitchen service board. -->
<!-- Concurrent edit — 2026-07-22 13:11 CEST — Demo Kitchen identity pass: identify Deanos Smash Burger as the focused service demonstration. -->
<template>
  <main class="product-demo-page" data-misebox-product-demo="service">
    <ShowcaseHeader
      eyebrow="Kitchen team"
      title="Preview Deanos’ order board"
      description="Try the Incoming, Queue and Pass views with fictional orders. Changes stay in this preview and Reset preview restores the sample tickets."
    >
      <template #actions>
        <UButton
          to="/demo/menu"
          color="neutral"
          variant="soft"
          icon="i-lucide-book-open"
        >
          Guest Menu
        </UButton>
        <UButton
          to="/demo/kiosk"
          color="primary"
          icon="i-lucide-monitor-smartphone"
        >
          Kiosk
        </UButton>
      </template>
    </ShowcaseHeader>

    <UAlert
      v-if="error"
      color="error"
      variant="soft"
      icon="i-lucide-triangle-alert"
      title="The order board preview could not be prepared"
      description="No Kitchen data or Orders were changed."
    />

    <ShowcaseService
      v-else-if="productDemo"
      :initial-orders="productDemo.service.orders"
      :kitchen-name="productDemo.service.kitchenName"
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
      <UButton
        to="/demo/menu"
        color="primary"
        trailing-icon="i-lucide-arrow-right"
      >
        Return to the guest Menu
      </UButton>
    </nav>
  </main>
</template>

<script setup lang="ts">
const { data: productDemo, error } = await useMiseboxProductDemo()

definePageMeta({
  layout: 'landing',
  name: 'MiseboxProductDemoServicePage',
})

useSeoMeta({
  title: 'Deanos Order Board Preview · Misebox',
  description:
    'Try Incoming, Queue and Pass with fictional Kitchen orders. No order is submitted and no payment is taken.',
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
  width: min(100%, 88rem);
  margin: 0 auto;
}
</style>
