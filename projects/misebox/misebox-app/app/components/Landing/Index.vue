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
        <LandingHeroImage />
      </template>

      <template #onboarding>
        <LandingPricingStrip />
        <section
          aria-labelledby="team-access-heading"
          class="mx-auto max-w-4xl space-y-4 px-6 py-12"
        >
          <h2 id="team-access-heading" class="text-2xl font-semibold">
            Your team, your way
          </h2>
          <p class="text-muted">
            Shared Misebox gives team members broad access, with limits based
            on their subscription. Your own managed App lets us configure
            who can view and change each area.
          </p>
          <p class="text-sm text-muted">
            Subscription limits control usage. They do not replace access
            controls for sensitive information or important changes.
          </p>
          <UButton
            to="/pricing/apps"
            label="Explore your own App"
            icon="i-lucide-arrow-right"
            trailing
            variant="soft"
          />
        </section>
      </template>

      <template #surfaces>

      </template>

      <template #specifics>
        <LandingProductProofSection
          section-id="misebox-workspace"
          copy-emphasis
          :eyebrow="selectedWorkspaceCopy.eyebrow"
          :title="selectedWorkspaceCopy.title"
          :description="selectedWorkspaceCopy.description"
          :supporting="selectedWorkspaceCopy.supporting"
          :items="selectedWorkspaceCopy.items"
          :action="{
            label: selectedWorkspaceCopy.action,
            to: selectedWorkspaceCopy.to,
            icon: 'i-lucide-arrow-right',
          }"
        >
          <LandingWorkspacePreview
            v-model:surface-id="selectedWorkspaceSurfaceId"
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
import { useWorkspaceEntryCta } from 'fireux-core/runtime/workspace/composables/useWorkspaceEntryCta'
import type { LandingProductCatalogueContent } from 'fireux-core/runtime/components/landing/product.types'
import type {
  FireuxMetaOperation,
  FireuxMetaSolution,
} from 'fireux-core/config/app/meta-content'
import { useAppCollection } from 'fireux-core/runtime/app/composables/useAppCollection'
import { metaContent } from '../../meta'
import LandingWorkspacePreview from './WorkspacePreview/Index.vue'
import LandingHeroImage from './HeroImage.vue'
import LandingPricingStrip from './PricingStrip.vue'
import {
  workspaceSurfaceCopy,
  content as landingContent,
  featuredAppIds,
  featuredAppMedia,
  toolsCatalogue,
  type WorkspaceSurfaceCopy,
} from './landing-content'

const { workspaceEntryHref } = useWorkspaceEntryCta('kitchen')
const content = computed(() => ({
  ...landingContent,
  hero: {
    ...landingContent.hero,
    secondaryAction: { ...landingContent.hero.secondaryAction, to: workspaceEntryHref.value },
  },
}))
const appsController = useAppCollection('/api/apps?limit=24')
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
const selectedWorkspaceSurfaceId = ref('kitchen.dishes')
const landingOperations: readonly FireuxMetaOperation[] =
  metaContent.operations?.filter(
    (operation) => operation.workspace.id === 'kitchen'
  ) ?? []
const landingSolutions: readonly FireuxMetaSolution[] =
  metaContent.solutions ?? []
const operationRailItems = landingOperations.map((operation) => ({
  id: operation.id,
  title: operation.title,
  icon: operation.icon,
  to: operation.slug ? `/operations/${operation.slug}` : operation.to,
}))

const selectedWorkspaceCopy = computed<WorkspaceSurfaceCopy>(
  () =>
    workspaceSurfaceCopy[
      selectedWorkspaceSurfaceId.value as keyof typeof workspaceSurfaceCopy
    ] || workspaceSurfaceCopy['kitchen.dishes']
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
  title: 'Work inside the Kitchen Workspace.',
  description:
    'Each Kitchen Operation points to a working Workspace surface owned by its domain package.',
  action: {
    label: 'Explore all operations',
    to: '/operations',
    icon: 'i-lucide-arrow-right',
  },
  items: operationItems,
} satisfies LandingProductCatalogueContent
</script>
