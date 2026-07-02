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
          On-premise funnel
        </p>
        <h1 class="text-4xl font-black tracking-tight text-highlighted">
          Dine-in ordering
        </h1>
        <p class="text-muted">
          Table, bar, and counter ordering where the customer is already in the
          venue and the kitchen needs clear context before fulfilment.
        </p>
      </section>

      <UCard :ui="{ body: 'space-y-4' }">
        <h2 class="text-2xl font-black tracking-tight">
          Screen stack
        </h2>
        <ol class="list-decimal space-y-2 pl-5 text-muted">
          <li>Basket</li>
          <li>Allergy check</li>
          <li>Table or service context</li>
          <li>Send to kitchen</li>
          <li>Tab or payment</li>
          <li>Confirmation</li>
        </ol>
      </UCard>
    </UContainer>
  </main>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'landing',
  name: 'MiseboxOrderingDineInPage',
})

useSeoMeta({
  title: 'Dine-in Ordering · Misebox',
  description:
    'Misebox dine-in ordering for tables, bars, counters, tabs, and in-venue kitchen fulfilment.',
})
</script>
