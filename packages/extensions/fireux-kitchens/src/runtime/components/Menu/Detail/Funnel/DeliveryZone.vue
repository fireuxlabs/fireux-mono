<template>
  <div class="menu-order-delivery-zone">
    <ClientOnly>
      <KitchenDetailDeliveryZonesMap
        v-if="zones.length"
        class="menu-order-delivery-map"
        :zones="zones"
      />
    </ClientOnly>

    <label class="menu-order-field">
      <span>Delivery address</span>
      <UInput
        v-model="address"
        autocomplete="street-address"
        placeholder="Start typing your delivery address"
        size="xl"
      />
    </label>

    <div v-if="predictions.length" class="menu-order-address-options">
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
import type { MenuOrderingFunnelState } from '../../../../models/menu/menu-ordering.model'
import { useFunnelDeliveryZone } from '../../../../composables/fireux/public/menu/useFunnelDeliveryZone'

const props = defineProps<{
  order: MenuOrderingFunnelState
}>()
const {
  address,
  checkPending,
  minimumMet,
  predictions,
  result,
  selectAddress,
  status,
  suggestionsError,
  suggestionsPending,
  zones,
} = useFunnelDeliveryZone(() => props.order)
</script>
