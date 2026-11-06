<!-- Concurrent edit — 2026-07-23 15:48 CEST — Keep About focused on restaurant menu, prep, and service work. -->
<template>
  <UPage>
    <UPageHeader
      headline="About Misebox"
      title="Menus, recipes and orders for your Kitchen team."
      description="Publish menus, record recipes and dish specifications, and follow incoming orders through preparation and handoff in a Kitchen Workspace."
      :links="[
        { label: 'Get started', to: '/get-started', trailingIcon: 'i-lucide-arrow-right' },
        { label: 'See the road map', to: '/road-map', color: 'neutral', variant: 'soft', icon: 'i-lucide-map' },
      ]"
    />
    <UPageBody>
      <UPageSection
        title="The idea"
        description="The menu should not be the end product. It should be the front door to how a kitchen works."
      >
        <UPageGrid>
          <UPageCard v-for="item in ideaItems" :key="item.label" :title="item.label" :icon="item.icon" />
        </UPageGrid>
      </UPageSection>
      <UPageSection
        headline="Why Misebox exists"
        title="Kitchen knowledge is valuable. Too often, it is also fragmented."
        description="A service depends on hundreds of details, but those details are commonly split between paper, PDFs, spreadsheets, chat threads, supplier messages, and the memories of experienced people."
      >
        <UPageGrid>
          <UPageCard v-for="problem in problems" :key="problem.title" :title="problem.title" :description="problem.copy" :icon="problem.icon" />
        </UPageGrid>
      </UPageSection>
      <UPageSection
        headline="One connected loop"
        title="From what you serve to how you deliver it."
        description="Misebox gives each operational object a proper place, then connects it to the next decision. The result is a system that becomes more useful as the team uses it."
      >
        <ol class="fx-list-stack">
          <li v-for="step in operatingLoop" :key="step.title">
            <UPageCard :title="step.title" :description="step.copy" :icon="step.icon" />
          </li>
        </ol>
      </UPageSection>
      <UPageSection
        headline="Built around real roles"
        title="One system, different views of the same truth."
      >
        <UPageGrid>
          <UPageCard v-for="audience in audiences" :key="audience.title" :title="audience.title" :description="audience.copy" :icon="audience.icon">
            <UButton :to="audience.to" color="neutral" variant="link" trailing-icon="i-lucide-arrow-right">{{ audience.action }}</UButton>
          </UPageCard>
        </UPageGrid>
      </UPageSection>
      <UPageSection
        headline="How we build"
        title="Useful on day one. Connected for what comes next."
        description="Misebox starts with practical tools such as public menus and kitchen workspaces, then grows into deeper operational coordination without forcing teams into an all-or-nothing rollout."
      >
        <UPageGrid>
          <UPageCard v-for="principle in principles" :key="principle.title" :title="principle.title" :description="principle.copy" icon="i-lucide-check" />
        </UPageGrid>
      </UPageSection>
      <UPageSection
        headline="The direction"
        title="Better kitchen systems create calmer services, stronger teams, and more resilient hospitality businesses."
        description="That is what Misebox is about: making the knowledge behind hospitality easier to use, share, and improve."
        :links="[
          { label: 'Explore kitchens', to: '/kitchens', icon: 'i-lucide-chef-hat' },
          { label: 'Explore solutions', to: '/solutions', color: 'neutral', variant: 'soft' },
        ]"
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import {
  buildPublicPageJsonLd,
  useSeo,
} from 'fireux-core/runtime/composables/fireux/seo/useSeo'

const ideaItems = [
  { label: 'Menus and dishes', icon: 'i-lucide-notebook-tabs' },
  { label: 'Recipes and methods', icon: 'i-lucide-list-checks' },
  { label: 'Stations and teams', icon: 'i-lucide-users' },
  { label: 'Orders and handoff', icon: 'i-lucide-bell-ring' },
] as const

const problems = [
  {
    title: 'Information drifts',
    copy: 'The public menu, kitchen notes, allergen records, and team knowledge stop matching each other.',
    icon: 'i-lucide-files',
  },
  {
    title: 'Experience walks out',
    copy: 'When knowledge lives in memory, every absence and staff change creates avoidable operational risk.',
    icon: 'i-lucide-brain',
  },
  {
    title: 'Tools stay disconnected',
    copy: 'Point solutions add screens but rarely connect the menu, prep work, service queue, and people doing the work.',
    icon: 'i-lucide-unplug',
  },
] as const

const operatingLoop = [
  {
    title: 'Publish',
    copy: 'Turn kitchen-owned information into clear public menus and useful customer surfaces.',
    icon: 'i-lucide-qr-code',
  },
  {
    title: 'Structure',
    copy: 'Connect dishes to recipes, ingredients, allergens, prices, and supplier knowledge.',
    icon: 'i-lucide-network',
  },
  {
    title: 'Process orders',
    copy: 'Confirm collection requests, start preparation, mark orders ready and record handoff.',
    icon: 'i-lucide-clipboard-check',
  },
  {
    title: 'Improve',
    copy: 'Keep the operational record current so the next menu and service start from better information.',
    icon: 'i-lucide-refresh-cw',
  },
] as const

const audiences = [
  {
    title: 'Owners and operators',
    copy: 'Manage menus, recipes, the Kitchen team and incoming orders.',
    action: 'Explore kitchens',
    to: '/kitchens',
    icon: 'i-lucide-store',
  },
  {
    title: 'Service teams',
    copy: 'Explore the Kitchen operations for handling guest choices and service handoff.',
    action: 'Explore Kitchen operations',
    to: '/operations',
    icon: 'i-lucide-bell-ring',
  },
] as const

const principles = [
  {
    title: 'Start with real operational objects.',
    copy: 'Features attach to menus, dishes, recipes, ingredients, orders, kitchens, people, or suppliers.',
  },
  {
    title: 'Keep ownership clear.',
    copy: 'Kitchens own their operational truth while public surfaces present the right part of it.',
  },
  {
    title: 'Make the simple path valuable.',
    copy: 'A team can begin with one useful surface and grow into the wider system at its own pace.',
  },
  {
    title: 'Keep focused products focused.',
    copy: 'Adjacent products such as Misebox Jobs can share trusted foundations without competing with the Kitchen workflow.',
  },
] as const

definePageMeta({
  layout: 'default',
  nav: {
    key: 'about',
    label: 'About',
    icon: 'i-lucide-info',
    order: 25,
    position: 'bottom',
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
})

useSeo({
  title: 'About Misebox · Restaurant menu and Kitchen workflow',
  description:
    'Misebox connects menus, dishes, recipes, incoming orders and Kitchen handoff for restaurant teams.',
  path: '/about',
  image: '/img/app/cover.png',
  jsonLdBuilder: (context) =>
    buildPublicPageJsonLd({
      canonicalUrl: context.canonicalUrl,
      description: context.description,
      image: context.image,
      title: context.title,
    }),
})
</script>
