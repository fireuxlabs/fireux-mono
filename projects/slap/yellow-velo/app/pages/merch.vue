<template>
  <main class="bg-default text-default">
    <UContainer class="space-y-10 py-10 sm:py-14">
      <header class="max-w-3xl space-y-4">
        <UBadge color="primary" variant="soft">
          Merchandise
        </UBadge>
        <h1 class="text-4xl font-semibold tracking-normal text-highlighted sm:text-5xl">
          Ride goods that still work after the ride.
        </h1>
        <p class="text-lg leading-8 text-muted">
          Yellow Velo merchandise keeps the same sharp, useful approach as the
          bikes: simple apparel, everyday accessories, and limited seasonal drops.
        </p>
      </header>

      <section class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Merchandise lines">
        <UCard
          v-for="item in merch"
          :key="item.title"
          variant="subtle"
          class="h-full"
        >
          <div class="space-y-4">
            <div class="grid aspect-square place-items-center rounded-lg bg-primary/10">
              <UIcon :name="item.icon" class="size-12 text-primary" />
            </div>
            <div>
              <h2 class="font-semibold text-highlighted">
                {{ item.title }}
              </h2>
              <p class="mt-2 text-sm leading-6 text-muted">
                {{ item.description }}
              </p>
            </div>
          </div>
        </UCard>
      </section>

      <section class="rounded-lg border border-default bg-muted/30 p-6 sm:p-8">
        <div class="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 class="text-2xl font-semibold tracking-normal text-highlighted">
              Merch lives beside the bike catalogue.
            </h2>
            <p class="mt-2 max-w-2xl text-muted">
              Use FireUX Products for sellable merchandise and this page as the
              brand-facing collection surface.
            </p>
          </div>
          <UButton to="/products" color="primary" size="xl" icon="i-lucide-shopping-bag">
            Shop catalogue
          </UButton>
        </div>
      </section>
    </UContainer>
  </main>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'landing',
  nav: {
    key: 'merch',
    label: 'Merch',
    icon: 'i-lucide-shirt',
    order: 2,
    desktop: true,
    mobile: true,
    layouts: ['landing'],
  },
})

useSeoMeta({
  title: 'Merch - Yellow Velo',
  description: 'Shop Yellow Velo cycling caps, shirts, bottles, bags, and seasonal merchandise.',
})

const merch = [
  {
    title: 'Caps',
    description: 'Low-profile caps for rides, errands, and coffee stops.',
    icon: 'i-lucide-circle-dot',
  },
  {
    title: 'Tees',
    description: 'Soft everyday shirts in the Yellow Velo palette.',
    icon: 'i-lucide-shirt',
  },
  {
    title: 'Bottles',
    description: 'Lightweight bottles for shop rides and daily training.',
    icon: 'i-lucide-glass-water',
  },
  {
    title: 'Bags',
    description: 'Ride-ready totes and small carry goods for daily movement.',
    icon: 'i-lucide-shopping-bag',
  },
]
</script>
