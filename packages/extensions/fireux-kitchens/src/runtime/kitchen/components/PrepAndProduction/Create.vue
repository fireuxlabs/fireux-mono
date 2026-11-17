<template>
  <UButton
    :to="createTo"
    label="Create a recipe"
    icon="i-lucide-plus"
    color="neutral"
    variant="soft"
  />
</template>
<script setup lang="ts">
import { useKitchenPrepWorkspaceState } from '../../composables/workspace/prep/useKitchenPrepWorkspace'

const { createTo } = useKitchenPrepWorkspaceState()
</script>
