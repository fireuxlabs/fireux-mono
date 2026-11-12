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
import { useKitchenItemsContext } from '../../../composables/workspace/items/useKitchenItemsContext'
import {
  buildMissingItemImageSuggestions,
  buildMissingDrinkImageSuggestions,
} from '../../../models/capability-suggestions'

const { catalogue, dishes } = useKitchenItemsContext()
const suggestions = computed(() =>
  catalogue.itemKind === 'drink'
    ? buildMissingDrinkImageSuggestions(dishes.value)
    : buildMissingItemImageSuggestions(
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
