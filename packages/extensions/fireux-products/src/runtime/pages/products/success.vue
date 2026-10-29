<template>
  <UPage>
    <UPageHeader title="Checkout status" />
    <UPageBody>
      <UAlert
        :color="confirmed ? 'success' : 'neutral'"
        :title="confirmed ? 'Checkout complete' : 'Payment verification'"
        :description="message"
      />
      <UButton v-if="sessionId" :loading="status === 'pending'" @click="refresh()">
        Check again
      </UButton>
      <UButton to="/products" variant="outline">Back to products</UButton>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFetch, useRoute } from 'nuxt/app'

const route = useRoute()
const sessionId = computed(() =>
  typeof route.query.session_id === 'string' ? route.query.session_id : ''
)
const { data, error, status, refresh } = await useFetch<{
  status: string | null
  payment_status: string
}>('/api/stripe/checkout-status', {
  query: computed(() => ({ session_id: sessionId.value })),
  server: false,
  immediate: Boolean(sessionId.value),
})

const confirmed = computed(
  () =>
    !error.value &&
    data.value?.status === 'complete' &&
    ['paid', 'no_payment_required'].includes(data.value.payment_status)
)
const message = computed(() => {
  if (!sessionId.value) return 'No checkout session was provided.'
  if (status.value === 'pending') return 'Checking your payment with Stripe.'
  if (error.value) {
    return 'This browser could not verify the checkout. Check your Stripe receipt or contact the seller before trying another payment.'
  }
  if (confirmed.value) {
    return data.value?.payment_status === 'paid'
      ? 'Stripe confirms your payment. Delivery is a separate step.'
      : 'Stripe confirms this checkout requires no payment. Delivery is a separate step.'
  }
  if (data.value?.status === 'expired') return 'This checkout expired.'
  return 'Payment is not confirmed yet. Check again before trying another payment.'
})
</script>
