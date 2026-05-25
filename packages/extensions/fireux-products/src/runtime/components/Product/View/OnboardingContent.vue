<template>
  <div class="step-content">
    <p>Fill this once and we can generate a complete app setup payload.</p>
    <div class="form-actions">
      <UButton color="primary" variant="subtle" @click="applySampleContent">
        Fill test content
      </UButton>
    </div>
    <div class="content-grid">
      <UFormField label="App name" required>
        <UInput v-model="appName" placeholder="FireUX App" />
      </UFormField>
      <UFormField label="App slug" required>
        <UInput v-model="appSlug" placeholder="fireux-app" />
      </UFormField>
      <UFormField label="Ecosystem" required>
        <UInput v-model="appEcosystem" placeholder="fireux-fireux" />
      </UFormField>
      <UFormField label="Domain" required>
        <UInput v-model="appDomain" placeholder="client1.web.app" />
      </UFormField>
      <UFormField label="Tagline">
        <UInput
          v-model="appTagline"
          placeholder="A professional app, built with FireUX."
        />
      </UFormField>
      <UFormField label="Summary">
        <UInput v-model="appSummary" placeholder="Short app summary" />
      </UFormField>
      <UFormField label="Company name" required>
        <UInput v-model="companyName" placeholder="Client One" />
      </UFormField>
      <UFormField label="Contact name" required>
        <UInput v-model="contactName" placeholder="Client Owner" />
      </UFormField>
      <UFormField label="Contact email" required>
        <UInput
          v-model="contactEmail"
          type="email"
          placeholder="owner@client1.test"
        />
      </UFormField>
      <UFormField label="Primary color">
        <UInput v-model="primaryColor" placeholder="#0EA5E9" />
      </UFormField>
      <UFormField label="Secondary color">
        <UInput v-model="secondaryColor" placeholder="#111827" />
      </UFormField>
      <UFormField label="Hero title" required>
        <UInput v-model="heroTitle" placeholder="Welcome to Client One" />
      </UFormField>
      <UFormField label="Hero subtitle">
        <UTextarea
          v-model="heroSubtitle"
          :rows="3"
          placeholder="Fast, professional, and ready to grow."
        />
      </UFormField>
      <UFormField label="Primary CTA label" required>
        <UInput v-model="ctaLabel" placeholder="Buy now" />
      </UFormField>
      <UFormField label="Primary CTA href" required>
        <UInput v-model="ctaHref" placeholder="/buy" />
      </UFormField>
    </div>
    <div class="requirements-block">
      <h3>What we need from you</h3>
      <ul class="requirements">
        <li v-for="(req, index) in requirements" :key="index">
          {{ req }}
        </li>
        <li v-if="!requirements.length">Basic brand assets and initial content.</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useProductFulfillmentOnboarding } from '../../../composables/fireux/app/product-onboarding/useProductFulfillmentOnboarding';

withDefaults(
  defineProps<{
    requirements?: string[]
  }>(),
  {
    requirements: () => [],
  }
)

const {
  appName,
  appSlug,
  appTagline,
  appSummary,
  appDomain,
  appEcosystem,
  companyName,
  contactName,
  contactEmail,
  primaryColor,
  secondaryColor,
  heroTitle,
  heroSubtitle,
  ctaLabel,
  ctaHref,
  applySampleContent,
} = useProductFulfillmentOnboarding()
</script>

<style scoped>
.step-content {
  margin-top: 1rem;
  padding-bottom: 1.5rem;
}

.form-actions {
  margin: 1rem 0;
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 0.75rem;
}

.requirements-block h3 {
  margin: 1.25rem 0 0.5rem;
  font-size: 1rem;
}

.requirements {
  padding-left: 1.2rem;
  color: #374151;
}
</style>
