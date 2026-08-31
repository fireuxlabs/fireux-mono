<template>
  <UPageHeader headline="Discover" :title="title" :description="description" />
</template>

<script setup lang="ts">
withDefaults(defineProps<{ title?: string; description?: string }>(), {
  title: 'Apps',
  description: 'Find apps in this ecosystem, or start your app.',
})
</script>
