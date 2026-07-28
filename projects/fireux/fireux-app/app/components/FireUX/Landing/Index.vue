<!-- Concurrent edit — 2026-07-28 — Align the FireUX and Misebox Main App landing family. -->
<template>
  <LandingProductIndex :content="content">
    <template #hero-preview>
      <FireUXLandingCardOrbit presentation="hero" />
    </template>

    <template #console>
      <LandingProductProofSection
        section-id="fireux-console"
        eyebrow="Project Console"
        title="Run every app from one project."
        description="Review Ignitions, Apps, the selected Ecosystem, and new Users through the Project Console."
        :items="projectConsoleItems"
        :action="{
          label: 'Open Project Console',
          to: '/console/project',
          icon: 'i-lucide-arrow-right',
        }"
      >
        <FireUXLandingPreview :operations="operations" initial-mode="project" />
      </LandingProductProofSection>
    </template>

    <template #ecosystems>
      <LandingEcosystems />
    </template>

    <template #apps>
      <LandingAppCollection
        :controller="appsController"
        eyebrow="Ecosystem apps"
        title="See the apps already running on FireUX."
        description="Browse active Apps across the FireUX platform and open each canonical App detail."
        action-label="Explore all apps"
        action-to="/apps"
        :limit="6"
      />
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
import type {
  LandingProductCatalogueContent,
  LandingProductIndexContent,
} from 'fireux-core/types/landing-product'
import type {
  FireuxMetaOperation,
  FireuxMetaSolution,
} from 'fireux-core/runtime/models/system/meta-content.model'
import { metaContent } from '../../../meta'
import { usePlatformAppDirectory } from '../../../composables/usePlatformDirectory'
import FireUXLandingPreview from './Preview.vue'

const appsController = usePlatformAppDirectory()
const landingOperations: readonly FireuxMetaOperation[] =
  metaContent.operations ?? []
const landingSolutions: readonly FireuxMetaSolution[] =
  metaContent.solutions ?? []

const operations = landingOperations.map((operation) => ({
  id: operation.id,
  title: operation.title,
  description: operation.description,
  icon: operation.icon,
  to: operation.slug ? `/operations/${operation.slug}` : operation.to,
}))

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

const projectConsoleItems = [
  'Ignition requests',
  'Project Apps',
  'Selected Ecosystem',
  'New Users',
] as const

const solutionsCatalogue = {
  sectionId: 'fireux-solutions',
  eyebrow: 'Solutions',
  title: 'Start with a proven app shape.',
  description:
    'These authored solutions describe current FireUX App, portal, directory, and internal-workflow paths.',
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
  items: operations,
} satisfies LandingProductCatalogueContent

const content = {
  hero: {
    badge: '$150 setup · $15/month',
    kicker: 'Ignite your idea.',
    title: 'Your business.',
    accent: 'Your app.',
    description:
      'We configure and launch a branded web app around one useful job. You get an installable PWA, accounts, an operator console, hosting, updates, and maintenance.',
    primaryAction: {
      label: 'Request Ignition',
      to: '/get-started#ignition-request',
      icon: 'i-lucide-rocket',
    },
    secondaryAction: {
      label: 'See price and scope',
      to: '/get-started',
      icon: 'i-lucide-receipt-text',
    },
    quietAction: {
      label: 'Browse FireUX apps',
      to: '/apps',
    },
    trustItems: [
      'One job for the app to do',
      'Your brand, accounts, and console',
      'Hosting and maintenance included',
    ],
  },
  onboardingLabel: 'onboarding',
} as const satisfies LandingProductIndexContent
</script>
