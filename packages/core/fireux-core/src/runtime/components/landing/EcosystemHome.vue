<template>
  <div>
    <FireLandingOperationRail
      v-if="railItems.length"
      :ariaLabel="railLabel"
      :operations="railItems"
    />

    <FireLandingProductIndex
      :content="content"
      hero-layout="proof-wide"
      presentation="immersive"
      :region-order="regionOrder"
      :section-dwell="sectionDwell"
    >
      <template #hero-preview>
        <slot name="hero-preview">
          <FireLandingProductHeroImage
            :src="heroImage"
            :alt="heroAlt"
            :position="heroPosition"
          />
        </slot>
      </template>

      <template #onboarding>
        <FireLandingProductPricingStrip
          :app-name="appName"
          :plans="props.pricingPlans"
        />
      </template>

      <template v-if="surfaceItems.length" #surfaces>
        <slot name="surfaces">
          <FireLandingProductSurfaceShowcase :items="surfaceItems" />
        </slot>
      </template>

      <template v-if="showApps" #apps>
        <FireLandingAppCollection
          :controller="appsController"
          :title="`${appName}'s Apps`"
          action-label="Explore all apps"
          action-to="/apps"
          :exclude-ids="[appId]"
          :minimum-items="2"
        />
      </template>
    </FireLandingProductIndex>

    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFireUXConfig } from '../../app/composables/config/FireUXConfig'
import { useAppCollection } from '../../app/composables/useAppCollection'
import type {
  LandingPricingPlan,
  LandingOperationRailItem,
  LandingProductIndexContent,
  LandingProductSurface,
} from './product.types'

const props = withDefaults(
  defineProps<{
    content: LandingProductIndexContent
    heroAlt: string
    heroImage: string
    heroPosition?: string
    pricingPlans: readonly LandingPricingPlan[]
    railItems?: readonly LandingOperationRailItem[]
    railLabel?: string
    sectionDwell?: boolean
    surfaceItems?: readonly LandingProductSurface[]
  }>(),
  {
    heroPosition: 'center',
    railItems: () => [],
    railLabel: 'Product work',
    sectionDwell: true,
    surfaceItems: () => [],
  }
)

const { appId, appName } = useFireUXConfig()
const appsController = useAppCollection('/api/apps?limit=24')
const eligibleApps = computed(() =>
  appsController.apps.value.filter(
    (app) => app.status === 'active' && app.id !== appId
  )
)
const showApps = computed(
  () =>
    appsController.outcome.value === 'pending' ||
    appsController.outcome.value === 'error' ||
    eligibleApps.value.length > 1
)
const regionOrder = computed(() => [
  ...(props.surfaceItems.length ? (['surfaces'] as const) : []),
  ...(showApps.value ? (['apps'] as const) : []),
])
</script>
