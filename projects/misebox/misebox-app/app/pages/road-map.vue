<template>
  <div class="pb-20">
    <section class="border-b border-default py-20 sm:py-28">
      <UContainer class="grid gap-10 lg:grid-cols-[1fr_0.72fr] lg:items-end">
        <div class="max-w-3xl">
          <UBadge color="primary" variant="soft">Misebox road map</UBadge>
          <h1 class="fx-type-page-title mt-6 text-5xl font-semibold tracking-tight sm:text-6xl">
            Build from the menu inward.
          </h1>
          <p class="fx-type-description mt-6 max-w-2xl leading-8">
            Misebox grows from useful public kitchen tools into a connected operating system. The sequence matters: establish reliable kitchen data first, turn it into repeatable work, then connect the wider hospitality ecosystem.
          </p>
        </div>
        <div class="rounded-3xl border border-primary/20 bg-primary/10 p-6">
          <p class="fx-type-card-title text-sm">A direction, not a promise calendar</p>
          <p class="fx-type-caption mt-2 leading-6">
            Priorities respond to real kitchen use, technical readiness, and partner feedback. Items may move as we learn; the product principles stay stable.
          </p>
        </div>
      </UContainer>
    </section>

    <section class="py-20">
      <UContainer>
        <div class="grid gap-6 lg:grid-cols-3">
          <article v-for="phase in phases" :key="phase.key" class="flex flex-col rounded-3xl border border-default bg-default p-6 sm:p-7">
            <div class="flex items-center justify-between gap-4">
              <UBadge :color="phase.color" variant="soft">{{ phase.label }}</UBadge>
              <UIcon :name="phase.icon" class="size-5 text-dimmed" />
            </div>
            <h2 class="fx-type-card-title mt-6 text-2xl">{{ phase.title }}</h2>
            <p class="fx-type-caption mt-3 leading-6">{{ phase.description }}</p>
            <ul class="mt-7 space-y-4">
              <li v-for="item in phase.items" :key="item.title" class="flex gap-3">
                <UIcon name="i-lucide-circle-check" class="mt-0.5 size-5 shrink-0 text-primary" />
                <div>
                  <p class="fx-type-card-title text-sm">{{ item.title }}</p>
                  <p class="fx-type-caption mt-1 leading-5">{{ item.copy }}</p>
                </div>
              </li>
            </ul>
          </article>
        </div>
      </UContainer>
    </section>

    <section class="border-y border-default bg-muted/30 py-20">
      <UContainer class="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p class="fx-type-headline">Product compass</p>
          <h2 class="fx-type-section-title mt-4">What earns a place on the road map?</h2>
          <p class="mt-5 leading-7 text-muted">
            Misebox is intentionally broad in ambition and strict in implementation. A feature should strengthen the kitchen operating loop, remove duplicate work, or create a useful connection between participants.
          </p>
        </div>
        <div class="grid gap-4 sm:grid-cols-2">
          <div v-for="rule in compass" :key="rule.title" class="rounded-3xl border border-default bg-default p-6">
            <UIcon :name="rule.icon" class="size-5 text-primary" />
            <h3 class="fx-type-card-title mt-4">{{ rule.title }}</h3>
            <p class="fx-type-caption mt-2 leading-6">{{ rule.copy }}</p>
          </div>
        </div>
      </UContainer>
    </section>

    <section class="py-20">
      <UContainer class="rounded-3xl bg-gray-950 px-6 py-12 text-white sm:px-10 lg:flex lg:items-center lg:justify-between lg:gap-12 lg:px-14 dark:bg-gray-900">
        <div class="max-w-2xl">
          <p class="fx-type-headline text-primary-300">Help shape Misebox</p>
          <h2 class="fx-type-section-title mt-4 text-white">The best road map starts in a real kitchen.</h2>
          <p class="mt-4 leading-7 text-gray-300">
            Start with the Misebox surfaces that are useful today, then help us identify the next operational gap worth solving.
          </p>
        </div>
        <div class="mt-8 flex shrink-0 flex-wrap gap-3 lg:mt-0">
          <UButton to="/get-started" size="lg">Get started</UButton>
          <UButton to="/about" color="neutral" variant="soft" size="lg">About Misebox</UButton>
        </div>
      </UContainer>
    </section>
  </div>
