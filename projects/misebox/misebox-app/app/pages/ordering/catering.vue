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
          Scheduled funnel
        </p>
        <h1 class="text-4xl font-black tracking-tight text-highlighted">
          Catering ordering
        </h1>
        <p class="text-muted">
          Event-led ordering where basket, headcount, date, location, quote,
          and deposit need to come together before confirmation.
        </p>
      </section>

      <UCard :ui="{ body: 'space-y-4' }">
        <h2 class="text-2xl font-black tracking-tight">
          Screen stack
        </h2>
        <ol class="list-decimal space-y-2 pl-5 text-muted">
          <li>Basket or package</li>
          <li>Allergy check</li>
          <li>Event details</li>
          <li>Quote review</li>
          <li>Deposit or payment</li>
          <li>Confirmation</li>
        </ol>
      </UCard>
    </UContainer>
  </main>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'landing',
  name: 'MiseboxOrderingCateringPage',
})

useSeoMeta({
  title: 'Catering Ordering · Misebox',
  description:
    'Misebox catering ordering for events, group menus, quotes, deposits, and kitchen acceptance.',
})
</script>
