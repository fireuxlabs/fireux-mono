<!-- Concurrent edit — 2026-07-23 09:40 CEST — Lead with the restaurant job, live product scope, and safe proof. -->
<template>
  <LandingProductIndex
    :content="content"
    hero-layout="proof-wide"
    hero-mode="full"
  >
    <template #hero-preview>
      <div
        class="min-w-0 overflow-hidden rounded-2xl shadow-2xl shadow-black/20 ring-1 ring-white/5 sm:rounded-3xl"
      >
        <MiseboxLandingPreview />
      </div>
    </template>

    <template #after-hero>
      <section
        class="grid gap-8 border-y border-default/70 py-10 sm:gap-12 sm:py-14 lg:grid-cols-[minmax(0,1.15fr)_minmax(22rem,0.85fr)] lg:items-center lg:gap-16 lg:py-16"
        aria-labelledby="misebox-console-section-title"
      >
        <div
          class="min-w-0 overflow-hidden rounded-2xl shadow-2xl shadow-black/20 ring-1 ring-white/5 sm:rounded-3xl"
        >
          <MiseboxLandingConsolePreview
            v-model:surface-id="selectedConsoleSurfaceId"
          />
        </div>

        <div class="grid max-w-xl content-center gap-4 lg:justify-self-end">
          <p class="fx-type-headline">
            {{ selectedConsoleCopy.eyebrow }}
          </p>
          <h2
            id="misebox-console-section-title"
            class="text-4xl font-black tracking-tight text-highlighted sm:text-5xl lg:text-6xl"
          >
            {{ selectedConsoleCopy.title }}
          </h2>
          <p
            v-if="selectedConsoleCopy.description"
            class="max-w-lg text-lg leading-8 text-muted"
          >
            {{ selectedConsoleCopy.description }}
          </p>
          <ul
            v-if="selectedConsoleCopy.items?.length"
            class="flex max-w-lg flex-wrap gap-2"
            :aria-label="`${selectedConsoleCopy.eyebrow} includes`"
          >
            <li
              v-for="item in selectedConsoleCopy.items"
              :key="item"
              class="rounded-full border border-default bg-elevated px-3 py-1.5 text-sm font-semibold text-toned"
            >
              {{ item }}
            </li>
          </ul>
          <p
            v-if="selectedConsoleCopy.supporting"
            class="max-w-lg leading-7 text-toned"
          >
            {{ selectedConsoleCopy.supporting }}
          </p>
          <div class="pt-2">
            <UButton
              :to="selectedConsoleCopy.to"
              size="lg"
              trailing-icon="i-lucide-arrow-right"
            >
              {{ selectedConsoleCopy.action }}
            </UButton>
          </div>
        </div>
      </section>

      <section
        class="grid gap-8 py-10 sm:gap-12 sm:py-14 lg:py-16"
        aria-labelledby="misebox-ordering-section-title"
      >
        <div
          class="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(22rem,1.1fr)] lg:items-end lg:gap-16"
        >
          <div class="grid max-w-3xl gap-4">
            <p class="fx-type-headline">
              Guest ordering
            </p>
            <h2
              id="misebox-ordering-section-title"
              class="text-4xl font-black tracking-tight text-highlighted sm:text-5xl lg:text-6xl"
            >
              Take orders from phones, tables and kiosks.
            </h2>
          </div>

          <div class="grid max-w-2xl gap-4 lg:justify-self-end">
            <p class="text-lg leading-8 text-muted">
              Guests scan at the table, order for collection or delivery, or
              use a self-service kiosk.
            </p>
            <p class="leading-7 text-toned">
              Each order uses the same menu and enters the Kitchen Console.
            </p>
            <div class="pt-2">
              <UButton
                to="/demo/kiosk"
                size="lg"
                trailing-icon="i-lucide-arrow-right"
              >
                Explore guest ordering
              </UButton>
            </div>
          </div>
        </div>

        <MiseboxLandingOrderingPreview />
      </section>

      <section
        class="grid gap-8 border-t border-default/70 py-10 sm:gap-12 sm:py-14 lg:grid-cols-[minmax(0,1.15fr)_minmax(22rem,0.85fr)] lg:items-center lg:gap-16 lg:py-16"
        aria-labelledby="misebox-finance-section-title"
      >
        <MiseboxLandingFinancePreview />

        <div class="grid max-w-xl content-center gap-4 lg:justify-self-end">
          <p class="fx-type-headline">
            Kitchen Finance
          </p>
          <h2
            id="misebox-finance-section-title"
            class="text-4xl font-black tracking-tight text-highlighted sm:text-5xl lg:text-6xl"
          >
            Review Kitchen sales.
          </h2>
          <p class="max-w-lg text-lg leading-8 text-muted">
            Compare gross sales, completed sales, and average sale for the
            selected period.
          </p>
          <p class="max-w-lg leading-7 text-toned">
            Choose 7, 30, or 90 days. Each currency remains separate.
          </p>
          <div class="pt-2">
            <UButton
              to="/console/kitchen/finance"
              size="lg"
              trailing-icon="i-lucide-arrow-right"
            >
              Open Kitchen Finance
            </UButton>
          </div>
        </div>
      </section>
    </template>

    <template #apps>
      <LandingAppCollection
        :controller="appsController"
        eyebrow="Our apps"
        title="Different businesses. One shared Misebox foundation."
        description="Explore hospitality Apps that connect public content, restaurant operations and team access while keeping their own identity and workflow."
        action-label="Explore all Misebox apps"
        action-to="/apps"
        fallback-description="A live hospitality app built on the Misebox ecosystem."
        :exclude-ids="['misebox-app']"
      />
    </template>
  </LandingProductIndex>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { LandingProductIndexContent } from 'fireux-core/types/landing-product'
