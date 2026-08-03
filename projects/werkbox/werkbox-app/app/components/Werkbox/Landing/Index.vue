<template>
  <LandingProductIndex :content="content">
    <template #onboarding>
      <LandingProductEntryPaths :content="entryPaths" />
    </template>

    <template #specifics>
      <LandingProductProofSection
        section-id="werkbox-direct-hiring"
        eyebrow="For small businesses"
        title="Pay for the platform, not a percentage of your team."
        description="Werkbox Pro is $20 per month. Publish work, review applications, and hire directly while the employer and professional keep control of their relationship."
        supporting="The named employer—not Werkbox—employs and pays the professional directly."
        :items="[
          'Public jobs before signup',
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
      </LandingProductProofSection>

      <LandingProductProofSection
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
      </LandingProductProofSection>
    </template>

    <template #solutions>
      <LandingProductCatalogue :content="networkCatalogue" />
    </template>
  </LandingProductIndex>
</template>

<script setup lang="ts">
import EmployerValue from './EmployerValue.vue'
import { content, entryPaths, networkCatalogue } from './landing-content'
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
