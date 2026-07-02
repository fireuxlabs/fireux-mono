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
          Marketplace funnel
        </p>
        <h1 class="text-4xl font-black tracking-tight text-highlighted">
          Marketplace ordering
        </h1>
        <p class="text-muted">
          Uber Eats, Just Eat, and Misebox-style ordering where the customer,
          kitchen, marketplace, and driver all need coordinated state.
        </p>
      </section>

      <UCard :ui="{ body: 'space-y-4' }">
        <h2 class="text-2xl font-black tracking-tight">
          Screen stack
        </h2>
        <ol class="list-decimal space-y-2 pl-5 text-muted">
          <li>Basket</li>
          <li>Allergy check</li>
          <li>Destination or pickup choice</li>
          <li>Kitchen and driver coordination</li>
          <li>Payment</li>
          <li>Tracking confirmation</li>
        </ol>
      </UCard>
    </UContainer>
  </main>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'landing',
  name: 'MiseboxOrderingMarketplaceOrderPage',
})

useSeoMeta({
  title: 'Marketplace Ordering · Misebox',
  description:
    'Misebox marketplace ordering for restaurants, delivery drivers, customer payment, and order tracking.',
})
</script>