import { useEcosystemAppCollection } from 'fireux-core/runtime/composables/fireux/public/app/useEcosystemAppCollection'
import { kitchenOperations } from 'fireux-kitchens/runtime/content/operations'
import MiseboxLandingConsolePreview from './ConsolePreview/Index.vue'
import MiseboxLandingFinancePreview from './FinancePreview.vue'
import MiseboxLandingOrderingPreview from './OrderingPreview.vue'
import MiseboxLandingPreview from './Preview.vue'

type ConsoleSurfaceCopy = {
  action: string
  description?: string
  eyebrow: string
  items?: readonly string[]
  supporting?: string
  title: string
  to: string
}

const appsController = useEcosystemAppCollection()
const selectedConsoleSurfaceId = ref('kitchen.dishes')

const consoleSurfaceCopy = {
  'kitchen.dishes': {
    eyebrow: 'Kitchen Console · Dishes',
    title: 'Develop your dishes.',
    description:
      'Set each dish’s specification and selling price, connect its recipes and prep items, organise mise en place, and track sales and costs.',
    items: [
      'Specification',
      'Prep items',
      'Recipes',
      'Mise en place',
      'Sales and costs',
    ],
    action: 'Open Dishes',
    to: '/console/kitchen/dishes',
  },
  'kitchen.ingredients': {
    eyebrow: 'Kitchen Console · Ingredients',
    title: 'Track your ingredients.',
    description:
      'Make stocktaking faster, control supplier ordering, and keep nutritional information ready for menus and dishes.',
    items: [
      'Stocktaking',
      'Supplier ordering',
      'Nutritional information',
    ],
    action: 'Open Ingredients',
    to: '/console/kitchen/ingredients',
  },
  'kitchen.menus': {
    eyebrow: 'Kitchen Console · Menus',
    title: 'Create your menus.',
    description:
      'Arrange dishes into ordering sections, choose how each menu is used, and publish QR codes for guests.',
    items: [
      'Ordering sections',
      'Dishes',
      'Ordering formats',
      'QR codes',
    ],
    action: 'Open Menus',
    to: '/console/kitchen/menus',
  },
  'kitchen.mise': {
    eyebrow: 'Kitchen Console · Mise',
    title: 'Prepare for service.',
    description:
      'Create prep tasks from dishes and recipes, assign them to stations, set quantities, and track completion before service.',
    items: [
      'Prep tasks',
      'Quantities',
      'Stations',
      'Completion',
    ],
    action: 'Open Mise',
    to: '/console/kitchen/mise',
  },
  'kitchen.orders': {
    eyebrow: 'Kitchen Console · Orders',
    title: 'Process your orders.',
    description:
      'Receive orders from every ordering surface, organise the service queue, and track each order from acceptance to handoff.',
    items: [
      'Incoming orders',
      'Service queue',
      'Preparation status',
      'Handoff',
    ],
    action: 'Open Orders',
    to: '/console/kitchen/orders',
  },
  'kitchen.recipes': {
    eyebrow: 'Kitchen Console · Recipes',
    title: 'Record your recipes.',
    description:
      'Record ingredients, quantities, methods and yields. Connect recipes to dishes.',
    items: [
      'Ingredients',
      'Quantities',
      'Method',
      'Yield',
    ],
    action: 'Open Recipes',
    to: '/console/kitchen/recipes',
  },
  'kitchen.stations': {
    eyebrow: 'Kitchen Console · Stations',
    title: 'Coordinate your stations.',
    description:
      'Assign dishes, prep tasks, and service work to the station responsible for completing them.',
    items: [
      'Dishes',
      'Prep tasks',
      'Service work',
      'Responsibilities',
    ],
    action: 'Open Stations',
    to: '/console/kitchen/stations',
  },
  'kitchen.suppliers': {
    eyebrow: 'Kitchen Console · Suppliers',
    title: 'Source your ingredients.',
    description:
      'Connect supplier catalogues and pack prices to the ingredients you buy, compare supply options, and prepare orders.',
    items: [
      'Catalogues',
      'Products',
      'Pack prices',
      'Ordering',
    ],
    action: 'Open Suppliers',
    to: '/console/kitchen/suppliers',
  },
  'kitchen.tables': {
    eyebrow: 'Kitchen Console · Tables',
    title: 'Set up your tables.',
    description:
      'Create table numbers and QR entry points so dine-in orders arrive with the correct table.',
    items: [
      'Table numbers',
      'QR entry points',
      'Dine-in ordering',
      'Order destinations',
    ],
    action: 'Open Tables',
    to: '/console/kitchen/tables',
  },
  'kitchen.finance': {
    eyebrow: 'Kitchen Console · Finance',
    title: 'Review Kitchen sales.',
    description:
      'Compare gross sales, completed sales, and average sale for the selected period.',
    supporting:
      'Choose 7, 30, or 90 days. Each currency remains separate.',
    action: 'Open Kitchen Finance',
    to: '/console/kitchen/finance',
  },
} as const satisfies Record<string, ConsoleSurfaceCopy>

