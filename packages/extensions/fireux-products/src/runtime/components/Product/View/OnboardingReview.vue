<template>
  <div class="step-content">
    <p>We assemble the app, then you review and request changes.</p>
    <div class="review-json">
<DevDebugPanel
  object-origin="fetched"
        launcher
        include-route
        title="App Fulfillment Payload"
        context="products/[id] onboarding review"
        :objects="appCreationPayload"
  :derived="{}"
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
  margin-top: calc(var(--spacing) * 4);
  padding-bottom: calc(var(--spacing) * 6);
}

.review-json {
  margin-top: calc(var(--spacing) * 4);
}
</style>
