<!-- Concurrent edit — 2026-07-28 — Align the FireUX and Misebox Main App landing family. -->
<template>
  <div>
    <MiseboxLandingOperationRail :operations="landingOperations" />

    <LandingProductIndex
      :content="content"
      hero-layout="proof-wide"
      onboarding-placement="hero"
    >
      <template #hero-preview>
        <MiseboxLandingHeroImage />
      </template>

      <template #onboarding>
        <MiseboxLandingPricingStrip />
      </template>

      <template #console>
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

      <template #specifics>
        <LandingProductProofSection
          section-id="misebox-menu-surfaces"
          copy-emphasis
          eyebrow="Menu surfaces"
          title="Serve phones and kiosks."
          description="Guests order for collection or delivery when the selected Menu and Kitchen configure those paths."
          :items="['Self-service kiosk']"
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
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { LandingProductCatalogueContent } from 'fireux-core/types/landing-product'
import type {
  FireuxMetaOperation,
  FireuxMetaSolution,
} from 'fireux-core/runtime/models/system/meta-content.model'
import { useEcosystemAppCollection } from 'fireux-core/runtime/composables/fireux/public/app/useEcosystemAppCollection'
import { metaContent } from '../../../meta'
import MiseboxLandingConsolePreview from './ConsolePreview/Index.vue'
import MiseboxLandingFinancePreview from './FinancePreview.vue'
import MiseboxLandingHeroImage from './HeroImage.vue'
import MiseboxLandingOrderingPreview from './OrderingPreview.vue'
import MiseboxLandingOperationRail from './OperationRail.vue'
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
const selectedConsoleSurfaceId = ref('kitchen.dishes')
const landingOperations: readonly FireuxMetaOperation[] =
  metaContent.operations?.filter(
    (operation) => operation.console.id === 'kitchen'
  ) ?? []
const landingSolutions: readonly FireuxMetaSolution[] =
  metaContent.solutions ?? []

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
