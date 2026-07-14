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

      <div class="space-y-3">
        <h1 class="text-4xl font-bold tracking-tight text-highlighted sm:text-6xl">
          Hotel Bären Ringgenberg
        </h1>
        <p class="max-w-2xl text-lg text-muted">
          Hotel, restaurant and bar in Ringgenberg. Browse the existing Bären menu or find the venue.
        </p>
      </div>

      <div class="flex flex-wrap gap-3">
        <UButton to="/hotel" size="xl" icon="i-lucide-bed-double">Hotel</UButton>
        <UButton to="/menu" size="xl" color="neutral" variant="outline" icon="i-lucide-utensils">Menu</UButton>
        <UButton to="/events" size="xl" color="neutral" variant="outline" icon="i-lucide-calendar-days">Events</UButton>
        <UButton to="/location" size="xl" color="neutral" variant="ghost" icon="i-lucide-map-pin">Location</UButton>
      </div>
    </section>

    <div class="grid gap-4 md:grid-cols-3">
      <UPageCard title="Hotel" description="37 guest rooms close to Lake Brienz and Interlaken." to="/hotel" icon="i-lucide-bed-double" />
      <UPageCard title="Restaurant and bar" description="Regional cooking, pizza, snacks and drinks." to="/menu" icon="i-lucide-utensils" />
      <UPageCard title="Events" description="Weddings, celebrations, meetings and live events." to="/events" icon="i-lucide-calendar-days" />
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
