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
        <p class="fx-type-headline">
          Marketplace funnel
        </p>
        <h1 class="fx-type-page-title text-4xl font-black tracking-tight">
          Marketplace ordering
        </h1>
        <p class="text-muted">
          Uber Eats, Just Eat, and Misebox-style ordering where the customer,
          kitchen, marketplace, and driver all need coordinated state.
        </p>
      </section>

      <OrderingScreenStack
        :steps="[
          'Basket',
          'Allergy check',
          'Destination or pickup choice',
          'Kitchen and driver coordination',
          'Payment',
          'Tracking confirmation',
        ]"
      />
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
