<template>
  <UCard aria-live="polite" :description="responseMessage">
    <template #title
      ><h2>{{ responseTitle }}</h2></template
    >
    <div class="fx-card-body-stack">
      <p
        v-if="
          submission.message &&
          !['ready', 'completed'].includes(submission.state)
        "
      >
        {{ submission.message }}
      </p>
      <p
        v-if="
          submission.estimate_minutes &&
          ['accepted', 'preparing'].includes(submission.state)
        "
      >
        Estimated time: {{ submission.estimate_minutes }} minutes.
      </p>
      <p v-if="submission.pricing">
        Items total {{ submission.pricing.currency }}
        {{ submission.pricing.total.toFixed(2) }}
      </p>
    </div>
  </UCard>
  <KitchenOrdersTicket :order="submission.order" :editable="false" />
  <UButton
    label="New order"
    :disabled="pending"
    variant="outline"
    @click="emit('reset')"
  />
</template>
<script setup lang="ts">
import type { OrderSubmission } from '../../../kitchen/models/order-submission.model'
defineProps<{
  submission: OrderSubmission
  responseTitle: string
  responseMessage: string
  pending: boolean
}>()
const emit = defineEmits<{ reset: [] }>()
</script>
