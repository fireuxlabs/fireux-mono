<template>
  <div class="step-content">
    <p>We assemble the app, then you review and request changes.</p>
    <div class="review-json">
      <DevJson
        title="App Fulfillment Payload"
        context="products/[id] onboarding review"
        :data="appCreationPayload"
        :default-open="true"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useProductFulfillmentOnboarding } from '../../../composables/fireux/app/product-onboarding/useProductFulfillmentOnboarding';

const { appCreationPayload } = useProductFulfillmentOnboarding()
</script>

<style scoped>
.step-content {
  margin-top: 1rem;
  padding-bottom: 1.5rem;
}

.review-json {
  margin-top: 1rem;
}
</style>
