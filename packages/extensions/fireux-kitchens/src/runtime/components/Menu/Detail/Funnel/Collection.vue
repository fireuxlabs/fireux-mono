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

      <MenuDetailFunnelBasket
        v-if="step === 1"
        :order="order"
      />

      <ClientOnly v-else-if="step === 2">
        <MenuDetailFunnelAllergen v-model="allergenAccepted" />
      </ClientOnly>

      <MenuDetailFunnelCollectionRendezvous
        v-else-if="step === 3"
        :order="order"
        @update:ready="rendezvousReady = $event"
      />

      <MenuDetailFunnelCollectionKitchen
        v-else-if="step === 4"
      />

      <MenuDetailFunnelPayment v-else-if="step === 5" />

      <MenuDetailFunnelConfirmation v-else />

      <footer class="menu-order-footer">
        <button
          type="button"
          class="menu-order-secondary"
          :disabled="step === 1"
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
          {{ isLastStep ? 'Done' : 'Continue' }}
        </button>
      </footer>

      <p v-if="order.message" class="menu-order-placeholder">
        {{ order.message }}
      </p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { MenuOrderingFunnelState } from '../../../../models/kitchen/menu/menu-ordering.model'

const props = defineProps<{
  order: MenuOrderingFunnelState
}>()

const emit = defineEmits<{
  (event: 'close'): void
}>()

const stepCount = 6
const step = ref(1)
const allergenAccepted = ref(false)
const rendezvousReady = ref(false)
const isLastStep = computed(() => step.value === stepCount)
const continueDisabled = computed(() =>
  (step.value === 2 && !allergenAccepted.value) ||
    (step.value === 3 && !rendezvousReady.value)
)

function goBack() {
  step.value = Math.max(1, step.value - 1)
}

function goNext() {
  if (continueDisabled.value) return
  if (isLastStep.value) {
    emit('close')
    return
  }

  step.value = Math.min(stepCount, step.value + 1)
}

watch(() => props.order.quantity, (quantity: number) => {
  if (quantity) return

  step.value = 1
  allergenAccepted.value = false
  rendezvousReady.value = false
})
</script>
