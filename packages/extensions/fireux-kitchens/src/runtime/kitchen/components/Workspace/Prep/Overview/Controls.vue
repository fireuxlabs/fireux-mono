<template>
  <h2 class="fx-type-label">Your preparations</h2>
  <WorkspaceKitchenCollectionToolbar
    v-if="ready"
    v-model="query"
    label="preparations"
    singular="preparation"
    :count="count"
  />
</template>
<script setup lang="ts">
defineProps<{ ready: boolean; count: number }>()
const query = defineModel<string>({ required: true })
</script>
