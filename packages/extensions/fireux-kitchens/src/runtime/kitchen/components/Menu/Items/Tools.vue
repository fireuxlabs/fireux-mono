<template>
  <WorkspaceKitchenToolsToolbar
    :capability="catalogue.itemKind === 'drink' ? 'drinks' : 'dishes'"
  />
</template>

<script setup lang="ts">
import { useKitchenDishesContext } from '../../../composables/workspace/dishes/useKitchenDishesContext'
const { catalogue } = useKitchenDishesContext()
</script>
