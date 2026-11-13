<template>
  <KitchenPrepAndProductionStationsTools v-if="capability === 'stations'" />
  <UButton
    v-else-if="action"
    :to="action.to"
    :label="action.label"
    icon="i-lucide-plus"
  />
</template>
<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps<{ capability: string }>()
const actions: Record<string, { label: string; to: string }> = {
  menus: { label: 'Create Menu', to: '/workspace/kitchen/menu/menus?create=1' },
  dishes: {
    label: 'Create Item',
    to: '/workspace/kitchen/menu/items?create=food',
  },
  drinks: {
    label: 'Create Drink',
    to: '/workspace/kitchen/menu/items?create=drink',
  },
  ingredients: {
    label: 'Add Ingredient',
    to: '/workspace/kitchen/prep/ingredients/add',
  },
  recipes: {
    label: 'Create Recipe',
    to: '/workspace/kitchen/prep/recipes?create=1',
  },
}
const action = computed(() => actions[props.capability])
</script>
