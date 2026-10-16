<template>
  <PlaceDetail :place="place">
    <template #header>
      <KitchenDetailHeader :kitchen="presentation" :place="place" />
    </template>
    <template #services>
      <UButton
        :to="menusPath"
        label="Menu"
        icon="i-lucide-utensils"
        size="lg"
      />
    </template>
    <template #management>
      <slot name="management"
        ><KitchenDetailOperatorPanel :kitchen="presentation"
      /></slot>
    </template>
  </PlaceDetail>
</template>

<script setup lang="ts">
import type { Place } from 'fireux-places/runtime/place/models/place.model'
import type { KitchenDetailPresentation } from '../../models/kitchen-detail.response.ts'
import { computed } from 'vue'
import {
  menuRouteIndexPath,
  directoryMenuRouteScope,
} from '../../../menu/utils/menu-route'
const props = defineProps<{
  place: Place
  presentation: KitchenDetailPresentation
}>()
const menusPath = computed(() =>
  menuRouteIndexPath(directoryMenuRouteScope(props.presentation.slug))
)
</script>
