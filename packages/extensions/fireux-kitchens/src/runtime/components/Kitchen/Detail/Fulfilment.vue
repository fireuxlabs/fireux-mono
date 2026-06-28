<template>
  <UCollapsible v-if="deliveryZones.length" :default-open="false">
    <UButton
      class="group"
      color="neutral"
      variant="soft"
      block
      trailing-icon="i-lucide-chevron-down"
      :ui="{
        trailingIcon:
          'group-data-[state=open]:rotate-180 transition-transform duration-200',
      }"
    >
      <span class="flex min-w-0 items-start gap-3 text-left">
        <UIcon
          name="i-lucide-truck"
          class="mt-0.5 size-4 shrink-0 text-muted"
        />
        <span class="grid min-w-0">
          <span class="truncate">Delivery area</span>
          <span class="truncate text-xs font-normal text-dimmed">
            Minimum order and delivery fee by zone.
          </span>
        </span>
      </span>
    </UButton>

    <template #content>
      <UCard class="mt-4">
        <ClientOnly>
          <KitchenFulfilmentDeliveryZonesMap :zones="deliveryZones" />
        </ClientOnly>
      </UCard>
    </template>
  </UCollapsible>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { KitchenSurface } from '../../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'
import type { KitchenFulfilmentConfig } from '../../../models/kitchen.model'
import { readKitchenFulfilmentConfig } from '../../../utils/kitchen-spine'

const props = defineProps<{
  kitchen: KitchenSurface | null
  fulfilment?: KitchenFulfilmentConfig | null
}>()

const deliveryZones = computed(() =>
  props.fulfilment?.delivery_zones ||
  readKitchenFulfilmentConfig(props.kitchen).delivery_zones
)
</script>
