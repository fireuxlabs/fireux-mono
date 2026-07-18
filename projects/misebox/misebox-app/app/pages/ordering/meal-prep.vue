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
          Meal prep funnel
        </p>
        <h1 class="fx-type-page-title text-4xl font-black tracking-tight">
          Meal prep ordering
        </h1>
        <p class="text-muted">
          Meal prep and mise en place hampers for customers who want recurring
          prepared food without being locked to one provider.
        </p>
      </section>

      <OrderingScreenStack
        :steps="[
          'Meal bundle or basket',
          'Diet and allergy check',
          'Schedule',
          'Delivery or collection',
          'Subscription or payment',
          'Confirmation',
        ]"
      />
    </UContainer>
  </main>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'landing',
  name: 'MiseboxOrderingMealPrepPage',
})

useSeoMeta({
  title: 'Meal Prep Ordering · Misebox',
  description:
    'Misebox meal prep ordering for recurring prepared meals, mise en place hampers, diet notes, delivery, and pickup.',
})
</script>
