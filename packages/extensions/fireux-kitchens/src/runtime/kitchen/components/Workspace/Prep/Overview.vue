<template>
  <p v-if="ready">
    Manage preparations, recipes, ingredients and production from the tools
    below.
  </p>
  <p v-else>Choose an available Kitchen to review its preparation tools.</p>
</template>
<script setup lang="ts">
import { requirePrepWorkspace } from '../../../composables/workspace/prep/state'

const { ready } = requirePrepWorkspace()
</script>
