<!-- Concurrent edit — 2026-07-28 — Align the FireUX and Misebox Main App landing family. -->
<template>
  <div>
    <LandingOperationRail
      ariaLabel="Project operations"
      :operations="catalogueOperations"
    />

    <LandingProductIndex
      :content="content"
      hero-layout="proof-wide"
      presentation="immersive"
      :region-order="[
        'surfaces',
        'ecosystems',
        'apps',
        'solutions',
        'operations',
      ]"
    >
      <template #hero-preview>
        <FireUXLandingCardOrbit presentation="hero" />
      </template>

      <template #onboarding>
        <FireUXLandingPricingStrip />
      </template>

      <template #surfaces>
        <FireUXLandingSurfaceShowcase
          v-model:surface-id="selectedConsoleSurfaceId"
          :operations="consoleOperations"
          :copy="projectConsoleCopy"
        />
      </template>

      <template #apps>
        <LandingAppCollection
          :controller="appsController"
          title="FireUX's Apps"
          action-label="Explore all apps"
          action-to="/apps"
          :limit="6"
        />
      </template>

      <template #ecosystems>
        <LandingEcosystems />
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
import { ref } from 'vue'
import type {
  LandingProductCatalogueContent,
  LandingProductIndexContent,
} from 'fireux-core/types/landing-product'
import type {
  FireuxMetaOperation,
  FireuxMetaSolution,
} from 'fireux-core/runtime/models/system/meta-content.model'
import { fireuxOffer, metaContent } from '../../../meta'
import { usePlatformAppDirectory } from '../../../composables/usePlatformDirectory'
import FireUXLandingPricingStrip from './PricingStrip.vue'

const appsController = usePlatformAppDirectory()
const selectedConsoleSurfaceId = ref('project.apps')
const landingOperations: readonly FireuxMetaOperation[] =
  metaContent.operations ?? []
const landingSolutions: readonly FireuxMetaSolution[] =
  metaContent.solutions ?? []

const consoleOperations = landingOperations.map((operation) => ({
  id: operation.id,
  title: operation.title,
  description: operation.description,
  icon: operation.icon || 'i-lucide-circle-dot',
  to: operation.to,
}))
const catalogueOperations = landingOperations.map((operation) => ({
  id: operation.id,
  title: operation.title,
  description: operation.description,
  icon: operation.icon || 'i-lucide-circle-dot',
  to: operation.slug ? `/operations/${operation.slug}` : operation.to,
}))

const projectConsoleCopy = {
  title: 'Project Console',
  description:
    'Develop and monitor your Project, its Apps, Ecosystem and users from one Console.',
  items: ['Apps', 'Ecosystem', 'Users', 'Project identity'],
  action: 'Open Project Console',
  to: '/console/project',
} as const

const solutions = landingSolutions
  .filter(
    (solution) => solution.owner?.id === 'fireux' && solution.status === 'live'
  )
  .slice(0, 6)
  .map((solution) => ({
    id: solution.slug,
    title: solution.title,
    description: solution.description,
    icon: solution.icon,
    to: solution.to || `/solutions/${solution.slug}`,
    action: solution.cta?.label || 'View solution',
  }))

const solutionsCatalogue = {
  sectionId: 'fireux-solutions',
  eyebrow: 'Solutions',
  title: 'What can FireUX launch?',
  description: 'Each Solution starts with a specific job for an App to do.',
  action: {
    label: 'Explore all solutions',
    to: '/solutions',
    icon: 'i-lucide-arrow-right',
  },
  items: solutions,
} satisfies LandingProductCatalogueContent

const operationsCatalogue = {
  sectionId: 'fireux-operations',
  eyebrow: 'Operations',
  title: 'Work inside the Project Console.',
  description:
    'Each Operation below points to a working Project Console surface.',
  action: {
    label: 'Explore all operations',
    to: '/operations',
    icon: 'i-lucide-arrow-right',
  },
  items: catalogueOperations,
} satisfies LandingProductCatalogueContent

const content = {
  hero: {
    title: 'Ignite Your Project',
    accent: 'With FireUX',
    description: fireuxOffer.heroDescription,
    primaryAction: {
      label: 'Get started',
      to: '/get-started',
      icon: 'i-lucide-rocket',
    },
    secondaryAction: {
      label: 'Go to console',
      to: '/console/project',
      icon: 'i-lucide-layout-dashboard',
    },
    trustItems: [],
  },
} as const satisfies LandingProductIndexContent
</script>
