<template>
  <UPageHero
    :title="title"
    :description="description"
    :ui="{
      container: compact
        ? 'workspace-hero-container workspace-hero-compact'
        : 'workspace-hero-container',
      ...(compact
        ? {
            title: 'text-2xl sm:text-3xl',
            description: 'text-base sm:text-base mt-2',
          }
        : {}),
    }"
  />
</template>

<script setup lang="ts">
defineProps<{
  compact?: boolean
  title: string
  description: string
}>()
</script>

<style>
.workspace-hero-container {
  padding-top: calc(var(--spacing) * 16) !important;
  padding-bottom: 0 !important;
}

@media (min-width: 640px) {
  .workspace-hero-container {
    padding-top: calc(var(--spacing) * 20) !important;
  }
}

@media (min-width: 1024px) {
  .workspace-hero-container {
    padding-top: calc(var(--spacing) * 24) !important;
  }
}
.workspace-hero-container.workspace-hero-compact {
  padding-top: calc(var(--spacing) * 4) !important;
  row-gap: calc(var(--spacing) * 4) !important;
}
</style>
