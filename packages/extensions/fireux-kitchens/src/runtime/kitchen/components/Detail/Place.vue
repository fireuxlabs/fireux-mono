<template>
  <UPageCard v-if="pending" variant="subtle">
    <p>Loading place…</p>
  </UPageCard>

  <div v-else-if="placeProfile">
    <PlaceDetailProfile :model="placeProfile" :show-google-hours="false" />

    <UPageCard
      v-if="operationHourLines.length"
      title="Kitchen service hours"
      variant="subtle"
    >
      <div>
        <ClientOnly>
          <UBadge :color="operationHoursChipColor" variant="soft">
            {{ operationHoursChipLabel }}
          </UBadge>
        </ClientOnly>

        <div>
          <UBadge
            v-for="line in operationHourLines"
            :key="line"
            color="neutral"
            variant="soft"
          >
            {{ line }}
          </UBadge>
        </div>
      </div>
    </UPageCard>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePlaceFetch } from 'fireux-places/runtime/place/composables/firestore/fetch/usePlaceFetch'
import { usePlaceInterface } from 'fireux-places/runtime/place/composables/firestore/utils/view/usePlaceInterface'
import type { KitchenSurface } from '../../models/kitchen-interface.model'
import { useMenuOfferingComputed } from '../../../menu/composables/useMenuOfferingComputed'
import { readKitchenOperationHours } from '../../utils/kitchen-readers'
import { weekdayTimeLines } from '../../../utils/weekday-time'

const props = defineProps<{
  kitchen: KitchenSurface | null
}>()

const placeId = computed(() => String(props.kitchen?.id || '').trim())
const { place, pending } = usePlaceFetch(placeId)
const { profile } = usePlaceInterface()
const placeProfile = computed(() => profile(place.value))
const operationHours = computed(() => readKitchenOperationHours(props.kitchen))
const operationHourLines = computed(() =>
  weekdayTimeLines(operationHours.value)
)
const { menuOfferingChip: operationHoursChip } =
  useMenuOfferingComputed(operationHours)
const operationHoursChipLabel = computed(() => {
  return operationHoursChip.value.label
})
const operationHoursChipColor = computed(() => {
  return operationHoursChip.value.color
})
</script>
