<template>
  <PlaceDetail :place="place">
    <template #header>
      <KitchenDetailHeader :kitchen="presentation" :place="place" />
    </template>
    <template #services>
      <div class="kitchen-venue-actions">
        <UButton
          :to="menusPath"
          label="Explore the menu"
          icon="i-lucide-utensils"
          color="primary"
          variant="solid"
          size="lg"
        />
        <KitchenDetailMenuServices :kitchen-slug="presentation.slug" />
      </div>
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
import type { KitchenDetailPresentation } from '../../types/public'
import { computed } from 'vue'
import {
  menuRouteIndexPath,
  directoryMenuRouteScope,
} from '../../../menu/utils/navigation/route'
const props = defineProps<{
  place: Place
  presentation: KitchenDetailPresentation
}>()
const menusPath = computed(() =>
  menuRouteIndexPath(directoryMenuRouteScope(props.presentation.slug))
)
</script>
<style scoped>
.kitchen-venue-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: calc(var(--spacing) * 3);
}
</style>
