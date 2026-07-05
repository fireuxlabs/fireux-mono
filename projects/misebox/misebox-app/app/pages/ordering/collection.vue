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
          Collection funnel
        </p>
        <h1 class="text-4xl font-black tracking-tight text-highlighted">
          Collection ordering
        </h1>
        <p class="text-muted">
          Customer orders before arriving, acknowledges allergies, agrees a
          pickup rendezvous, then pays once the kitchen timing is clear.
        </p>
      </section>

      <UCard :ui="{ body: 'space-y-4' }">
        <h2 class="text-2xl font-black tracking-tight">
          Screen stack
        </h2>
        <ol class="list-decimal space-y-2 pl-5 text-muted">
          <li>Basket</li>
          <li>Allergy check</li>
          <li>Collection rendezvous</li>
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
  name: 'MiseboxOrderingCollectionPage',
})

useSeoMeta({
  title: 'Collection Ordering · Misebox',
  description:
    'Misebox collection ordering for remote pickup, kitchen timing, customer pickup slots, and online payment.',
})
</script>
