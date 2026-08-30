<template>
  <UPageCard
    :title="title"
    :description="description || undefined"
    :to="to || undefined"
  />
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    description?: string
    to?: string
  }>(),
  {
    description: '',
    to: '',
  }
)
</script>
