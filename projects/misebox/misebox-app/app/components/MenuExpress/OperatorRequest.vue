<template>
  <section class="fx-page-stack">
    <UButton :loading="state.busy" @click="state.reload"
      >Refresh selected request</UButton
    >
    <UAlert
      v-if="state.error"
      color="error"
      title="Action unavailable"
      :description="state.error"
    />
    <template v-if="state.request">
      <h2>{{ state.request.venue }}</h2>
      <p>
        {{ state.request.location }} · {{ state.request.contact.name }} ·
        {{ state.request.contact.email }}
      </p>
      <p>{{ state.request.instructions }}</p>
      <p>
        Stage: {{ state.request.stage }} ·
        {{ state.request.demo ? 'DEMO payment' : 'Payment' }}:
        {{ state.request.payment.status }}
      </p>
      <MenuExpressSources :state="state" />
      <UButton
        v-if="
          localDevelopment &&
          state.request.demo &&
          state.request.payment.status !== 'paid'
        "
        :loading="state.busy"
        @click="state.act('demo-payment')"
        >Record demo payment — no charge</UButton
      >
      <MenuExpressPreparation
        v-if="state.request.stage !== 'delivered'"
        :state="state"
      />
      <UAlert
        v-if="state.request.correction"
        color="warning"
        title="Customer correction"
        :description="state.request.correction"
      />
      <MenuExpressPreview
        v-if="state.request.review"
        :review="state.request.review"
      />
      <UButton
        v-if="state.request.target && state.request.stage !== 'delivered'"
        :loading="state.busy"
        @click="state.act('review')"
        >Send current menu for review</UButton
      >
      <UButton
        v-if="state.request.stage === 'approved'"
        :loading="state.busy"
        @click="state.act('deliver')"
        >Publish approved menu and deliver</UButton
      >
      <MenuExpressDelivery
        v-if="state.request.delivery"
        :delivery="state.request.delivery"
      />
      <MenuExpressConversation :state="state" label="Message to customer" />
    </template>
  </section>
</template>
<script setup lang="ts">
import { reactive } from 'vue'
import { useMenuExpressRequest } from '../../composables/useMenuExpressRequest'
const props = defineProps<{ requestId: string }>()
const localDevelopment = import.meta.dev
const state = reactive(useMenuExpressRequest(() => props.requestId, true))
</script>
