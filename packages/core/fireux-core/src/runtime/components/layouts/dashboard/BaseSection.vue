<template>
  <UPage>
    <UPageBody class="space-y-6">
      <UPageHeader :title="title" :description="description" />

      <slot name="guard" />
      <slot name="hero" />
      <slot name="content" />
      <slot name="dev" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>
