<!-- Concurrent edit — 2026-07-28 — Align the FireUX and Misebox Main App landing family. -->
<template>
  <div>
    <LandingOperationRail
      ariaLabel="Kitchen operations"
      :operations="operationRailItems"
    />

    <LandingProductIndex
      :content="content"
      hero-layout="proof-wide"
      presentation="immersive"
      :region-order="regionOrder"
    >
      <template #hero-preview>
        <MiseboxLandingHeroImage />
      </template>

      <template #onboarding>
        <MiseboxLandingPricingStrip />
      </template>

      <template #surfaces>
        <MiseboxLandingOrderingShowcase />
      </template>

      <template #specifics>
        <LandingProductProofSection
          section-id="misebox-console"
          copy-emphasis
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

      <template #apps>
        <LandingAppCollection
          :controller="appsController"
          title="Misebox's Apps"
          action-label="Explore all Misebox apps"
          action-to="/apps"
          :exclude-ids="['misebox-app']"
          :featured-ids="featuredAppIds"
          :limit="3"
          :media-overrides="featuredAppMedia"
          :minimum-items="2"
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
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { LandingProductCatalogueContent } from 'fireux-core/types/landing-product'
import type {
  FireuxMetaOperation,
  FireuxMetaSolution,
} from 'fireux-core/config/app/meta-content'
import { useEcosystemAppCollection } from 'fireux-core/runtime/ecosystem/composables/useEcosystemAppCollection'
import { metaContent } from '../../../meta'
import MiseboxLandingConsolePreview from './ConsolePreview/Index.vue'
import MiseboxLandingHeroImage from './HeroImage.vue'
import MiseboxLandingOrderingShowcase from './OrderingShowcase.vue'
import MiseboxLandingPricingStrip from './PricingStrip.vue'
import {
  consoleSurfaceCopy,
  content,
  featuredAppIds,
  featuredAppMedia,
  toolsCatalogue,
  type ConsoleSurfaceCopy,
} from './landing-content'

const appsController = useEcosystemAppCollection()
const showApps = computed(
  () =>
    appsController.outcome.value === 'pending' ||
    appsController.outcome.value === 'error' ||
    appsController.apps.value.filter(
      (app) => app.status === 'active' && app.id !== 'misebox-app'
    ).length > 1
)
const baseRegionOrder = [
  'surfaces',
  'specifics',
  'operations',
  'solutions',
  'tools',
] as const
const regionOrder = computed(() =>
  showApps.value ? ([...baseRegionOrder, 'apps'] as const) : baseRegionOrder
)
const selectedConsoleSurfaceId = ref('kitchen.dishes')
const landingOperations: readonly FireuxMetaOperation[] =
  metaContent.operations?.filter(
    (operation) => operation.console.id === 'kitchen'
  ) ?? []
const landingSolutions: readonly FireuxMetaSolution[] =
  metaContent.solutions ?? []
const operationRailItems = landingOperations.map((operation) => ({
  id: operation.id,
  title: operation.title,
  icon: operation.icon,
  to: operation.slug ? `/operations/${operation.slug}` : operation.to,
}))

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
  title: 'Work inside the Kitchen Console.',
  description:
    'Each Kitchen Operation points to a working Console surface owned by its domain package.',
  action: {
    label: 'Explore all operations',
    to: '/operations',
    icon: 'i-lucide-arrow-right',
  },
  items: operationItems,
} satisfies LandingProductCatalogueContent
</script>
