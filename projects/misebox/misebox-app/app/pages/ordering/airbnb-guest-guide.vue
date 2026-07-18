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
          Guest guide funnel
        </p>
        <h1 class="fx-type-page-title text-4xl font-black tracking-tight">
          Airbnb guest guide ordering
        </h1>
        <p class="text-muted">
          Bueno Host-style local guest recommendations that can turn into meal
          deals, group food delivery, meal prep, or private chef requests.
        </p>
      </section>

      <OrderingScreenStack
        :steps="[
          'Guest guide context',
          'Local food recommendations',
          'Meal deal or private chef choice',
          'Address and stay details',
          'Partner confirmation',
          'Payment or enquiry confirmation',
        ]"
      />
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
