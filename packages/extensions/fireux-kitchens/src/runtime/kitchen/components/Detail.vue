<template>
  <PlaceDetail :place="place">
    <template #header>
      <KitchenDetailHeader :kitchen="presentation" :place="place" />
    </template>
    <template #services>
      <KitchenDetailOfferingTimes :offerings="presentation.offerings || []" />
      <KitchenDetailMenus :kitchen="presentation" :index="menus" />
    </template>
    <template #after-content>
      <KitchenDetailFulfilment :kitchen="presentation" />
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
import PlaceDetail from 'fireux-places/runtime/place/components/Detail.vue'
import type { KitchenDetailPresentation } from '../models/kitchen-detail.response.ts'
import type { MenuDirectoryController } from '../../menu/composables/useMenuDirectory'
defineProps<{
  place: Place
  presentation: KitchenDetailPresentation
  menus: MenuDirectoryController
}>()
</script>
