<template>
  <div class="menu-order-funnel menu-order-funnel--panel">
    <section class="menu-order-card">
      <header class="menu-order-header">
        <p class="menu-order-step-label">
          {{ step }} of {{ stepCount }}
        </p>

        <button
          type="button"
          class="menu-order-fold"
          aria-label="Fold order funnel away"
          @click="$emit('close')"
        >
          <UIcon name="i-lucide-chevron-down" aria-hidden="true" />
        </button>
      </header>

      <MenuDetailFunnelCollection
        v-if="order.orderType === 'collection'"
        :order="order"
        :step="step"
        @update:ready="setScreenReady"
      />

      <MenuDetailFunnelShared
        v-else
        :order="order"
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
          :disabled="continueDisabled"
          @click="goNext"
        >
          {{ isLastStep && !continueDisabled ? 'Done' : 'Continue' }}
        </button>
      </footer>

      <p v-if="order.message" class="menu-order-placeholder">
        {{ order.message }}
      </p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFunnelIndex } from '../../../../composables/fireux/kitchen/order/funnel/shared/useFunnelIndex'
import type { MenuOrderingFunnelState } from '../../../../models/kitchen/menu/menu-ordering.model'

const props = defineProps<{
  order: MenuOrderingFunnelState
}>()

const emit = defineEmits<{
  (event: 'close'): void
}>()

const funnelStepCount = computed(() =>
  props.order.orderType === 'collection' ? 6 : 3
)
const {
  continueDisabled,
  goBack,
  goNext,
  isFirstStep,
  isLastStep,
  setScreenReady,
  step,
  stepCount,
} = useFunnelIndex(() => props.order, {
  close: () => emit('close'),
  stepCount: funnelStepCount,
})
</script>
