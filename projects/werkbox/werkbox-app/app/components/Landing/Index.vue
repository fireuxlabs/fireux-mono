<template>
  <div>
    <FireLandingProductIndex
      :content="content"
      hero-layout="proof-wide"
      presentation="immersive"
      :region-order="regionOrder"
    >
      <template #hero-preview>
        <LandingHeroPreview />
      </template>

      <template #onboarding>
        <FireLandingProductPricingStrip
          :app-name="pricingAppName"
          :plans="landingTiers"
        />
      </template>

      <template #surfaces>
        <FireLandingProductSurfaceShowcase :items="surfaceItems" />
      </template>

      <template #specifics>
        <FireLandingProductProofSection
          section-id="werkbox-direct-hiring"
          eyebrow="For small businesses"
          title="Pay for the platform, not a percentage of your team."
          description="Werkbox Professional is CHF 20 per month. Publish work, review applications, and hire directly while the employer and professional keep control of their relationship."
          supporting="The named employer—not Werkbox—employs and pays the professional directly."
          :items="[
            'Jobs before signup',
            'Named employers and workplaces',
            'Reusable professional profiles',
            'No hiring commission',
          ]"
          :action="{
            label: 'Start hiring',
            to: '/jobs/manage',
            icon: 'i-lucide-arrow-right',
          }"
        >
          <EmployerValue />
        </FireLandingProductProofSection>

        <FireLandingProductProofSection
          section-id="werkbox-cleaning"
          eyebrow="Cleaning"
          title="Start with work that keeps places ready."
          description="Cleaning is Werkbox’s first practical-work category. Jobs keep their normal identity while organisations and professionals use the same shared network."
          :items="[
            'Cleaning jobs',
            'Service organisations',
            'Professional profiles',
            'Direct applications',
          ]"
          :action="{
            label: 'Explore cleaning',
            to: '/categories/cleaning',
            icon: 'i-lucide-arrow-right',
          }"
          reverse
        >
          <figure class="werkbox-cleaning-proof">
            <img
              src="/img/landing/practical-work-hero-v2.png"
              alt="Professional cleaning work in a modern shared space"
              width="1717"
              height="916"
            />
          </figure>
        </FireLandingProductProofSection>
      </template>

      <template #solutions>
        <FireLandingProductCatalogue :content="networkCatalogue" />
      </template>

      <template #apps>
        <FireLandingAppCollection
          :controller="appsController"
          title="Werkbox's Apps"
          action-label="Explore all Werkbox apps"
          action-to="/apps"
          :exclude-ids="['cleanbox-app']"
          :minimum-items="2"
        />
      </template>
    </FireLandingProductIndex>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppCollection } from 'fireux-core/runtime/app/composables/useAppCollection'
import EmployerValue from './EmployerValue.vue'
import { content, networkCatalogue, surfaceItems } from './landing-content'

const appsController = useAppCollection('/api/apps?limit=24')
const { appName: pricingAppName, landingTiers } = useWerkboxPricing()
const showApps = computed(
  () =>
    appsController.outcome.value === 'pending' ||
    appsController.outcome.value === 'error' ||
    appsController.apps.value.filter(
      (app) => app.status === 'active' && app.id !== 'cleanbox-app'
    ).length > 1
)
const baseRegionOrder = ['surfaces', 'specifics', 'solutions'] as const
const regionOrder = computed(() =>
  showApps.value ? ([...baseRegionOrder, 'apps'] as const) : baseRegionOrder
)
</script>

<style scoped>
.werkbox-cleaning-proof {
  overflow: hidden;
  margin: 0;
  border: 1px solid var(--ui-border);
  border-radius: calc(var(--ui-radius) * 3);
  background: var(--ui-bg-muted);
  box-shadow: var(--shadow-lg);
}

.werkbox-cleaning-proof img {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 10;
  object-fit: cover;
  object-position: 64% center;
}
</style>
