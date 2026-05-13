<template>
  <section class="product-section">
    <div class="stepper-header">
      <div>
        <h2>Onboarding Sequence</h2>
        <p class="stepper-meta">4 steps, accordion view.</p>
      </div>
    </div>
    <UAccordion
      type="single"
      :items="accordionSteps"
      :default-value="accordionSteps[0]?.value"
      collapsible
      :ui="{ color: 'primary' }"
    >
      <template #leading="{ item, index }">
        <UButton
          disabled
          color="primary"
          :variant="stepIsComplete(item.value) ? 'solid' : 'subtle'"
          class="step-pill font-bold rounded-full"
        >
          {{ index + 1 }}
        </UButton>
      </template>
      <template #default="{ item }">
        <div class="accordion-title">
          <span class="accordion-label--neutral">{{ item.label }}</span>
        </div>
      </template>
      <template #body="{ item }">
        <ProductViewOnboardingAssets v-if="item.value === 'assets'" />
        <ProductViewOnboardingContent
          v-else-if="item.value === 'content'"
          :requirements="requirements"
        />
        <ProductViewOnboardingReview v-else-if="item.value === 'review'" />
        <ProductViewOnboardingLaunch v-else-if="item.value === 'launch'" />
      </template>
    </UAccordion>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useProductFulfillmentOnboarding } from '../../../../composables/fireux/app/product-onboarding/useProductFulfillmentOnboarding'
import type { FirebaseProduct } from '../../../../models/product.model'
import ProductViewOnboardingAssets from './OnboardingAssets.vue'
import ProductViewOnboardingContent from './OnboardingContent.vue'
import ProductViewOnboardingLaunch from './OnboardingLaunch.vue'
import ProductViewOnboardingReview from './OnboardingReview.vue'

const props = defineProps<{
  product?: Partial<FirebaseProduct>
}>()

const accordionSteps = [
  { value: 'assets', label: 'Assets and basics' },
  { value: 'content', label: 'Initial content' },
  { value: 'review', label: 'Build and review' },
  { value: 'launch', label: 'Launch' },
]

const { requiredAssetsComplete, requiredContentComplete } = useProductFulfillmentOnboarding(computed(() => props.product))

const requirements = computed<string[]>(() => {
  const value = props.product?.metadata?.delivery?.requirements
  return Array.isArray(value) ? value.map((entry) => String(entry || '')) : []
})

const stepIsComplete = (value: string) => {
  if (value === 'assets') return requiredAssetsComplete.value
  if (value === 'content') return requiredContentComplete.value
  if (value === 'review') {
    return requiredAssetsComplete.value && requiredContentComplete.value
  }
  if (value === 'launch') {
    return requiredAssetsComplete.value && requiredContentComplete.value
  }
  return true
}
</script>

<style scoped>
.stepper-header {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.stepper-meta {
  color: #6b7280;
  font-size: 0.85rem;
}

.step-pill {
  border-radius: 999px;
  min-width: 2rem;
  justify-content: center;
  font-weight: 600;
  pointer-events: none;
}

.accordion-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  width: 100%;
}

.accordion-label--neutral {
  color: inherit;
}
</style>
