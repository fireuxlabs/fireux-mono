<template>
  <KitchenDetail
    v-if="presentation"
    :presentation="presentation"
    :place="place"
  >
    <template #management><slot name="management" /></template>
  </KitchenDetail>
  <PlaceDetail v-else :place="place">
    <template #services>
      <KitchenDetailState
        :outcome="outcome === 'idle' ? 'pending' : outcome"
        :has-kitchen="true"
        @refresh="refresh()"
      />
    </template>
    <template #management><slot name="management" /></template>
  </PlaceDetail>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Place } from 'fireux-places/runtime/place/models/place.model'
import PlaceDetail from 'fireux-places/runtime/place/components/Detail.vue'
import KitchenDetail from 'fireux-kitchens/runtime/kitchen/components/Detail.vue'
import KitchenDetailState from 'fireux-kitchens/runtime/kitchen/components/Detail/State.vue'
import { useKitchenDetail } from 'fireux-kitchens/runtime/kitchen/composables/useKitchenDetail'
const props = defineProps<{
  kitchen: { id: string; identity: { slug: string } }
  place: Place
}>()
const { presentation, outcome, refresh, ready } = useKitchenDetail(
  computed(() => props.kitchen.identity.slug)
)
await ready
</script>
