<template>
  <UAlert
    v-if="pending"
    color="neutral"
    variant="soft"
    title="Loading dishes"
    description="Fetching dishes for the selected kitchen."
  />

  <OrganismsDishCollectionManager
    v-else
    :collection="dishes"
    :sections="sections"
    title="Dishes"
    description="Browse dishes for the selected kitchen."
    :link="false"
  />
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
