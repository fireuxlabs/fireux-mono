<template>
  <main class="min-h-screen bg-muted/30 py-10">
    <UContainer class="max-w-3xl space-y-6">
      <UButton
        to="/ordering"
        color="neutral"
        variant="soft"
        icon="i-lucide-arrow-left"
      >
        Ordering
      </UButton>

      <section class="space-y-3">
        <p class="text-xs font-bold uppercase tracking-[0.2em] text-primary">
          Delivery funnel
        </p>
        <h1 class="text-4xl font-black tracking-tight text-highlighted">
          Delivery ordering
        </h1>
        <p class="text-muted">
          Customer orders from home, confirms address coverage, agrees the
          delivery handoff, then pays once the kitchen timing is clear.
        </p>
      </section>

      <UCard :ui="{ body: 'space-y-4' }">
        <h2 class="text-2xl font-black tracking-tight">
          Screen stack
        </h2>
        <ol class="list-decimal space-y-2 pl-5 text-muted">
          <li>Basket</li>
          <li>Allergy check</li>
          <li>Delivery address</li>
          <li>Delivery zone</li>
          <li>Kitchen timing</li>
          <li>Review</li>
          <li>Payment</li>
        </ol>
      </UCard>
    </UContainer>
  </main>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'landing',
  name: 'MiseboxOrderingDeliveryPage',
})

useSeoMeta({
  title: 'Delivery Ordering · Misebox',
  description:
    'Misebox delivery ordering for home orders, address coverage, delivery zones, kitchen timing, and online payment.',
})
</script>
