<template>
  <WorkspaceKitchenToolsToolbar :capability="catalogue.plural" />
</template>

<script setup lang="ts">
import { useKitchenDishesContext } from '../../../composables/workspace/dishes/useKitchenDishesContext'
const { catalogue } = useKitchenDishesContext()
</script>
