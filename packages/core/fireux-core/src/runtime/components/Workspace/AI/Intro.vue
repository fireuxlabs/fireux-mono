<template>
  <UPageHero
    :headline="agentLabel || undefined"
    :title="title"
    :description="description || undefined"
  />
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    agentLabel?: string
    title: string
    description?: string
  }>(),
  {
    agentLabel: '',
    description: '',
  }
)
</script>
