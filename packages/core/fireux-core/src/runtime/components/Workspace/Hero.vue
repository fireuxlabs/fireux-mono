<template>
  <UPageHeader
    class="pageheader"
    :title="title"
    :description="description"
  >
    <template v-if="$slots.links" #links>
      <slot name="links" />
    </template>
  </UPageHeader>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description: string
}>()
</script>
