<template>
  <WorkspaceKitchenToolsToolbar
    :capability="catalogue.itemKind === 'drink' ? 'drinks' : 'dishes'"
  />
</template>

<script setup lang="ts">
import { useKitchenItemsContext } from '../../../composables/workspace/items/useKitchenItemsContext'
const { catalogue } = useKitchenItemsContext()
</script>
