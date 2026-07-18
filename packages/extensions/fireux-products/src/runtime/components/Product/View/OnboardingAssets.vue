<template>
  <div class="step-content">
    <p class="asset-help">
      All assets should be on transparent backgrounds. Preferred formats:
      PNG for raster, SVG for vector. If you only have JPG, we can convert.
    </p>
    <div class="assets-grid">
      <div v-for="spec in onboardingAssetSpecs" :key="spec.key" class="asset-card">
        <p class="asset-label">{{ spec.label }}</p>
        <MoleculesFormsStateImagePicker label="" :state-key="spec.key" />
        <p class="asset-meta">{{ spec.note }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useProductFulfillmentOnboarding } from '../../../composables/fireux/app/product-onboarding/useProductFulfillmentOnboarding';

const { onboardingAssetSpecs } = useProductFulfillmentOnboarding()
</script>

<style scoped>
.step-content {
  margin-top: 1rem;
  padding-bottom: 1.5rem;
}

.asset-help {
  color: #6b7280;
  margin-bottom: 1rem;
}

.assets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.asset-card {
  padding: 1rem;
  border: 1px solid var(--ui-border);
  border-radius: calc(var(--ui-radius) * 1.5);
  background: var(--ui-bg);
}

.asset-label {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.asset-meta {
  margin-top: 0.5rem;
  color: #6b7280;
  font-size: 0.85rem;
}
</style>
