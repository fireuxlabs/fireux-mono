<template>
  <EffectsLandingEffect />

  <div>
    <LandingShell>
      <template #left>
        <div class="space-y-6">
          <UBadge color="primary" variant="subtle">Bringli</UBadge>

          <div class="space-y-3">
            <h1 class="text-4xl font-black tracking-tight lg:text-6xl">
              Local producers to your door.
            </h1>
            <p
              class="max-w-2xl text-base leading-relaxed text-[color:var(--ui-text-muted)] lg:text-lg"
            >
              Bringli connects homes and businesses with trusted local
              suppliers. Orders, dropoffs, and supplier profiles run in one
              simple flow powered by Drop.
            </p>
          </div>

          <div class="flex flex-col gap-3 sm:flex-row">
            <UButton
              to="/suppliers"
              size="lg"
              color="primary"
              icon="i-lucide-truck"
            >
              Explore suppliers
            </UButton>
            <UButton to="/dev" size="lg" variant="outline">
              Open dev tools
            </UButton>
          </div>

          <ul class="grid gap-3 pt-2 sm:grid-cols-2">
            <li
              v-for="item in heroBullets"
              :key="item.text"
              class="flex items-center gap-2 text-sm"
            >
              <UIcon :name="item.icon" class="shrink-0 text-primary" />
              <span>{{ item.text }}</span>
            </li>
          </ul>
        </div>
      </template>

      <template #right>
        <UCard>
          <template #header>
            <div class="space-y-1">
              <h2 class="text-2xl font-semibold">{{ quickPeek.title }}</h2>
              <p class="text-sm text-[color:var(--ui-text-muted)]">
                {{ quickPeek.subtitle }}
              </p>
            </div>
          </template>

          <ul class="space-y-4">
            <li
              v-for="item in quickPeek.items"
              :key="item.title"
              class="flex gap-3"
            >
              <div
                class="grid h-10 w-10 place-items-center rounded-lg bg-primary/15 text-primary"
              >
                <UIcon :name="item.icon" />
              </div>
              <div class="space-y-1">
                <h3 class="font-medium">{{ item.title }}</h3>
                <p class="text-sm text-[color:var(--ui-text-muted)]">
                  {{ item.description }}
                </p>
              </div>
            </li>
          </ul>

          <template #footer>
            <div
              class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <p class="text-sm text-[color:var(--ui-text-muted)]">
                Start in Interlaken. Scale market by market.
              </p>
              <UButton
                to="/suppliers"
                variant="outline"
                trailing-icon="i-lucide-arrow-right"
              >
                Open supplier workspace
              </UButton>
            </div>
          </template>
        </UCard>
      </template>
    </LandingShell>

    <UContainer>
      <UPageSection class="space-y-10 py-16 lg:py-24">
        <div class="mx-auto max-w-2xl space-y-3 text-center">
          <h2 class="text-3xl font-black">Bringli workflows</h2>
          <p class="text-base text-[color:var(--ui-text-muted)] lg:text-lg">
            The first pipe is supplier operations. Then we widen into full
            marketplace flows.
          </p>
        </div>

        <div class="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          <UCard v-for="item in solutionCards" :key="item.title" :to="item.to">
            <template #header>
              <div class="flex items-start gap-3">
                <div
                  class="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary"
                >
                  <UIcon :name="item.icon" />
                </div>
                <div class="space-y-1">
                  <UBadge variant="soft" color="primary">{{ item.badge }}</UBadge>
                  <h3 class="text-lg font-semibold">{{ item.title }}</h3>
                </div>
              </div>
            </template>

            <p class="text-sm text-[color:var(--ui-text-muted)]">
              {{ item.description }}
            </p>

            <template #footer>
              <UButton variant="ghost" size="sm" trailing-icon="i-lucide-arrow-right">
                {{ item.cta }}
              </UButton>
            </template>
          </UCard>
        </div>
      </UPageSection>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'landing',
  nav: {
    key: 'home',
    label: 'Home',
    icon: 'i-lucide-home',
    desktop: true,
    mobile: true,
    layouts: ['landing'],
  },
})

useSeoMeta({
  title: 'Bringli | Local producer delivery',
  description:
    'Bringli is a local delivery marketplace for homes and businesses, starting with supplier operations powered by Drop.',
})

const heroBullets = [
  {
    icon: 'i-lucide-leaf',
    text: 'Fresh local producers and suppliers in one directory',
  },
  {
    icon: 'i-lucide-truck',
    text: 'Home and business dropoff flows built for reliability',
  },
  {
    icon: 'i-lucide-store',
    text: 'Supplier onboarding and profile management through Drop',
  },
  {
    icon: 'i-lucide-map-pinned',
    text: 'Launched in Interlaken with market-by-market expansion',
  },
]

const quickPeek = {
  title: 'Operations at a glance',
  subtitle: 'Supplier-first execution for the first Bringli release',
  items: [
    {
      icon: 'i-lucide-users',
      title: 'Supplier management',
      description:
        'Keep supplier records clean with one workspace for profiles, readiness, and contact details.',
    },
    {
      icon: 'i-lucide-package-check',
      title: 'Dropoff readiness',
      description:
        'Track who can deliver, where they deliver, and what service level they can commit to.',
    },
    {
      icon: 'i-lucide-shield-check',
      title: 'Operational confidence',
      description:
        'Run a tighter first pipe before widening into orders, payments, and broader marketplace tooling.',
    },
  ],
}

const solutionCards = [
  {
    title: 'Supplier Directory',
    description:
      'Centralize producer and supplier profiles with simple filtering for quality and fit.',
    icon: 'i-lucide-search',
    badge: 'Now',
    cta: 'Open suppliers',
    to: '/suppliers',
  },
  {
    title: 'Delivery Coverage',
    description:
      'Map service areas and dropoff expectations for homes and business locations.',
    icon: 'i-lucide-map',
    badge: 'Now',
    cta: 'Review coverage',
    to: '/suppliers',
  },
  {
    title: 'Supplier Readiness',
    description:
      'Capture onboarding status and move each supplier to ready-to-serve faster.',
    icon: 'i-lucide-list-checks',
    badge: 'Now',
    cta: 'Manage readiness',
    to: '/suppliers',
  },
  {
    title: 'Order Pipeline',
    description:
      'Prepare the next phase for order capture, handoff tracking, and fulfillment visibility.',
    icon: 'i-lucide-package-open',
    badge: 'Next',
    cta: 'Plan pipeline',
    to: '/dev',
  },
  {
    title: 'Business Accounts',
    description:
      'Support office, hospitality, and retail buyers with repeatable delivery setups.',
    icon: 'i-lucide-building-2',
    badge: 'Next',
    cta: 'Define accounts',
    to: '/dev',
  },
  {
    title: 'Market Expansion',
    description:
      'Replicate the Interlaken operating model into the next city with low drift.',
    icon: 'i-lucide-globe',
    badge: 'Next',
    cta: 'Prepare rollout',
    to: '/dev',
  },
]
</script>
