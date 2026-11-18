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
import { requirePrepWorkspace } from '../../../composables/workspace/prep/state'

const { createTo } = requirePrepWorkspace()
</script>
