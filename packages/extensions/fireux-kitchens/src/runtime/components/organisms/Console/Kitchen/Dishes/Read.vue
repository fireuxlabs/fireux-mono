<template>
  <ConsoleKitchenChildLayout
    description="Selected kitchen and dish collection in scope."
    item-label="Dishes"
    :item-count="countLabel"
    :pending="pending"
    pending-title="Loading dishes"
    pending-description="Fetching dishes for the selected kitchen."
  >
    <OrganismsDishCollectionManager
      :collection="dishes"
      :sections="sections"
      title="Dishes"
      description="Browse dishes for the selected kitchen."
      :link="false"
    />
  </ConsoleKitchenChildLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Dish } from '../../../../../models/dish.model'
import type { KitchenDishSection } from '../../../../../composables/fireux/app/kitchen-console/useKitchenConsoleDishes'

const props = defineProps<{
  dishes: Dish[]
  pending: boolean
  sections?: KitchenDishSection[]
}>()

const countLabel = computed(() => String(props.dishes.length))
</script>
