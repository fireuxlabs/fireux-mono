<template>
  <UPageHero :title="title" :description="description">
    <template v-if="$slots.links" #links>
      <slot name="links" />
    </template>
  </UPageHero>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description: string
}>()
</script>
