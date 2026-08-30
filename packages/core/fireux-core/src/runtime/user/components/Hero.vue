<template>
  <UPageHero headline="Discover" :title="title" :description="description" />
</template>

<script setup lang="ts">
withDefaults(defineProps<{ title?: string; description?: string }>(), {
  title: 'Users',
  description: 'Discover people and the profiles they share.',
})
</script>
