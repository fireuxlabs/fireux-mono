<template>
  <div>
    <WorkspaceKitchenResearchGuide
      :capability="catalogue.itemKind === 'drink' ? 'drinks' : 'dishes'"
    />
    <WorkspaceKitchenResearchSegue
      :capability="catalogue.title"
      :base-path="`${catalogue.path}/search-demand`"
    />
  </div>
</template>

<script setup lang="ts">
import { useKitchenDishesContext } from '../../../composables/workspace/dishes/useKitchenDishesContext'
const { catalogue } = useKitchenDishesContext()
</script>
