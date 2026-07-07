<template>
  <section class="grid gap-4 lg:grid-cols-[18rem_minmax(0,1fr)]">
    <div class="space-y-3">
      <h2 class="text-lg font-black text-highlighted">
        Kitchen receiving
      </h2>

      <ConsoleKitchenOperationsOrdersReceiving
        :accepting="false"
        :estimate-minutes="estimateMinutes"
        :order="displayOrder"
        :rejecting="false"
        @accept="accept"
        @nudge-estimate="nudgeEstimate($event.amount)"
        @reject="reject"
        @set-estimate="setEstimate($event.minutes)"
      />
    </div>

    <OrderingObjectShape
      :title="title"
      :data="displayShape"
    />
  </section>
</template>

<script setup lang="ts">
import {
  computed,
  ref,
  watch,
} from 'vue'
import type { OrderingKitchenReceiving } from '~/utils/orderingFunnelShapes'

type KitchenReceivingOutcome =
  | {
      status: 'accepted'
      estimatedMinutes: number | null
    }
  | {
      status: 'rejected'
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
const estimateMinutes = ref(defaultEstimateMinutes)
const accepted = ref<{ estimatedMinutes: number | null } | null>(null)
const rejected = ref<{ note: string } | null>(null)
const displayOrder = computed(() => {
  if (rejected.value) {
    return {
      ...props.receiving.order,
      status: 'cancelled',
      fire_state: 'held',
      kitchen_note: rejected.value.note,
    } as typeof props.receiving.order
  }

  if (!accepted.value) return props.receiving.order

  return {
    ...props.receiving.order,
    status: 'open',
    fire_state: 'held',
    ...(accepted.value.estimatedMinutes === null
      ? {}
      : {
          estimated_ready_minutes: accepted.value.estimatedMinutes,
          estimated_ready_at: etaAt(accepted.value.estimatedMinutes),
        }),
  } as typeof props.receiving.order
})
const displayShape = computed(() => ({
  ...props.receiving.shape,
  given: rejected.value
    ? {
        status: 'cancelled',
        fire_state: 'held',
        kitchen_note: rejected.value.note,
      }
    : accepted.value
      ? {
          status: 'open',
          fire_state: 'held',
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
  rejected.value = null
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
  rejected.value = {
    note,
  }
  emit('update:outcome', {
    status: 'rejected',
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
    JSON.stringify((props.receiving.order as Record<string, unknown>).collection || {}),
  ],
  () => {
    accepted.value = null
    rejected.value = null
    estimateMinutes.value = defaultEstimateMinutes
    emit('update:outcome', null)
  }
)
</script>
