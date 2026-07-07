<template>
  <main class="min-h-screen bg-muted/30 py-10">
    <UContainer class="max-w-6xl space-y-6">
      <section>
        <p class="text-xs font-bold uppercase tracking-[0.2em] text-primary">
          Misebox
        </p>
        <h1 class="mt-2 text-4xl font-black tracking-tight text-highlighted sm:text-5xl">
          Ordering
        </h1>
      </section>

      <section class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <UCard
          v-for="entry in orderingEntries"
          :key="entry.to"
          :ui="{ body: 'flex h-full flex-col gap-3' }"
        >
          <div class="flex items-start justify-between gap-3">
            <UButton
              :to="entry.to"
              color="neutral"
              variant="ghost"
              trailing-icon="i-lucide-arrow-right"
              class="justify-between px-0 text-base font-black text-highlighted"
            >
              {{ entry.title }}
            </UButton>

            <UIcon
              :name="entry.icon"
              class="mt-1 size-5 shrink-0 text-primary"
            />
          </div>

          <p class="text-sm leading-5 text-muted">
            {{ entry.description }}
          </p>
        </UCard>
      </section>
    </UContainer>
  </main>
</template>

<script setup lang="ts">
type OrderingEntry = {
  title: string
  description: string
  icon: string
  to: string
}

const orderingEntries: OrderingEntry[] = [
  {
    title: 'Delivery',
    description: 'Guests order from home and receive the order at an address.',
    icon: 'i-lucide-truck',
    to: '/ordering/delivery',
  },
  {
    title: 'Collection',
    description: 'Guests order from home and pick up from the venue.',
    icon: 'i-lucide-package-check',
    to: '/ordering/collection',
  },
  {
    title: 'Dine in',
    description: 'Guests order on premises and are served at the table.',
    icon: 'i-lucide-utensils',
    to: '/ordering/dine-in',
  },
  {
    title: 'Take away',
    description: 'Guests order on premises and take the order away.',
    icon: 'i-lucide-shopping-bag',
    to: '/ordering/take-away',
  },
  {
    title: 'Pre-order',
    description: 'Guests order ahead for a confirmed later time.',
    icon: 'i-lucide-calendar-clock',
    to: '/ordering/pre-order',
  },
  {
    title: 'Room service',
    description: 'Guests order to a room inside a hotel or venue.',
    icon: 'i-lucide-concierge-bell',
    to: '/ordering/room-service',
  },
]

/*
Future ordering-adjacent ideas, held until they earn a page:
- Meal prep: /ordering/meal-prep
- Marketplace order: /ordering/marketplace-order
- Airbnb guest guide: /ordering/airbnb-guest-guide
*/

definePageMeta({
  layout: 'landing',
  name: 'MiseboxOrderingPage',
})

useSeoMeta({
  title: 'Ordering · Misebox',
  description:
    'Misebox ordering modes for delivery, collection, dine in, take away, pre-order, and room service workflows.',
})
</script>
