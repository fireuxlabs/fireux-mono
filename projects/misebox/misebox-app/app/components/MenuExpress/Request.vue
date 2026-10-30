<template>
  <section class="fx-page-stack">
    <UAlert
      v-if="state.error"
      color="error"
      title="Request unavailable"
      :description="state.error"
    />
    <template v-if="state.request">
      <h2>{{ state.request.venue }}</h2>
      <UBadge v-if="state.request.demo" color="warning"
        >DEMO — no charge</UBadge
      >
      <p>
        Stage: {{ state.request.stage }} ·
        {{ state.request.demo ? 'Demo payment' : 'Payment' }}:
        {{ state.request.payment.status }}
      </p>
      <UButton :loading="state.busy" @click="state.reload"
        >Refresh request</UButton
      >
    </template>
    <MenuExpressRecovery :state="state" />
    <template v-if="state.request">
      <MenuExpressSources :state="state" allow-upload />
      <UButton
        v-if="!state.request.demo && state.request.payment.status !== 'paid'"
        :loading="state.busy"
        :disabled="!state.request.sourceUrl && !state.request.sources.length"
        @click="state.checkout"
        >Continue to checkout</UButton
      >
      <MenuExpressCustomerReview :state="state" />
      <MenuExpressDelivery
        v-if="state.request.delivery"
        :delivery="state.request.delivery"
      />
      <MenuExpressConversation
        :state="state"
        label="Message to the Misebox team"
      />
    </template>
  </section>
</template>
<script setup lang="ts">
import { reactive } from 'vue'
import { useMenuExpressRequest } from '../../composables/useMenuExpressRequest'
const props = defineProps<{ requestId: string }>()
const state = reactive(useMenuExpressRequest(() => props.requestId))
</script>
