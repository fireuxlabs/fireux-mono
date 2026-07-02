<template>
  <main class="min-h-screen bg-muted/30 py-10">
    <UContainer class="max-w-3xl space-y-6">
      <section class="space-y-3">
        <p class="text-xs font-bold uppercase tracking-[0.2em] text-primary">
          Misebox ordering
        </p>
        <h1 class="text-4xl font-black tracking-tight text-highlighted">
          Ordering funnels
        </h1>
        <p class="text-muted">
          Start with delivery. We can add the other funnel pages once this one
          feels right.
        </p>
      </section>

      <UCard>
        <div class="flex items-center justify-between gap-4">
          <div>
            <h2 class="text-xl font-bold">
              Delivery
            </h2>
            <p class="text-sm text-muted">
              Basket, allergy check, delivery area, fulfilment, review, payment.
            </p>
          </div>
          <UButton
            to="/ordering/delivery"
            color="primary"
            trailing-icon="i-lucide-arrow-right"
          >
            Open
          </UButton>
        </div>
      </UCard>
    </UContainer>
  </main>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'landing',
  name: 'MiseboxOrderingPage',
})

useSeoMeta({
  title: 'Online Ordering · Misebox',
  description:
    'Learn how Misebox turns menu baskets into delivery, takeaway, table ordering, catering, room service, and marketplace operations.',
})
</script>
