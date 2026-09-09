<template>
  <section class="grid gap-4 lg:grid-cols-[18rem_minmax(0,1fr)]">
    <div class="space-y-3">
      <h2 class="text-lg font-black text-highlighted">Kitchen receiving</h2>

      <WorkspaceKitchenOrdersReceiving
        v-if="awaitingDecision"
        :accepting="false"
        :estimate-minutes="estimateMinutes"
        :now-ms="nowMs"
        :order="displayOrder"
        :rejecting="false"
        @accept="accept"
        @nudge-estimate="nudgeEstimate($event.amount)"
        @reject="reject"
        @set-estimate="setEstimate($event.minutes)"
      />

      <div v-else class="grid gap-3">
        <div class="flex flex-wrap items-center gap-2">
          <UBadge color="neutral" variant="soft" class="font-mono">
            {{ displayOrder.status }}
          </UBadge>
          <UBadge color="primary" variant="soft">
            {{ boardStageLabel }}
          </UBadge>
        </div>

        <WorkspaceKitchenOrdersTicketPresentation
          :order="displayOrder"
        />
      </div>
    </div>

    <OrderingObjectShape :title="title" :data="displayShape" />
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { OrderingKitchenReceiving } from '~/utils/orderingFunnelShapes'
import {
  deriveKitchenOrderBoardStage,
  type KitchenOrder,
} from 'fireux-kitchens/runtime/kitchen/utils/order'

type KitchenReceivingOutcome =
  | {
      status: 'accepted'
      estimatedMinutes: number | null
    }
  | {
      status: 'cancelled'
      note: string
    }

const props = defineProps<{
  receiving: OrderingKitchenReceiving
  title: string
}>()
const emit = defineEmits<{
  (event: 'update:outcome', value: KitchenReceivingOutcome | null): void
}>()

const defaultEstimateMinutes = 45
const nowMs = Date.now()
const estimateMinutes = ref(defaultEstimateMinutes)
const accepted = ref<{ estimatedMinutes: number | null } | null>(null)
const cancelled = ref<{ note: string } | null>(null)
const awaitingDecision = computed(
  () =>
    props.receiving.order.status === 'pending_acceptance' &&
    !accepted.value &&
    !cancelled.value
)
const displayOrder = computed((): KitchenOrder => {
  if (cancelled.value) {
    return {
      ...props.receiving.order,
      status: 'cancelled',
      kitchen_note: cancelled.value.note,
    }
  }

  if (!accepted.value) return props.receiving.order

  return {
    ...props.receiving.order,
    status: 'accepted',
    ...(accepted.value.estimatedMinutes === null
      ? {}
      : {
          estimated_ready_minutes: accepted.value.estimatedMinutes,
          estimated_ready_at: etaAt(accepted.value.estimatedMinutes),
        }),
  }
})
const boardStageLabel = computed(() => {
  const stage = deriveKitchenOrderBoardStage(displayOrder.value)

  return stage === 'queue'
    ? 'Queue'
    : stage === 'incoming'
      ? 'Incoming'
      : stage === 'recent'
        ? 'Recent'
        : stage
})
const displayShape = computed(() => ({
  ...props.receiving.shape,
  given: cancelled.value
    ? {
        status: 'cancelled',
        kitchen_note: cancelled.value.note,
      }
    : accepted.value
      ? {
          status: 'accepted',
          ...(accepted.value.estimatedMinutes === null
            ? {}
            : {
                estimated_ready_minutes: accepted.value.estimatedMinutes,
                estimated_ready_at: etaAt(accepted.value.estimatedMinutes),
              }),
        }
      : props.receiving.shape.given,
}))

function accept(payload: { estimatedMinutes: number | null }) {
  cancelled.value = null
  accepted.value = {
    estimatedMinutes: payload.estimatedMinutes,
  }
  emit('update:outcome', {
    status: 'accepted',
    estimatedMinutes: payload.estimatedMinutes,
  })
}

function reject(payload: { id: string; note: string }) {
  const note = payload.note.trim()
  accepted.value = null
  cancelled.value = {
    note,
  }
  emit('update:outcome', {
    status: 'cancelled',
    note,
  })
}

function nudgeEstimate(amount: number) {
  estimateMinutes.value = clampEstimate(estimateMinutes.value + amount)
}

function setEstimate(minutes: number) {
  estimateMinutes.value = clampEstimate(minutes)
}

function clampEstimate(value: number) {
  const minutes = Math.round((Number(value) || defaultEstimateMinutes) / 5) * 5
  return Math.min(90, Math.max(5, minutes))
}

function etaAt(minutes: number) {
  return new Date(Date.now() + minutes * 60_000).toISOString()
}

watch(
  () => [
    props.receiving.order.id,
    JSON.stringify(
      props.receiving.order.collection || {}
    ),
  ],
  () => {
    accepted.value = null
    cancelled.value = null
    estimateMinutes.value = defaultEstimateMinutes
    emit('update:outcome', null)
  }
)
</script>
