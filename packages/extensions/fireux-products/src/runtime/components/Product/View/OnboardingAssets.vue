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
  margin-top: calc(var(--spacing) * 4);
  padding-bottom: calc(var(--spacing) * 6);
}

.asset-help {
  color: #6b7280;
  margin-bottom: calc(var(--spacing) * 4);
}

.assets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: calc(var(--spacing) * 4);
}

.asset-card {
  padding: calc(var(--spacing) * 4);
  border: 1px solid var(--ui-border);
  border-radius: calc(var(--ui-radius) * 1.5);
  background: var(--ui-bg);
}

.asset-label {
  font-weight: var(--font-weight-semibold);
  margin-bottom: calc(var(--spacing) * 2);
}

.asset-meta {
  margin-top: calc(var(--spacing) * 2);
  color: #6b7280;
  font-size: var(--text-sm);
}
</style>
