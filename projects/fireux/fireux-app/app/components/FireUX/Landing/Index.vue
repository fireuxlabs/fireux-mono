<!-- Concurrent edit — 2026-07-28 — Align the FireUX and Misebox Main App landing family. -->
<template>
  <LandingProductIndex :content="content">
    <template #hero-preview>
      <FireUXLandingCardOrbit presentation="hero" />
    </template>

    <template #console>
      <LandingProductProofSection
        section-id="fireux-console"
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
        <FireUXLandingConsolePreview
          v-model:surface-id="selectedConsoleSurfaceId"
          :operations="consoleOperations"
        />
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
import { computed, ref } from 'vue'
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
import FireUXLandingConsolePreview from './ConsolePreview/Index.vue'

type ConsoleSurfaceCopy = {
  action: string
  description: string
  eyebrow: string
  items: readonly string[]
  supporting?: string
  title: string
}
type SelectedConsoleSurfaceCopy = ConsoleSurfaceCopy & {
  to: string
}

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

const consoleSurfaceCopy = {
  'project.ignition': {
    eyebrow: 'Project Console · Ignition',
    title: 'Manage Ignition requests.',
    description:
      'Review each request, update its status, and work through the launch checklist.',
    items: ['Business and contact', 'App requirements', 'Access', 'Launch checklist'],
    action: 'Open Ignition',
  },
  'project.apps': {
    eyebrow: 'Project Console · Apps',
    title: 'Review the Apps in a Project.',
    description:
      'See the App records connected to the selected Project and the Ecosystem each App belongs to.',
    items: ['App identity', 'Ecosystem relationship', 'Runtime role', 'Project scope'],
    action: 'Open Project Apps',
  },
  'project.ecosystem': {
    eyebrow: 'Project Console · Ecosystem',
    title: 'Review the Project Ecosystem.',
    description:
      'See the Ecosystem connected to the selected Project and the Apps grouped inside it.',
    items: ['Ecosystem identity', 'Project relationship', 'Connected Apps', 'Current status'],
    action: 'Open Project Ecosystem',
  },
  'project.users': {
    eyebrow: 'Project Console · Users',
    title: 'Monitor new App users.',
    description:
      'Review the bounded signup feed published by Apps connected to FireUX.',
    items: ['Recent joins', 'Source App', 'Project', 'Membership role'],
    supporting: 'Returning sign-ins are excluded from the feed.',
    action: 'Open Project Users',
  },
} as const satisfies Record<string, ConsoleSurfaceCopy>

const selectedConsoleCopy = computed<SelectedConsoleSurfaceCopy>(() => {
  const copy: ConsoleSurfaceCopy =
    consoleSurfaceCopy[
      selectedConsoleSurfaceId.value as keyof typeof consoleSurfaceCopy
    ] || consoleSurfaceCopy['project.apps']
  const operation =
    consoleOperations.find(
      candidate => candidate.id === selectedConsoleSurfaceId.value
    ) || consoleOperations[0]

  return {
    ...copy,
    to: operation?.to || '/console/project',
  }
})

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
  description:
    'Each Solution starts with a specific job for an App to do.',
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
    badge: 'Projects · Apps · Ecosystems',
    kicker: 'FireUX App',
    title: 'Ignite Your Project',
    accent: 'With FireUX',
    description:
      'Onboard your Project through Ignition, manage its Apps, Ecosystem, and users in the Project Console, then add Modules or join an existing Ecosystem when required.',
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
    quietAction: {
      label: 'Browse ecosystems',
      to: '/ecosystems',
    },
    trustItems: [
      'Start App requests with Ignition',
      'Review Project Apps and Ecosystems',
      'Monitor new App users',
    ],
  },
  onboardingLabel: 'onboarding',
} as const satisfies LandingProductIndexContent
</script>
