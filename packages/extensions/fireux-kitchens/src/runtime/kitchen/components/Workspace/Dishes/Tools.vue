<template>
  <WorkspaceKitchenCapabilityTools :operation="catalogue.plural" />
</template>

<script setup lang="ts">
import { useKitchenDishesWorkspace } from '../../../composables/workspace/Dishes/useKitchenDishesWorkspace'
const { catalogue } = useKitchenDishesWorkspace()
</script>
