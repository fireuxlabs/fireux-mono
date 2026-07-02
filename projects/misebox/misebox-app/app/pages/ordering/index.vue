<template>
  <main class="min-h-screen bg-muted/30 py-10">
    <UContainer class="max-w-5xl space-y-8">
      <section class="space-y-4">
        <p class="text-xs font-bold uppercase tracking-[0.2em] text-primary">
          Misebox ordering
        </p>
        <h1 class="max-w-3xl text-4xl font-black tracking-tight text-highlighted sm:text-5xl">
          Customer funnels that turn menus into operations.
        </h1>
        <p class="max-w-3xl text-muted">
          Start with the order journey the customer understands, then let
          Misebox coordinate the kitchen, payment, timing, and handoff behind
          the scenes.
        </p>
        <div class="flex flex-wrap gap-3">
          <UButton
            to="/ordering/delivery"
            color="primary"
            trailing-icon="i-lucide-arrow-right"
          >
            Explore delivery
          </UButton>
          <UButton
            to="/ordering/pre-order"
            color="neutral"
            variant="soft"
          >
            View pre-order
          </UButton>
        </div>
      </section>

      <section class="grid gap-4 lg:grid-cols-2">
        <UCard
          v-for="doorway in featuredDoorways"
          :key="doorway.to"
          :ui="{ body: 'flex h-full flex-col gap-4' }"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="space-y-2">
              <p class="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                {{ doorway.family }}
              </p>
              <h2 class="text-2xl font-black tracking-tight text-highlighted">
                {{ doorway.title }}
              </h2>
            </div>
            <UIcon
              :name="doorway.icon"
              class="size-6 text-primary"
            />
          </div>

          <p class="text-sm text-muted">
            {{ doorway.description }}
          </p>

          <UButton
            :to="doorway.to"
            color="primary"
            variant="soft"
            trailing-icon="i-lucide-arrow-right"
            class="mt-auto justify-center"
          >
            Open {{ doorway.title }}
          </UButton>
        </UCard>
      </section>

      <section class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <UCard
          v-for="doorway in secondaryDoorways"
          :key="doorway.to"
          :ui="{ body: 'space-y-3' }"
        >
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                {{ doorway.family }}
              </p>
              <h2 class="text-xl font-bold text-highlighted">
                {{ doorway.title }}
              </h2>
            </div>
            <UIcon
              :name="doorway.icon"
              class="size-5 text-muted"
            />
          </div>
          <p class="text-sm text-muted">
            {{ doorway.description }}
          </p>
          <UButton
            :to="doorway.to"
            color="neutral"
            variant="ghost"
            trailing-icon="i-lucide-arrow-right"
          >
            Open
          </UButton>
        </UCard>
      </section>
    </UContainer>
  </main>
</template>

<script setup lang="ts">
const doorways = [
  {
    description: 'Basket, allergy check, delivery zone, kitchen timing, driver tender, payment.',
    family: 'Delivery',
    icon: 'i-lucide-bike',
    title: 'Delivery',
    to: '/ordering/delivery',
  },
  {
    description: 'Basket, allergy check, schedule, kitchen acceptance, deposit or payment.',
    family: 'Scheduled',
    icon: 'i-lucide-calendar-clock',
    title: 'Pre-order',
    to: '/ordering/pre-order',
  },
  {
    description: 'Basket, allergy check, pickup rendezvous, kitchen timing, payment.',
    family: 'Pickup',
    icon: 'i-lucide-shopping-bag',
    title: 'Collection',
    to: '/ordering/collection',
  },
  {
    description: 'Basket, allergy check, table context, send to kitchen, tab or payment.',
    family: 'On-premise',
    icon: 'i-lucide-utensils',
    title: 'Dine-in',
    to: '/ordering/dine-in',
  },
  {
    description: 'Basket, allergy check, room destination, kitchen timing, room charge or payment.',
    family: 'Delivery',
    icon: 'i-lucide-bed',
    title: 'Room service',
    to: '/ordering/room-service',
  },
  {
    description: 'Basket or package, event details, quote review, deposit, confirmation.',
    family: 'Scheduled',
    icon: 'i-lucide-party-popper',
    title: 'Catering',
    to: '/ordering/catering',
  },
  {
    description: 'Recurring meals, prep bundles, diet notes, delivery or pickup scheduling.',
    family: 'Recurring',
    icon: 'i-lucide-package-check',
    title: 'Meal prep',
    to: '/ordering/meal-prep',
  },
  {
    description: 'Misebox-style external channel ordering with kitchen and driver coordination.',
    family: 'Marketplace',
    icon: 'i-lucide-store',
    title: 'Marketplace order',
    to: '/ordering/marketplace-order',
  },
  {
    description: 'Bueno Host-style guest guide with local food offers and private chef options.',
    family: 'Guest stay',
    icon: 'i-lucide-house-plus',
    title: 'Airbnb guest guide',
    to: '/ordering/airbnb-guest-guide',
  },
]

const featuredDoorways = doorways.slice(0, 2)
const secondaryDoorways = doorways.slice(2)

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
