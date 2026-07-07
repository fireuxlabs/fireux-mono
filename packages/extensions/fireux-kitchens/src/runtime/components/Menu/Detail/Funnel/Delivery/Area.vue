<template>
  <div class="menu-order-delivery-zone">
    <h2 class="menu-order-screen-title">
      Delivery area
    </h2>

    <ClientOnly>
      <KitchenDetailDeliveryZonesMap
        v-if="zones.length"
        class="menu-order-delivery-map"
        :zones="zones"
      />
    </ClientOnly>

    <div class="menu-order-field">
      <span>Delivery address</span>
      <button
        v-if="hasSelectedAddress"
        type="button"
        class="menu-order-selected-address"
        @click="clearAddress"
      >
        <strong>{{ selectedAddressLabel }}</strong>
        <span>Tap to change</span>
      </button>

      <UInput
        v-else
        v-model="address"
        autocomplete="street-address"
        placeholder="Start typing your delivery address"
        size="xl"
      />
    </div>

    <div
      v-if="!hasSelectedAddress && predictions.length"
      class="menu-order-address-options"
    >
      <button
        v-for="prediction in predictions"
        :key="prediction.place_id"
        type="button"
        @click="selectAddress(prediction)"
      >
        <strong>
          {{ prediction.structured_formatting?.main_text || prediction.description }}
        </strong>
        <span v-if="prediction.structured_formatting?.secondary_text">
          {{ prediction.structured_formatting.secondary_text }}
        </span>
      </button>
    </div>

    <p
      class="menu-order-placeholder"
      :class="{ 'menu-order-placeholder--good': result?.deliverable && minimumMet }"
    >
      {{ status }}
    </p>

    <p v-if="suggestionsPending || checkPending" class="menu-order-placeholder">
      Working...
    </p>

    <p v-if="suggestionsError" class="menu-order-placeholder">
      {{ suggestionsError }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import type {
  MenuOrderingDeliveryState,
  MenuOrderingFunnelState,
} from '../../../../../models/kitchen/menu/menu-ordering.model'
import type { DeliveryAddressCheckResult } from '../../../../../composables/fireux/kitchen/order/funnel/Delivery/useDeliveryFunnel'
import { useDeliveryFunnel } from '../../../../../composables/fireux/kitchen/order/funnel/Delivery/useDeliveryFunnel'

const props = defineProps<{
  order: MenuOrderingFunnelState
}>()

const emit = defineEmits<{
  (event: 'update:ready', value: boolean): void
  (event: 'update:delivery', value: MenuOrderingDeliveryState): void
}>()

const {
  address,
  checkPending,
  clearAddress,
  hasSelectedAddress,
  minimumMet,
  predictions,
  ready,
  result,
  selectedAddressLabel,
  selectAddress,
  status,
  suggestionsError,
  suggestionsPending,
  zones,
} = useDeliveryFunnel(() => props.order)

watch(
  ready,
  (value: boolean) => emit('update:ready', value),
  { immediate: true }
)

watch(
  [ready, result],
  ([isReady, checked]: [boolean, DeliveryAddressCheckResult | null]) => {
    emit('update:delivery', {
      ready: Boolean(isReady),
      ...(checked?.address ? { address: checked.address } : {}),
      ...(checked?.zone ? { zone: checked.zone } : {}),
    })
  },
  { immediate: true }
)
</script>
