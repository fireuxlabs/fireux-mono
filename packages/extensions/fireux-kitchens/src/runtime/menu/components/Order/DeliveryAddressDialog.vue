<!-- Concurrent edit — 2026-07-19 17:02 CEST — Delivery pass: collect and verify the delivery destination. -->
<template>
  <div class="menu-order-delivery-address__host">
    <UModal
      v-model:open="openModel"
      description="We’ll check the address against this Kitchen’s delivery areas."
      :portal="false"
      title="Delivery address"
      :ui="modalUi"
      @after:leave="$emit('after-leave')"
    >
      <template #body>
        <div class="menu-order-delivery-address">
          <UFormField label="Address" required>
            <UInput
              :model-value="address"
              autocomplete="street-address"
              icon="i-lucide-map-pin"
              placeholder="Start typing your delivery address"
              :disabled="pending"
              @update:model-value="$emit('update:address', String($event || ''))"
            />
          </UFormField>

          <div
            v-if="predictions.length"
            class="menu-order-delivery-address__suggestions"
          >
            <button
              v-for="prediction in predictions"
              :key="prediction.place_id"
              type="button"
              @click="$emit('select', prediction)"
            >
              <UIcon name="i-lucide-map-pin" aria-hidden="true" />
              <span>{{ prediction.description }}</span>
            </button>
          </div>

          <UAlert
            :color="ready ? 'success' : error ? 'error' : 'neutral'"
            variant="soft"
            :icon="ready
              ? 'i-lucide-circle-check'
              : pending
                ? 'i-lucide-loader-circle'
                : 'i-lucide-map-pinned'"
            :title="ready ? 'Delivery available' : 'Delivery check'"
            :description="error || status"
          />

          <div v-if="ready" class="menu-order-delivery-address__total">
            <span>Order with delivery</span>
            <strong>{{ totalLabel }}</strong>
          </div>
        </div>
      </template>

      <template #footer>
        <div class="menu-order-delivery-address__actions">
          <UButton
            v-if="address && !ready"
            color="neutral"
            variant="soft"
            icon="i-lucide-search"
            :loading="pending"
            @click="$emit('check', address)"
          >
            Check address
          </UButton>
          <UButton
            icon="i-lucide-arrow-right"
            trailing
            :disabled="!ready"
            @click="$emit('continue')"
          >
            Continue
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CustomerDeliveryAddressPrediction } from '../../../user/composables/customer/useCustomerDeliveryAddressAutocomplete'

const props = defineProps<{
  address: string
  error?: string
  open: boolean
  pending?: boolean
  predictions: CustomerDeliveryAddressPrediction[]
  ready: boolean
  status: string
  totalLabel: string
}>()
const emit = defineEmits<{
  (event: 'update:open', open: boolean): void
  (event: 'update:address', address: string): void
  (event: 'select', prediction: CustomerDeliveryAddressPrediction): void
  (event: 'check', address: string): void
  (event: 'continue'): void
  (event: 'after-leave'): void
}>()
const openModel = computed({
  get: () => props.open,
  set: (open: boolean) => emit('update:open', open),
})
const modalUi = {
  overlay: 'menu-order-delivery-address__overlay',
  content: 'menu-order-delivery-address__content',
}
</script>

<style scoped>
.menu-order-delivery-address__host { display: contents; }
:deep(.menu-order-delivery-address__overlay) { z-index: 60; backdrop-filter: blur(3px); }
:deep(.menu-order-delivery-address__content) { z-index: 61; width: min(calc(100vw - 2rem), 38rem); background: var(--menu-bg); color: var(--menu-text); }
.menu-order-delivery-address { display: grid; gap: calc(var(--spacing) * 4); }
.menu-order-delivery-address__suggestions { display: grid; border: 1px solid var(--ui-border); border-radius: var(--menu-radius-control); overflow: hidden; }
.menu-order-delivery-address__suggestions button { display: flex; align-items: flex-start; gap: calc(var(--spacing) * 2); padding: calc(var(--spacing) * 3); border: 0; border-bottom: 1px solid var(--ui-border); background: transparent; color: var(--menu-text); text-align: left; cursor: pointer; }
.menu-order-delivery-address__suggestions button:last-child { border-bottom: 0; }
.menu-order-delivery-address__total { display: flex; justify-content: space-between; gap: calc(var(--spacing) * 4); color: var(--menu-muted); }
.menu-order-delivery-address__total strong { color: var(--menu-primary); }
.menu-order-delivery-address__actions { display: flex; width: 100%; justify-content: flex-end; gap: calc(var(--spacing) * 2); }
</style>
