<template>
  <UPageCard v-if="pending" variant="subtle">
    <p class="text-sm text-dimmed">Loading place…</p>
  </UPageCard>

  <PlaceCardsProfile
    v-else-if="placeProfile"
    :model="placeProfile"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  usePlaceFetch,
  usePlaceInterface,
} from 'fireux-places/runtime/composables/fireux/firestore/place/usePlace'
import type { KitchenSurface } from '../../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'
import { readKitchenIdentity } from '../../../utils/kitchen-spine'

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
</script>
