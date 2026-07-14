<template>
  <div class="space-y-10 py-12 sm:py-20">
    <section class="max-w-3xl space-y-6">
      <div class="flex size-24 items-center justify-center rounded-2xl border border-default bg-white p-2 shadow-sm">
        <img
          src="/img/brand/baeren-mark.svg"
          alt="Hotel Bären Ringgenberg"
          class="size-full object-contain"
        >
      </div>

      <UBadge color="primary" variant="subtle">Misebox tenant</UBadge>

      <div class="space-y-3">
        <h1 class="text-4xl font-bold tracking-tight text-highlighted sm:text-6xl">
          Hotel Bären Ringgenberg
        </h1>
        <p class="max-w-2xl text-lg text-muted">
          Hotel, restaurant and bar in Ringgenberg. Browse the existing Bären menu or find the venue.
        </p>
      </div>

      <div class="flex flex-wrap gap-3">
        <UButton to="/menu" size="xl" icon="i-lucide-utensils">View menu</UButton>
        <UButton to="/blog" size="xl" color="neutral" variant="outline" icon="i-lucide-newspaper">Blog</UButton>
        <UButton to="/info" size="xl" color="neutral" variant="outline" icon="i-lucide-info">Information</UButton>
        <UButton to="/location" size="xl" color="neutral" variant="ghost" icon="i-lucide-map-pin">Location</UButton>
      </div>
    </section>

    <div class="grid gap-4 md:grid-cols-3">
      <UCard>
        <template #header><strong>Existing kitchen</strong></template>
        The app uses the established Bären kitchen in Misebox.
      </UCard>
      <UCard>
        <template #header><strong>Published menu</strong></template>
        Pizza, snacks and drinks come from the live menu record.
      </UCard>
      <UCard>
        <template #header><strong>Ringgenberg</strong></template>
        Hauptstrasse 128, 3852 Ringgenberg.
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  nav: {
    key: 'home',
    label: 'Home',
    icon: 'i-lucide-house',
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
})

useSeoMeta({
  title: 'Hotel Bären Ringgenberg',
  description: 'Menu and venue information for Hotel Bären Ringgenberg.',
})
</script>
