<template>
  <main class="min-h-screen overflow-hidden bg-[#eef6f2] text-[#14231e]">
    <section class="relative">
      <div class="absolute inset-0 -z-10">
        <div class="absolute left-[-8rem] top-[-10rem] size-80 rounded-full bg-[#ffd166]/55 blur-3xl" />
        <div class="absolute right-[-7rem] top-20 size-96 rounded-full bg-[#4ecdc4]/35 blur-3xl" />
        <div class="absolute bottom-[-12rem] left-1/3 size-96 rounded-full bg-[#ff6b6b]/20 blur-3xl" />
      </div>

      <UContainer class="max-w-6xl py-12 sm:py-16">
        <div class="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
          <section class="space-y-6">
            <p class="text-xs font-black uppercase tracking-[0.24em] text-[#0b7a75]">
              Misebox ordering
            </p>
            <h1 class="max-w-3xl text-5xl font-black tracking-[-0.08em] text-[#13201c] sm:text-7xl">
              Customer funnels that turn menus into operations.
            </h1>
            <p class="max-w-2xl text-lg font-semibold leading-8 text-[#4f635c]">
              Start with the order journey the customer understands, then let
              Misebox coordinate the kitchen, payment, timing, and handoff behind
              the scenes.
            </p>

            <div class="flex flex-wrap gap-3">
              <UButton
                to="/ordering/delivery"
                size="xl"
                color="primary"
                trailing-icon="i-lucide-arrow-right"
              >
                Explore delivery
              </UButton>
              <UButton
                to="/ordering/pre-order"
                size="xl"
                color="neutral"
                variant="soft"
              >
                View pre-order
              </UButton>
            </div>
          </section>

          <UCard
            class="border-[#13201c]/10 bg-white/72 shadow-2xl shadow-[#13201c]/10 backdrop-blur"
            :ui="{ body: 'space-y-5' }"
          >
            <p class="text-sm font-black uppercase tracking-[0.2em] text-[#0b7a75]">
              Current priority
            </p>
            <div class="space-y-3">
              <h2 class="text-3xl font-black tracking-[-0.06em]">
                Bären delivery first.
              </h2>
              <p class="font-semibold leading-7 text-[#5a6c65]">
                Delivery is the working edge: basket, allergy, delivery zone,
                kitchen timing, driver tender, payment, and tracking.
              </p>
            </div>
            <div class="grid grid-cols-3 gap-3 text-center">
              <div
                v-for="stat in stats"
                :key="stat.label"
                class="rounded-2xl bg-[#14231e]/[0.06] p-4"
              >
                <strong class="block text-2xl font-black">{{ stat.value }}</strong>
                <span class="text-xs font-bold uppercase tracking-[0.14em] text-[#667871]">
                  {{ stat.label }}
                </span>
              </div>
            </div>
          </UCard>
        </div>
      </section>

      <UContainer class="max-w-6xl pb-16">
        <section class="grid gap-4 lg:grid-cols-2">
          <UCard
            v-for="doorway in featuredDoorways"
            :key="doorway.to"
            class="group border-[#13201c]/10 bg-white/80 shadow-xl shadow-[#13201c]/5 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#13201c]/10"
            :ui="{ body: 'flex h-full flex-col gap-5' }"
          >
            <div class="flex items-start justify-between gap-4">
              <div
                class="grid size-12 place-items-center rounded-2xl text-xl text-white shadow-lg"
                :style="{ background: doorway.accent }"
              >
                <UIcon :name="doorway.icon" />
              </div>
              <span class="rounded-full bg-[#14231e]/[0.06] px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-[#536760]">
                {{ doorway.family }}
              </span>
            </div>

            <div class="space-y-3">
              <h2 class="text-3xl font-black tracking-[-0.06em]">
                {{ doorway.title }}
              </h2>
              <p class="font-semibold leading-7 text-[#5a6c65]">
                {{ doorway.description }}
              </p>
            </div>

            <UButton
              :to="doorway.to"
              color="neutral"
              variant="soft"
              trailing-icon="i-lucide-arrow-right"
              class="mt-auto justify-center"
            >
              Open {{ doorway.title }}
            </UButton>
          </UCard>
        </section>

        <section class="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <NuxtLink
            v-for="doorway in secondaryDoorways"
            :key="doorway.to"
            :to="doorway.to"
            class="group rounded-3xl border border-[#13201c]/10 bg-white/62 p-5 shadow-lg shadow-[#13201c]/[0.04] backdrop-blur transition hover:-translate-y-1 hover:bg-white/88 hover:shadow-xl hover:shadow-[#13201c]/10"
          >
            <div class="flex items-start gap-4">
              <div
                class="grid size-10 shrink-0 place-items-center rounded-2xl text-white"
                :style="{ background: doorway.accent }"
              >
                <UIcon :name="doorway.icon" />
              </div>
              <div class="min-w-0 space-y-2">
                <p class="text-xs font-black uppercase tracking-[0.16em] text-[#0b7a75]">
                  {{ doorway.family }}
                </p>
                <h2 class="text-xl font-black tracking-[-0.04em]">
                  {{ doorway.title }}
                </h2>
                <p class="text-sm font-semibold leading-6 text-[#667871]">
                  {{ doorway.description }}
                </p>
              </div>
            </div>
          </NuxtLink>
        </section>
      </UContainer>
    </section>
  </main>
