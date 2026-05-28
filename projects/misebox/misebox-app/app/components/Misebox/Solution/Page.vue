<template>
  <PublicSimplePage
    :title="title"
    :description="description"
    back-to="/solutions"
    back-label="Solutions"
  >
    <div class="space-y-8">
      <slot />
    </div>
  </PublicSimplePage>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description: string
}>()
</script>
