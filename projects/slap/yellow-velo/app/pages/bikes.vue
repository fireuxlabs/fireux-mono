<template>
  <main class="bg-default text-default">
    <UContainer class="space-y-10 py-10 sm:py-14">
      <header class="max-w-3xl space-y-4">
        <UBadge color="primary" variant="soft">
          Bicycle range
        </UBadge>
        <h1 class="text-4xl font-semibold tracking-normal text-highlighted sm:text-5xl">
          Bikes for commutes, climbs, and open weekends.
        </h1>
        <p class="text-lg leading-8 text-muted">
          Yellow Velo keeps the range focused: dependable city bikes, versatile
          gravel builds, and efficient road models with a clear path into
          accessories and service.
        </p>
      </header>

      <section class="grid gap-4 md:grid-cols-3" aria-label="Bicycle families">
        <UCard
          v-for="bike in bikes"
          :key="bike.title"
          variant="subtle"
          class="h-full"
        >
          <div class="flex h-full flex-col gap-5">
            <div class="grid aspect-[4/3] place-items-center rounded-lg bg-primary/10">
              <UIcon :name="bike.icon" class="size-16 text-primary" />
            </div>
            <div>
              <h2 class="text-xl font-semibold tracking-normal text-highlighted">
                {{ bike.title }}
              </h2>
              <p class="mt-2 text-sm leading-6 text-muted">
                {{ bike.description }}
              </p>
            </div>
            <ul class="mt-auto space-y-2 text-sm text-muted">
              <li
                v-for="point in bike.points"
                :key="point"
                class="flex gap-2"
              >
                <UIcon name="i-lucide-check" class="mt-0.5 size-4 shrink-0 text-primary" />
                <span>{{ point }}</span>
              </li>
            </ul>
          </div>
        </UCard>
      </section>

      <div>
        <UButton to="/products" color="primary" size="xl" icon="i-lucide-shopping-bag">
          Browse products
        </UButton>
      </div>
    </UContainer>
  </main>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'landing',
  nav: {
    key: 'bikes',
    label: 'Bikes',
    icon: 'i-lucide-bike',
    order: 1,
    desktop: true,
    mobile: true,
    layouts: ['landing'],
  },
})

useSeoMeta({
  title: 'Bikes - Yellow Velo',
  description: 'Explore Yellow Velo bicycle families for city, gravel, and road riding.',
})

const bikes = [
  {
    title: 'City',
    description: 'A practical everyday line with confident handling and commuter-ready details.',
    icon: 'i-lucide-bike',
    points: ['Rack and fender friendly', 'Upright comfort', 'Low-maintenance builds'],
  },
  {
    title: 'Gravel',
    description: 'A mixed-surface platform for riders who leave the city when the weekend opens up.',
    icon: 'i-lucide-mountain',
    points: ['Wide tire clearance', 'Stable geometry', 'Cargo mounts'],
  },
  {
    title: 'Road',
    description: 'Fast, clean, and efficient bicycles for longer rides and sharper mornings.',
    icon: 'i-lucide-gauge',
    points: ['Light frame options', 'Responsive fit', 'Performance parts'],
  },
]
</script>
