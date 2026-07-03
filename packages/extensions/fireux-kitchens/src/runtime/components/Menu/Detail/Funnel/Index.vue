<template>
  <div class="menu-order-funnel menu-order-funnel--panel">
    <section class="menu-order-card">
      <header class="menu-order-header">
        <p class="menu-order-step-label">
          {{ step }} of {{ stepCount }} · {{ funnel.order.orderType }}
        </p>

        <button
          type="button"
          class="menu-order-fold"
          aria-label="Fold order funnel away"
          @click="funnel.close"
        >
          <UIcon name="i-lucide-chevron-down" aria-hidden="true" />
        </button>
      </header>

      <MenuDetailFunnelCollection
        v-if="funnel.order.orderType === 'collection'"
        :funnel="funnel"
        :step="step"
        @update:ready="setScreenReady"
      />

      <MenuDetailFunnelDelivery
        v-else-if="funnel.order.orderType === 'delivery'"
        :funnel="funnel"
        :step="step"
        @update:ready="setScreenReady"
      />

      <MenuDetailFunnelShared
        v-else
        :order="funnel.order"
        :step="step"
        @update:ready="setScreenReady"
      />

      <footer
        class="menu-order-footer"
        :class="{ 'menu-order-footer--single': isFirstStep }"
      >
        <button
          v-if="!isFirstStep"
          type="button"
          class="menu-order-secondary"
          @click="goBack"
        >
          Back
        </button>

        <button
          type="button"
          class="menu-order-primary"
          :disabled="continueBlocked"
          @click="continueFunnel"
        >
          {{ continueLabel }}
        </button>
      </footer>

      <p v-if="funnel.order.message" class="menu-order-placeholder">
        {{ funnel.order.message }}
      </p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useFunnelIndex } from '../../../../composables/fireux/kitchen/order/funnel/shared/useFunnelIndex'
import type { MenuOrderingFunnelController } from '../../../../models/kitchen/menu/menu-ordering.model'

const props = defineProps<{
  funnel: MenuOrderingFunnelController
}>()

const funnelStepCount = computed(() =>
  ['collection', 'delivery'].includes(props.funnel.order.orderType) ? 6 : 3
)
const submittingStep = ref(false)
const {
  continueDisabled,
  goBack,
  goNext,
  isFirstStep,
  isLastStep,
  setScreenReady,
  step,
  stepCount,
} = useFunnelIndex(() => props.funnel.order, {
  close: () => props.funnel.close(),
  stepCount: funnelStepCount,
})
const shouldSubmitTakeAwayRequest = computed(() =>
  ['collection', 'delivery'].includes(props.funnel.incoming.order_type) &&
    step.value === 3 &&
    !props.funnel.sending.sent_order
)
const continueBlocked = computed(() =>
  continueDisabled.value || submittingStep.value
)
const continueLabel = computed(() => {
  if (submittingStep.value) return 'Sending...'
  return isLastStep.value && !continueBlocked.value ? 'Done' : 'Continue'
})

watch(() => props.funnel.sending.sent_order?.id || '', (orderId: string) => {
  if (orderId) return
  if (!['collection', 'delivery'].includes(props.funnel.order.orderType)) return
  if (step.value <= 3) return

  step.value = 3
})

async function continueFunnel() {
  if (continueBlocked.value) return

  if (shouldSubmitTakeAwayRequest.value) {
    submittingStep.value = true
    try {
      const created = await props.funnel.submit({
        ...(props.funnel.incoming.order_type === 'collection'
          ? { collection: props.funnel.incoming.collection }
          : {}),
      })
      if (!created) return
    } finally {
      submittingStep.value = false
    }
  }

  goNext()
}
</script>
