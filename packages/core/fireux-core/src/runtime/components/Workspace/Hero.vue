<template>
  <UPageHero
    :title="title"
    :description="description"
    :ui="{
      container: 'workspace-hero-container',
    }"
  >
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
</style>
