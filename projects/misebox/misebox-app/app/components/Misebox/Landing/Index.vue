<!-- Concurrent edit — 2026-07-28 — Align the FireUX and Misebox Main App landing family. -->
<template>
  <LandingProductIndex :content="content">
    <template #hero-preview>
      <MiseboxPowerCards />
    </template>

    <template #onboarding>
      <LandingProductEntryPaths :content="entryPaths" />
    </template>

    <template #console>
      <LandingProductProofSection
        section-id="misebox-console"
        :eyebrow="selectedConsoleCopy.eyebrow"
        :title="selectedConsoleCopy.title"
        :description="selectedConsoleCopy.description"
        :supporting="selectedConsoleCopy.supporting"
        :items="selectedConsoleCopy.items"
        :action="{
          label: selectedConsoleCopy.action,
          to: selectedConsoleCopy.to,
          icon: 'i-lucide-arrow-right',
        }"
      >
        <MiseboxLandingConsolePreview
          v-model:surface-id="selectedConsoleSurfaceId"
        />
      </LandingProductProofSection>
    </template>

    <template #specifics>
      <LandingProductProofSection
        section-id="misebox-menu-surfaces"
        eyebrow="Menu surfaces"
        title="Publish once. Serve phones and kiosks."
        description="Guests order for collection or delivery when the selected Menu and Kitchen configure those paths, or use a self-service kiosk."
        supporting="Each order uses the same published Menu and enters the Kitchen Console."
        :action="{
          label: 'Explore guest ordering',
          to: '/demo/kiosk',
          icon: 'i-lucide-arrow-right',
        }"
        reverse
      >
        <MiseboxLandingOrderingPreview />
      </LandingProductProofSection>

      <LandingProductProofSection
        section-id="misebox-finance"
        eyebrow="Kitchen Finance"
        title="Review Kitchen sales."
        description="Compare gross sales, completed sales, and average sale for the selected period."
        supporting="Choose 7, 30, or 90 days. Each currency remains separate."
        :action="{
          label: 'Open Kitchen Finance',
          to: '/console/kitchen/finance',
          icon: 'i-lucide-arrow-right',
        }"
      >
        <MiseboxLandingFinancePreview />
      </LandingProductProofSection>
    </template>

    <template #apps>
      <LandingAppCollection
        :controller="appsController"
        eyebrow="Our apps"
        title="Explore Misebox apps."
        description="See how different hospitality businesses present their own identity, menus and customer experience with Misebox."
        action-label="Explore all Misebox apps"
        action-to="/apps"
        :exclude-ids="['misebox-app']"
        :featured-ids="featuredAppIds"
        :limit="3"
        :media-overrides="featuredAppMedia"
      />
    </template>

    <template #tools>
      <LandingProductCatalogue :content="toolsCatalogue" />
    </template>

    <template #solutions>
      <LandingProductCatalogue :content="solutionsCatalogue" />
    </template>

    <template #operations>
      <LandingProductCatalogue :content="operationsCatalogue" />
    </template>
  </LandingProductIndex>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type {
  LandingProductCatalogueContent,
  LandingProductEntryContent,
  LandingProductIndexContent,
} from 'fireux-core/types/landing-product'
import type {
  FireuxMetaOperation,
  FireuxMetaSolution,
} from 'fireux-core/runtime/models/system/meta-content.model'
import { useEcosystemAppCollection } from 'fireux-core/runtime/composables/fireux/public/app/useEcosystemAppCollection'
import { metaContent } from '../../../meta'
import MiseboxPowerCards from '../PowerCards.vue'
import MiseboxLandingConsolePreview from './ConsolePreview/Index.vue'
import MiseboxLandingFinancePreview from './FinancePreview.vue'
import MiseboxLandingOrderingPreview from './OrderingPreview.vue'

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
const featuredAppIds = [
  'baeren-ringgenberg',
  'interlaken-essen',
  'la-tap-berne',
] as const
const featuredAppMedia = {
  'baeren-ringgenberg': {
    coverUrl: 'https://baeren-ringgenberg.web.app/img/app/background.png',
    logoUrl: 'https://baeren-ringgenberg.web.app/img/app/logo.png',
    mediaLabel: 'Hotel Bären Ringgenberg',
    wordmarkUrl: 'https://baeren-ringgenberg.web.app/img/app/wordmark-dark.png',
  },
  'interlaken-essen': {
    coverUrl: 'https://interlaken-essen.misebox.app/img/app/cover.png',
    logoUrl: 'https://interlaken-essen.misebox.app/img/app/logo.png',
  },
  'la-tap-berne': {
    coverUrl: 'https://tapberne.misebox.app/img/gallery/image-1.png',
    logoUrl: 'https://tapberne.misebox.app/img/app/logo.png',
    wordmarkUrl: 'https://tapberne.misebox.app/img/app/wordmark-dark.png',
  },
} as const
const selectedConsoleSurfaceId = ref('kitchen.dishes')
const landingOperations: readonly FireuxMetaOperation[] =
  metaContent.operations ?? []
