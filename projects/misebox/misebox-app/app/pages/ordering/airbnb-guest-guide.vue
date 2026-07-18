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
          Guest guide funnel
        </p>
        <h1 class="text-4xl font-black tracking-tight text-highlighted">
          Airbnb guest guide ordering
        </h1>
        <p class="text-muted">
          Bueno Host-style local guest recommendations that can turn into meal
          deals, group food delivery, meal prep, or private chef requests.
        </p>
      </section>

      <UCard :ui="{ body: 'space-y-4' }">
        <h2 class="text-2xl font-black tracking-tight">
          Screen stack
        </h2>
        <ol class="list-decimal fx-list-stack text-muted">
          <li>Guest guide context</li>
          <li>Local food recommendations</li>
          <li>Meal deal or private chef choice</li>
          <li>Address and stay details</li>
          <li>Partner confirmation</li>
          <li>Payment or enquiry confirmation</li>
        </ol>
      </UCard>
    </UContainer>
  </main>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'landing',
  name: 'MiseboxOrderingAirbnbGuestGuidePage',
})

useSeoMeta({
  title: 'Airbnb Guest Guide Ordering · Misebox',
  description:
    'Misebox and Bueno Host guest guide ordering for local meal deals, group food delivery, meal prep, and private chefs.',
})
</script>
