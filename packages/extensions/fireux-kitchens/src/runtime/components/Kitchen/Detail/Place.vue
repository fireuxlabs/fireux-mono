<template>
  <UPageCard v-if="pending" variant="subtle">
    <p class="text-sm text-dimmed">Loading place…</p>
  </UPageCard>

  <div v-else-if="placeProfile" class="space-y-4">
    <PlaceCardsProfile
      :model="placeProfile"
      :show-google-hours="false"
    />

    <UPageCard
      v-if="operationHourLines.length"
      title="Kitchen service hours"
      variant="subtle"
    >
      <div class="space-y-3">
        <ClientOnly>
          <UBadge
            :color="operationHoursChipColor"
            variant="soft"
            class="w-fit"
          >
            {{ operationHoursChipLabel }}
          </UBadge>
        </ClientOnly>

        <div class="flex flex-wrap gap-2">
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
import {
  usePlaceFetch,
  usePlaceInterface,
} from 'fireux-places/runtime/composables/fireux/firestore/place/usePlace'
import type { KitchenSurface } from '../../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'
import { useKitchenServiceNow } from '../../../composables/fireux/kitchen/useKitchenServiceNow'
import {
  readKitchenIdentity,
  readKitchenOperationHours,
} from '../../../utils/kitchen-spine'
import {
  readWeekdayTimeOpenState,
  weekdayTimeLines,
} from '../../../utils/weekday-time'

const props = defineProps<{
  kitchen: KitchenSurface | null
}>()

const { now: serviceNow } = useKitchenServiceNow()
const placeId = computed(() =>
  String(props.kitchen?.place_id || '').trim()
)
const { place, pending } = usePlaceFetch(placeId)
const { profile } = usePlaceInterface()
const placeWithKitchenLogoTone = computed(() => {
  if (!place.value) return null
  const kitchenIdentity = readKitchenIdentity(props.kitchen)

  return {
    ...place.value,
    image_shade: kitchenIdentity.imageShade || place.value.image_shade,
  }
})
const placeProfile = computed(() => profile(placeWithKitchenLogoTone.value))
const operationHours = computed(() =>
  readKitchenOperationHours(props.kitchen)
)
const operationHourLines = computed(() =>
  weekdayTimeLines(operationHours.value)
)
const operationHoursOpenState = computed(() =>
  readWeekdayTimeOpenState(operationHours.value, serviceNow.value)
)
const operationHoursChipLabel = computed(() => {
  if (!operationHoursOpenState.value.known) return 'Hours unavailable'

  return operationHoursOpenState.value.open ? 'Open now' : 'Closed now'
})
const operationHoursChipColor = computed(() => {
  if (!operationHoursOpenState.value.known) return 'neutral'

  return operationHoursOpenState.value.open ? 'success' : 'error'
})
</script>
