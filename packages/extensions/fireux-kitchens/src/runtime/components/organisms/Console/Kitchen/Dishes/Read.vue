<template>
  <OrganismsDishCollectionManager
    :collection="dishes"
    :sections="sections"
    title="Dishes"
    description="Browse dishes for the selected kitchen."
    :link="false"
  />
</template>

<script setup lang="ts">
import type { Dish } from '../../../../../models/dish.model'
import type { KitchenDishSection } from '../../../../../composables/fireux/app/kitchen-console/useKitchenConsoleDishes'

defineProps<{
  dishes: Dish[]
  sections?: KitchenDishSection[]
}>()
</script>
