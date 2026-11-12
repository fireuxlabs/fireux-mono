<template>
  <WorkspaceKitchenAICapability
    compact-chat
    :capability="catalogue.itemKind === 'drink' ? 'drinks' : 'dishes'"
    :suggestions="suggestions"
    :action-targets="actionTargets"
    :show-suggestion-cards="false"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenDishesContext } from '../../../composables/workspace/dishes/useKitchenDishesContext'
import {
  buildMissingDishImageSuggestions,
  buildMissingDrinkImageSuggestions,
} from '../../../models/capability-suggestions'

const { catalogue, dishes } = useKitchenDishesContext()
const suggestions = computed(() =>
  catalogue.itemKind === 'drink'
    ? buildMissingDrinkImageSuggestions(dishes.value)
    : buildMissingDishImageSuggestions(
        dishes.value.filter((dish) => dish.item_kind === 'food')
      )
)
const actionTargets = computed(() =>
  dishes.value.flatMap((dish) =>
    ['update', 'delete'].map((action) => ({
      actionId: `kitchen.${dish.item_kind === 'drink' ? 'drinks' : 'dishes'}.${action}-${dish.item_kind === 'drink' ? 'drink' : 'dish'}`,
      targetId: dish.id,
      label: dish.name,
    }))
  )
)
</script>