const selectedConsoleCopy = computed<ConsoleSurfaceCopy>(() =>
  consoleSurfaceCopy[
    selectedConsoleSurfaceId.value as keyof typeof consoleSurfaceCopy
  ] || consoleSurfaceCopy['kitchen.dishes']
)

const operations = kitchenOperations
  .filter(operation => operation.slug)
  .map(operation => ({
    ...operation,
    to: `/operations/${operation.slug}`,
  }))

const content = {
  hero: {
    badge: 'Misebox',
    kicker: 'Kitchen Console',
    title: 'The Control Centre For',
    accent: 'Kitchen Operations',
    description:
      'From the first menu update to the final order leaving the pass, keep recipes, prep, teams, suppliers and finances connected—so everyone works from the same clear picture.',
    primaryAction: {
      label: 'Get started',
      to: '/get-started',
    },
    secondaryAction: {
      label: 'Go to console',
      to: '/console/kitchen',
      icon: 'i-lucide-layout-dashboard',
    },
    quietAction: {
      label: 'Explore Kitchen Operations',
      to: '/operations',
    },
    trustItems: [
      'Menus through service',
      'Prep and team coordination',
      'Suppliers and finance',
    ],
  },
  operatingLoop: [
    {
      title: 'Publish',
      copy: 'A clear menu for guests',
      icon: 'i-lucide-book-open',
      to: '/menus',
    },
    {
      title: 'Connect',
      copy: 'Dishes and recipes',
      icon: 'i-lucide-network',
      to: '/operations/dishes',
    },
    {
      title: 'Prepare',
      copy: 'Prep work by station',
      icon: 'i-lucide-list-checks',
      to: '/operations/mise',
    },
    {
      title: 'Serve',
      copy: 'Orders through handoff',
      icon: 'i-lucide-bell-ring',
      to: '/operations/orders',
    },
  ],
  system: {
    eyebrow: 'The problem Misebox solves',
    title: 'Your menu should not be copied into five different tools.',
    description:
      'When a dish changes, the team should not have to update a PDF, recipe sheet, prep list, ordering tool and service message separately. Misebox connects that work around one Kitchen-owned menu.',
    areas: [
      {
        eyebrow: 'For guests',
        title: 'Publish what you actually serve',
        copy: 'Build a structured menu that stays connected to the Kitchen and dishes behind it.',
        items: ['Structured public menus', 'QR-ready menu routes', 'Menu and Kitchen identity'],
        icon: 'i-lucide-qr-code',
        to: '/demo/menu',
        action: 'See the Menu demo',
        accent: 'var(--ui-primary)',
      },
      {
        eyebrow: 'For prep',
        title: 'Turn dishes into kitchen work',
        copy: 'Keep dishes and recipes close to the prep plan your team uses before service.',
        items: ['Dishes and recipes', 'Mise tasks', 'Kitchen stations'],
        icon: 'i-lucide-notebook-tabs',
        to: '/operations/mise',
        action: 'See the Mise operation',
        accent: '#d6aa68',
      },
      {
        eyebrow: 'For service',
        title: 'Carry orders through handoff',
        copy: 'Let guest choices arrive as clear Kitchen tickets that move from intake to ready.',
        items: ['Kiosk order flow', 'Kitchen order board', 'Ready-to-handoff states'],
        icon: 'i-lucide-bell-ring',
        to: '/demo/service',
        action: 'Run the service demo',
        accent: '#c87855',
      },
    ],
  },
  showcase: {
    badge: 'No signup · Sample restaurant · No live order',
    eyebrow: 'Try it before you set anything up',
    title: 'Follow one menu from guest choice to kitchen handoff.',
    description:
      'The interactive demo uses real Misebox Menu, Kiosk and Kitchen Order components with safe sample data. See the connected workflow without touching a live Kitchen.',
    action: {
      label: 'Try the interactive demo',
      to: '/demo',
    },
    experiences: [
      {
        eyebrow: 'Guest perspective',
        title: 'Responsive Menu',
        copy: 'Browse a structured restaurant menu on any screen.',
        icon: 'i-lucide-book-open-text',
        to: '/demo/menu',
      },
      {
        eyebrow: 'Ordering perspective',
        title: 'Touch-first Kiosk',
        copy: 'Build an order through the same Menu catalogue.',
        icon: 'i-lucide-monitor-smartphone',
        to: '/demo/kiosk',
      },
      {
        eyebrow: 'Kitchen perspective',
        title: 'Service board',
        copy: 'Move tickets from intake to ready for handoff.',
        icon: 'i-lucide-panels-top-left',
        to: '/demo/service',
      },
    ],
  },
  operations: {
    eyebrow: 'What works today',
    title: 'Open the working Kitchen tools—not a roadmap.',
    description:
      'This factual catalogue links to the Kitchen Console operations that exist now, so you can inspect the product without decoding a feature promise.',
    action: {
      label: 'See all working Operations',
      to: '/operations',
    },
    items: operations,
  },
  audiences: {
    eyebrow: 'Start with the kitchen',
    title: 'One connected workflow across your restaurant team.',
    items: [
      {
        title: 'Owners and operators',
        copy: 'Publish the menu and give the Kitchen one place to manage the work connected to it.',
        action: 'Create a Kitchen workspace',
        to: '/get-started',
        icon: 'i-lucide-store',
      },
      {
        title: 'Prep and production teams',
        copy: 'Move from dishes and recipes into visible prep work organised around stations.',
        action: 'Explore kitchen prep',
        to: '/operations/mise',
        icon: 'i-lucide-chef-hat',
      },
      {
        title: 'Service teams',
        copy: 'See guest orders enter a clear Kitchen queue and move toward a ready handoff.',
        action: 'Try the service demo',
        to: '/demo/service',
        icon: 'i-lucide-bell-ring',
      },
    ],
  },
  finalCta: {
    eyebrow: 'See the workflow, then decide',
    title: 'Start with a working demo—not another promise.',
    description:
      'Use the sample restaurant to explore the menu, kiosk and Kitchen order handoff. No account, no setup and no live order.',
    primaryAction: {
      label: 'Try the interactive demo',
      to: '/demo',
    },
    secondaryAction: {
      label: 'Create a Kitchen workspace',
      to: '/get-started',
    },
  },
} as const satisfies LandingProductIndexContent
</script>
