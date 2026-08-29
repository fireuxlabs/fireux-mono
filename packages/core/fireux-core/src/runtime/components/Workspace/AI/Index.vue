<template>
  <UPageSection
    :aria-label="ariaLabel"
    :ui="
      compact
        ? {
            container: 'workspace-ai-index-container',
          }
        : undefined
    "
  >
    <slot />
  </UPageSection>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    ariaLabel?: string
    compact?: boolean
  }>(),
  {
    ariaLabel: 'Workspace AI',
    compact: false,
  }
)
</script>

<style>
.workspace-ai-index-container {
  padding-top: calc(var(--spacing) * 12) !important;
  padding-bottom: calc(var(--spacing) * 16) !important;
}

@media (min-width: 640px) {
  .workspace-ai-index-container {
    padding-bottom: calc(var(--spacing) * 24) !important;
  }
}

@media (min-width: 1024px) {
  .workspace-ai-index-container {
    padding-bottom: calc(var(--spacing) * 32) !important;
  }
}
</style>
