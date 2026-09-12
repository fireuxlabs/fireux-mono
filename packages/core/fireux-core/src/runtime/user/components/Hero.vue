<template>
  <UPageHeader :title="title" :description="description" />
</template>

<script setup lang="ts">
withDefaults(defineProps<{ title?: string; description?: string }>(), {
  title: 'Users',
  description: '',
})
</script>
