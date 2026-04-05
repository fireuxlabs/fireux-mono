<template>
  <slot v-if="hasSelection" name="selected" />

  <UAlert
    v-else-if="hasOptions"
    color="neutral"
    variant="soft"
    :title="selectTitle"
  />

  <UAlert
    v-else
    color="neutral"
    variant="soft"
    :title="emptyTitle"
  />
</template>

<script setup lang="ts">
defineProps<{
  hasSelection: boolean
  hasOptions: boolean
  selectTitle: string
  emptyTitle: string
}>()
</script>
