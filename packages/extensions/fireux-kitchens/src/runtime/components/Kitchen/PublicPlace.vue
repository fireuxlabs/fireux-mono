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
import type { Kitchen } from '../../models/kitchen.model'

const props = defineProps<{
  kitchen: Kitchen | null
}>()

const placeId = computed(() =>
  String(props.kitchen?.place_id || '').trim()
)
const { place, pending } = usePlaceFetch(placeId)
const { profile } = usePlaceInterface()
const placeProfile = computed(() => profile(place.value))
</script>
