<template>
  <UPage>
    <UPageHeader
      title="Purchase confirmed"
      description="Your checkout has been received."
    />
    <UPageBody class="space-y-4">
      <UAlert
        color="success"
        variant="soft"
        title="Thank you"
        description="Your purchase has been confirmed."
      />

      <UAlert
        color="primary"
        variant="subtle"
        title="Payment status"
        :description="paymentMessage"
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
const paymentMessage = computed(() => {
  if (error.value) {
    return 'We could not verify this checkout session. Please check your payment provider.'
  }
  if (!sessionId) {
    return 'No checkout session was provided.'
  }
  if (sessionPayload.value?.payment_status === 'paid') {
    return 'Payment confirmed.'
  }
  return 'Checkout received. Payment confirmation is still pending.'
})
</script>
