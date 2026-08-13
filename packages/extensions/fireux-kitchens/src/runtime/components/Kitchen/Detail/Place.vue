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
import { useMenuServiceComputed } from '../../../composables/fireux/firestore/menu/useMenu'
import {
  readKitchenIdentity,
  readKitchenOperationHours,
} from '../../../utils/kitchen-spine'
import { weekdayTimeLines } from '../../../utils/weekday-time'

const props = defineProps<{
  kitchen: KitchenSurface | null
}>()

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
const { menuServiceChip: operationHoursChip } =
  useMenuServiceComputed(operationHours)
const operationHoursChipLabel = computed(() => {
  return operationHoursChip.value.label
})
const operationHoursChipColor = computed(() => {
  return operationHoursChip.value.color
})
</script>