</template>

<script setup lang="ts">
const phases = [
  {
    key: 'now', label: 'Now', title: 'Make kitchen truth dependable', color: 'success' as const, icon: 'i-lucide-layers-3',
    description: 'Strengthen the working surfaces that turn kitchen information into something useful for teams and guests.',
    items: [
      { title: 'Public and QR menus', copy: 'Reliable menu publishing, URLs, PDFs, presentation, and kitchen-owned public identity.' },
      { title: 'Structured kitchen knowledge', copy: 'Menus, dishes, recipes, ingredients, allergens, and suppliers with clear relationships.' },
      { title: 'Kitchen console foundations', copy: 'Practical identity, menu, prep, team, and operational management surfaces.' },
      { title: 'Hospitality profiles and jobs', copy: 'Connect kitchens with professionals through useful profiles and real roles.' },
    ],
  },
  {
    key: 'next', label: 'Next', title: 'Turn knowledge into daily coordination', color: 'warning' as const, icon: 'i-lucide-route',
    description: 'Close the gap between structured information and the work that makes service happen.',
    items: [
      { title: 'Prep and service planning', copy: 'Generate clearer work from menus, recipes, yields, stations, and service needs.' },
      { title: 'Allergen and translation workflows', copy: 'Make critical menu information safer to maintain and easier to publish across languages.' },
      { title: 'Supplier collaboration', copy: 'Improve the connection between ingredients, products, availability, and kitchen requirements.' },
      { title: 'Operational reporting', copy: 'Give teams useful signals about readiness, consistency, gaps, and repeated work.' },
    ],
  },
  {
    key: 'later', label: 'Later', title: 'Connect the hospitality ecosystem', color: 'neutral' as const, icon: 'i-lucide-orbit',
    description: 'Build higher-value coordination once the underlying kitchen and participant data is trustworthy.',
    items: [
      { title: 'Multi-kitchen operations', copy: 'Share standards while preserving each location’s ownership and operating reality.' },
      { title: 'Partner and specialist apps', copy: 'Let focused products extend Misebox through clear integrations and shared identity.' },
      { title: 'Portable professional reputation', copy: 'Help experience, capability, and trusted working relationships move with people.' },
      { title: 'Assisted kitchen intelligence', copy: 'Use AI where it reduces repetitive work while keeping operators in control of kitchen truth.' },
    ],
  },
] as const

const compass = [
  { title: 'Operationally real', copy: 'It solves a problem that exists during setup, preparation, service, sourcing, or team development.', icon: 'i-lucide-utensils' },
  { title: 'Connected by design', copy: 'It improves an existing object or relationship instead of creating another isolated tool.', icon: 'i-lucide-network' },
  { title: 'Useful before complete', copy: 'A small team can gain value without adopting the entire Misebox ecosystem.', icon: 'i-lucide-sparkles' },
  { title: 'Clear ownership', copy: 'People understand who owns the data, who can change it, and where the trusted version lives.', icon: 'i-lucide-shield-check' },
] as const

definePageMeta({
  layout: 'landing',
  nav: {
    key: 'road-map',
    label: 'Road map',
    icon: 'i-lucide-map',
    order: 30,
    position: 'bottom',
    desktop: true,
    mobile: true,
    layouts: ['landing'],
  },
})

useSeoMeta({
  title: 'Misebox Road Map · From menu to operating system',
  description: 'See how Misebox is developing from public kitchen tools into connected operations for menus, recipes, prep, teams, suppliers, and hospitality professionals.',
  ogTitle: 'Misebox Road Map',
  ogDescription: 'Build from the menu inward: reliable kitchen knowledge, daily coordination, then a connected hospitality ecosystem.',
})
</script>
