<!-- Concurrent edit — 2026-07-28 — Align the FireUX and Misebox Main App landing family. -->
<template>
  <div>
    <FireLandingProductIndex
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
        <section aria-labelledby="team-access-heading" class="pagebody">
          <h2 id="team-access-heading" class="fx-type-section-title">
            Your team, your way
          </h2>
          <p class="fx-type-body">
            Shared Misebox gives team members broad access, with limits based on
            their subscription. Your own managed App lets us configure who can
            view and change each area.
          </p>
          <p class="fx-type-caption">
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

      <template #surfaces> </template>

      <template #apps>
        <FireLandingAppCollection
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
        <FireLandingProductCatalogue :content="toolsCatalogue" />
      </template>

      <template #solutions>
        <FireLandingProductCatalogue :content="solutionsCatalogue" />
      </template>
    </FireLandingProductIndex>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useWorkspaceEntryCta } from 'fireux-core/runtime/workspace/composables/useWorkspaceEntryCta'
import type { LandingProductCatalogueContent } from 'fireux-app/runtime/models/landing/product'
import type { FireuxMetaSolution } from 'fireux-core/runtime/app/literature/types'
import { useAppCollection } from 'fireux-core/runtime/app/composables/useAppCollection'
import { metaContent } from '../../meta'
import LandingHeroImage from './HeroImage.vue'
import {
  content as landingContent,
  featuredAppIds,
  featuredAppMedia,
  toolsCatalogue,
} from '~/content/landing'

const { workspaceEntryHref } = useWorkspaceEntryCta('kitchen')
const content = computed(() => ({
  ...landingContent,
  hero: {
    ...landingContent.hero,
    secondaryAction: {
      ...landingContent.hero.secondaryAction,
      to: workspaceEntryHref.value,
    },
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
const baseRegionOrder = ['surfaces', 'solutions', 'tools'] as const
const regionOrder = computed(() =>
  showApps.value ? ([...baseRegionOrder, 'apps'] as const) : baseRegionOrder
)
const landingSolutions: readonly FireuxMetaSolution[] =
  metaContent.solutions ?? []

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
</script>