const landingSolutions: readonly FireuxMetaSolution[] =
  metaContent.solutions ?? []

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
    title: 'Connect your ingredients.',
    description:
      'Connect the ingredients a Kitchen uses to dishes, recipes, prep items, and available supplier offers.',
    items: [
      'Kitchen ingredients',
      'Dishes and recipes',
      'Prep items',
      'Supplier offers',
    ],
    action: 'Open Ingredients',
    to: '/console/kitchen/ingredients',
  },
  'kitchen.menus': {
    eyebrow: 'Kitchen Console · Menus',
    title: 'Create your menus.',
    description:
      'Arrange dishes into ordering sections, choose how each menu is used, and publish QR codes for guests.',
    items: ['Ordering sections', 'Dishes', 'Ordering formats', 'QR codes'],
    action: 'Open Menus',
    to: '/console/kitchen/menus',
  },
  'kitchen.mise': {
    eyebrow: 'Kitchen Console · Mise',
    title: 'Prepare for service.',
    description:
      'Create prep tasks from dishes and recipes, assign them to stations, set quantities, and track completion before service.',
    items: ['Prep tasks', 'Quantities', 'Stations', 'Completion'],
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
    items: ['Ingredients', 'Quantities', 'Method', 'Yield'],
    action: 'Open Recipes',
    to: '/console/kitchen/recipes',
  },
  'kitchen.stations': {
    eyebrow: 'Kitchen Console · Stations',
    title: 'Coordinate your stations.',
    description:
      'Assign dishes, prep tasks, and service work to the station responsible for completing them.',
    items: ['Dishes', 'Prep tasks', 'Service work', 'Responsibilities'],
    action: 'Open Stations',
    to: '/console/kitchen/stations',
  },
  'kitchen.suppliers': {
    eyebrow: 'Kitchen Console · Suppliers',
    title: 'Source your ingredients.',
    description:
      'Review suppliers linked to the selected Kitchen, their catalogues, covered ingredients, and available pack offers.',
    items: [
      'Linked suppliers',
      'Catalogues',
      'Ingredient links',
      'Pack offers',
    ],
    action: 'Open Suppliers',
    to: '/console/kitchen/suppliers',
  },
  'kitchen.tables': {
    eyebrow: 'Kitchen Console · Tables',
    title: 'Review your tables.',
    description:
      'Review the table numbers configured for the selected Kitchen. Demo leaves tabs and billing empty until a real Table producer exists.',
    items: [
      'Configured table numbers',
      'Selected-Kitchen scope',
      'No invented tabs',
      'No invented billing',
    ],
    action: 'Open Tables',
    to: '/console/kitchen/tables',
  },
  'kitchen.finance': {
    eyebrow: 'Kitchen Console · Finance',
    title: 'Review Kitchen sales.',
    description:
      'Compare gross sales, completed sales, and average sale for the selected period.',
    supporting: 'Choose 7, 30, or 90 days. Each currency remains separate.',
    action: 'Open Kitchen Finance',
    to: '/console/kitchen/finance',
  },
} as const satisfies Record<string, ConsoleSurfaceCopy>

const selectedConsoleCopy = computed<ConsoleSurfaceCopy>(
  () =>
    consoleSurfaceCopy[
      selectedConsoleSurfaceId.value as keyof typeof consoleSurfaceCopy
    ] || consoleSurfaceCopy['kitchen.dishes']
)

const solutionItems = landingSolutions
  .filter(
    (solution) => solution.status === 'live' || solution.status === 'bridge'
  )
  .slice(0, 6)
  .map((solution) => ({
    id: solution.slug,
    title: solution.title,
    description: solution.description,
    icon: solution.icon,
    to: solution.to || solution.cta?.to || `/solutions/${solution.slug}`,
    action: solution.cta?.label || 'View solution',
  }))

const operationItems = landingOperations.map((operation) => ({
  id: operation.id,
  title: operation.title,
  description: operation.description,
  icon: operation.icon,
  to: operation.slug ? `/operations/${operation.slug}` : operation.to,
  action: 'Open operation',
}))

const toolsCatalogue = {
  sectionId: 'misebox-tools',
  eyebrow: 'Tools',
  title: 'Order from a published Menu.',
  description:
    'Choose a published Menu. Collection, delivery, and pre-order appear only when the Menu and Kitchen enable them.',
  items: [
    {
      id: 'ordering',
      title: 'Ordering',
      description:
        'Choose a published Menu and start an available customer order.',
      icon: 'i-lucide-shopping-basket',
      to: '/tools/ordering',
      action: 'Open tool',
    },
  ],
} satisfies LandingProductCatalogueContent

const solutionsCatalogue = {
  sectionId: 'misebox-solutions',
  eyebrow: 'Solutions',
  title: 'Use the restaurant surfaces already available.',
  description:
    'These current Misebox solutions cover public Menus, QR entry, Menu management, recipes, preparation, hiring, and profiles.',
  action: {
    label: 'Explore all solutions',
    to: '/solutions',
    icon: 'i-lucide-arrow-right',
  },
  items: solutionItems,
} satisfies LandingProductCatalogueContent

const operationsCatalogue = {
  sectionId: 'misebox-operations',
  eyebrow: 'Operations',
  title: 'Work inside the Kitchen and Supplier Consoles.',
  description:
    'Each Operation points to a working Console surface owned by its domain package.',
  action: {
    label: 'Explore all operations',
    to: '/operations',
    icon: 'i-lucide-arrow-right',
  },
  items: operationItems,
} satisfies LandingProductCatalogueContent

const entryPaths = {
  sectionId: 'misebox-entry',
  eyebrow: 'Start with Misebox',
  title: 'Need a Kitchen App?',
  description:
    'Set up Kitchen operations or explore a Misebox App already running.',
  paths: [
    {
      id: 'kitchen',
      kind: 'start',
      title: 'Set up a Kitchen',
      description:
        'Create a Kitchen workspace for menus, prep, orders, and service.',
      action: {
        label: 'Get started',
        to: '/get-started',
      },
    },
    {
      id: 'apps',
      kind: 'join',
      title: 'Explore Misebox Apps',
      description:
        'See existing hospitality Apps and their menus, guest surfaces, and Kitchen operations.',
      action: {
        label: 'Explore Apps',
        to: '/apps',
      },
    },
  ],
} satisfies LandingProductEntryContent

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
} as const satisfies LandingProductIndexContent
</script>
