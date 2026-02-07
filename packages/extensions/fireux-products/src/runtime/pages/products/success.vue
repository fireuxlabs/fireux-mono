<template>
  <UPage>
    <UPageHeader
      title="Purchase received"
      description="Template access is delivered after payment."
    />
    <UPageBody class="space-y-4">
      <UAlert
        color="success"
        variant="soft"
        title="Thank you"
        description="We’ll email repository access shortly."
      />

      <UAlert
        color="primary"
        variant="subtle"
        title="Delivery status"
        :description="deliveryMessage"
      />

      <DevJson
        v-if="sessionPayload"
        :title="'Checkout Session (JSON)'"
        context="products/success"
        :data="sessionPayload"
        :default-open="false"
      />

      <div class="flex gap-3">
        <UButton to="/products" variant="outline">Back to products</UButton>
        <UButton v-if="productSlug" :to="`/products/${productSlug}`">View product</UButton>
      </div>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFetch, useRoute } from '#app'

const route = useRoute()
const sessionId = String(route.query.session_id || '').trim()
const productSlug = String(route.query.product || '').trim()

const { data, error } = await useFetch('/api/stripe/checkout-session', {
  query: sessionId ? { session_id: sessionId } : undefined,
  immediate: Boolean(sessionId),
})

const sessionPayload = computed(() => data.value || null)
const deliveryMessage = computed(() => {
  if (error.value) {
    return 'Payment was received. Access will still be delivered manually.'
  }
  if (!sessionId) {
    return 'If you completed payment, access is queued for manual invite.'
  }
  return 'Payment confirmed. Access is queued and will be delivered soon.'
})
</script>
