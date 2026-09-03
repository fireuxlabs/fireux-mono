<template>
  <div>
    <WorkspaceKitchenCapabilityGuidingLiterature
      :operation="catalogue.plural"
    />
    <WorkspaceKitchenResearchSegue
      :capability="catalogue.title"
      :base-path="`${catalogue.path}/search-demand`"
    />
  </div>
</template>

<script setup lang="ts">
import { useKitchenDishesWorkspace } from '../../../composables/workspace/Dishes/useKitchenDishesWorkspace'
const { catalogue } = useKitchenDishesWorkspace()
</script>
