<template>
  <p v-if="ready">
    Manage preparations, recipes, ingredients and production from the tools
    below.
  </p>
  <p v-else>Choose an available Kitchen to review its preparation tools.</p>
</template>
<script setup lang="ts">
import { useKitchenPrepWorkspaceState } from '../../composables/workspace/prep/useKitchenPrepWorkspace'

const { ready } = useKitchenPrepWorkspaceState()
</script>
