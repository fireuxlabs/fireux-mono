<!-- Concurrent edit — 2026-07-23 15:48 CEST — Keep the Road Map on Kitchen operations and focused adjacent products. -->
<template>
  <UPage>
    <UPageHeader
      headline="Misebox road map"
      title="Build from the menu inward."
      description="Misebox grows from useful public Kitchen tools into connected preparation and service workflows. The sequence matters: establish reliable Kitchen data first, turn it into repeatable work, then scale without losing the operating model."
    />
    <UPageBody>
      <UAlert
        title="A direction, not a promise calendar"
        description="Priorities respond to real kitchen use, technical readiness, and partner feedback. Items may move as we learn; the product principles stay stable."
        color="neutral"
      />
      <UPageGrid>
        <UCard v-for="phase in phases" :key="phase.key">
          <template #header>
            <UBadge :color="phase.color" :icon="phase.icon" variant="soft">{{ phase.label }}</UBadge>
            <h2 class="fx-type-card-heading">{{ phase.title }}</h2>
          </template>
          <div class="fx-card-body-stack">
            <p>{{ phase.description }}</p>
            <ul class="fx-list-stack">
              <li v-for="item in phase.items" :key="item.title">
                <p class="fx-type-card-title">{{ item.title }}</p>
                <p class="fx-type-caption">{{ item.copy }}</p>
              </li>
            </ul>
          </div>
        </UCard>
      </UPageGrid>
      <UPageSection
        headline="Product compass"
        title="What earns a place on the road map?"
        description="Misebox is intentionally focused on the Kitchen operating loop and strict in implementation. A feature should strengthen that loop, remove duplicate work, or create a useful connection between existing operational records."
      >
        <UPageGrid>
          <UPageCard v-for="rule in compass" :key="rule.title" :title="rule.title" :description="rule.copy" :icon="rule.icon" />
        </UPageGrid>
      </UPageSection>
      <UPageSection
        headline="Help shape Misebox"
        title="The best road map starts in a real kitchen."
        description="Start with the Misebox surfaces that are useful today, then help us identify the next operational gap worth solving."
        :links="[
          { label: 'Get started', to: '/get-started' },
          { label: 'About Misebox', to: '/about', color: 'neutral', variant: 'soft' },
        ]"
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
const phases = [
  {
    key: 'now',
    label: 'Now',
    title: 'Make kitchen truth dependable',
    color: 'success' as const,
    icon: 'i-lucide-layers-3',
    description:
      'Strengthen the working surfaces that turn kitchen information into something useful for teams and guests.',
    items: [
      {
        title: 'Public and QR menus',
        copy: 'Reliable menu publishing, URLs, PDFs, presentation, and kitchen-owned public identity.',
      },
      {
        title: 'Structured kitchen knowledge',
        copy: 'Menus, dishes, recipes, ingredients, allergens, and suppliers with clear relationships.',
      },
      {
        title: 'Kitchen workspace foundations',
        copy: 'Practical identity, menu, prep, team, and operational management surfaces.',
      },
      {
        title: 'Order and service handoff',
        copy: 'Carry guest choices into a clear Kitchen queue and move each ticket toward service.',
      },
    ],
  },
  {
    key: 'next',
    label: 'Next',
    title: 'Turn knowledge into daily coordination',
    color: 'warning' as const,
    icon: 'i-lucide-route',
    description:
      'Close the gap between structured information and the work that makes service happen.',
    items: [
      {
        title: 'Prep and service planning',
        copy: 'Generate clearer work from menus, recipes, yields, stations, and service needs.',
      },
      {
        title: 'Allergen and translation workflows',
        copy: 'Make critical menu information safer to maintain and easier to publish across languages.',
      },
      {
        title: 'Ingredient readiness',
        copy: 'Connect ingredient needs, preparation quantities, availability, and Kitchen requirements.',
      },
      {
        title: 'Operational reporting',
        copy: 'Give teams useful signals about readiness, consistency, gaps, and repeated work.',
      },
    ],
  },
  {
    key: 'later',
    label: 'Later',
    title: 'Scale without losing the Kitchen model',
    color: 'neutral' as const,
    icon: 'i-lucide-orbit',
    description:
      'Build higher-value coordination once the underlying Kitchen and service data is trustworthy.',
    items: [
      {
        title: 'Multi-kitchen operations',
        copy: 'Share standards while preserving each location’s ownership and operating reality.',
      },
      {
        title: 'Partner and specialist apps',
        copy: 'Let focused products extend Misebox through clear integrations and shared identity.',
      },
      {
        title: 'Cross-location standards',
        copy: 'Carry approved recipes, menu structure, and operating practices across locations without erasing local control.',
      },
      {
        title: 'Assisted kitchen intelligence',
        copy: 'Use AI where it reduces repetitive work while keeping operators in control of kitchen truth.',
      },
    ],
  },
] as const

const compass = [
  {
    title: 'Operationally real',
    copy: 'It solves a problem that exists during setup, preparation, service, sourcing, or team development.',
    icon: 'i-lucide-utensils',
  },
  {
    title: 'Connected by design',
    copy: 'It improves an existing object or relationship instead of creating another isolated tool.',
    icon: 'i-lucide-network',
  },
  {
    title: 'Useful before complete',
    copy: 'A small team can gain value without adopting the entire Misebox ecosystem.',
    icon: 'i-lucide-sparkles',
  },
  {
    title: 'Clear ownership',
    copy: 'People understand who owns the data, who can change it, and where the trusted version lives.',
    icon: 'i-lucide-shield-check',
  },
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
  title: 'Misebox Road Map · From menu to Kitchen workflow',
  description:
    'See how Misebox is developing from public Kitchen tools into connected menus, recipes, prep, orders, service, and multi-location operations.',
  ogTitle: 'Misebox Road Map',
  ogDescription:
    'Build from the menu inward: reliable Kitchen knowledge, daily coordination, then repeatable multi-location operations.',
})
</script>