</template>

<script setup lang="ts">
const stats = [
  { label: 'shared', value: '4' },
  { label: 'families', value: '5' },
  { label: 'doors', value: '9' },
]

const doorways = [
  {
    accent: 'linear-gradient(135deg, #ff6b35, #f7b801)',
    description: 'Basket, allergy check, delivery zone, kitchen timing, driver tender, payment.',
    family: 'Delivery',
    icon: 'i-lucide-bike',
    title: 'Delivery',
    to: '/ordering/delivery',
  },
  {
    accent: 'linear-gradient(135deg, #9c2c18, #e99f5e)',
    description: 'Basket, allergy check, schedule, kitchen acceptance, deposit or payment.',
    family: 'Scheduled',
    icon: 'i-lucide-calendar-clock',
    title: 'Pre-order',
    to: '/ordering/pre-order',
  },
  {
    accent: 'linear-gradient(135deg, #2a9d8f, #54c6a0)',
    description: 'Basket, allergy check, pickup rendezvous, kitchen timing, payment.',
    family: 'Pickup',
    icon: 'i-lucide-shopping-bag',
    title: 'Collection',
    to: '/ordering/collection',
  },
  {
    accent: 'linear-gradient(135deg, #264653, #457b9d)',
    description: 'Basket, allergy check, table context, send to kitchen, tab or payment.',
    family: 'On-premise',
    icon: 'i-lucide-utensils',
    title: 'Dine-in',
    to: '/ordering/dine-in',
  },
  {
    accent: 'linear-gradient(135deg, #31572c, #90a955)',
    description: 'Basket, allergy check, room destination, kitchen timing, room charge or payment.',
    family: 'Delivery',
    icon: 'i-lucide-bed',
    title: 'Room service',
    to: '/ordering/room-service',
  },
  {
    accent: 'linear-gradient(135deg, #6d597a, #b56576)',
    description: 'Basket or package, event details, quote review, deposit, confirmation.',
    family: 'Scheduled',
    icon: 'i-lucide-party-popper',
    title: 'Catering',
    to: '/ordering/catering',
  },
  {
    accent: 'linear-gradient(135deg, #006d77, #83c5be)',
    description: 'Recurring meals, prep bundles, diet notes, delivery or pickup scheduling.',
    family: 'Recurring',
    icon: 'i-lucide-package-check',
    title: 'Meal prep',
    to: '/ordering/meal-prep',
  },
  {
    accent: 'linear-gradient(135deg, #1d3557, #e63946)',
    description: 'Misebox-style external channel ordering with kitchen and driver coordination.',
    family: 'Marketplace',
    icon: 'i-lucide-store',
    title: 'Marketplace order',
    to: '/ordering/marketplace-order',
  },
  {
    accent: 'linear-gradient(135deg, #bc6c25, #dda15e)',
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
