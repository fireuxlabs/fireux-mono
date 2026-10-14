<template>
  <UCard aria-live="polite">
    <h2 class="text-xl font-semibold">{{ responseTitle }}</h2>
    <p class="mt-2">{{ responseMessage }}</p>
    <p
      v-if="
        submission.message && !['ready', 'completed'].includes(submission.state)
      "
      class="mt-2"
    >
      {{ submission.message }}
    </p>
    <p
      v-if="
        submission.estimate_minutes &&
        ['accepted', 'preparing'].includes(submission.state)
      "
      class="mt-2"
    >
      Estimated time: {{ submission.estimate_minutes }} minutes.
    </p>
    <p v-if="submission.pricing" class="mt-3 font-semibold">
      Items total {{ submission.pricing.currency }}
      {{ submission.pricing.total.toFixed(2) }}
    </p>
  </UCard>
  <Ticket :order="submission.order" :editable="false" class="max-w-lg" />
  <UButton
    label="New order"
    :disabled="pending"
    variant="outline"
    @click="emit('reset')"
  />
</template>
<script setup lang="ts">
import Ticket from '../../../kitchen/components/Orders/Ticket.vue'
import type { OrderSubmission } from '../../../kitchen/models/order-submission.model'
defineProps<{
  submission: OrderSubmission
  responseTitle: string
  responseMessage: string
  pending: boolean
}>()
const emit = defineEmits<{ reset: [] }>()
</script>
