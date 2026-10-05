<template>
  <UPageHero
    :title="title"
    :description="description"
    :ui="{
      wrapper: 'text-left',
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
  >
    <template #header>
      <h2
        class="text-2xl font-semibold tracking-tight text-pretty text-highlighted sm:text-3xl"
      >
        {{ title }}
      </h2>
      <p
        v-if="description"
        class="mt-2 max-w-2xl text-sm leading-6 text-muted sm:text-base"
      >
        {{ description }}
      </p>
    </template>
  </UPageHero>
</template>

<script setup lang="ts">
defineProps<{
  compact?: boolean
  title: string
  description?: string
}>()
</script>

<style>
.workspace-hero-container {
  padding-inline: 0 !important;
  padding-top: calc(var(--spacing) * 6) !important;
  padding-bottom: calc(var(--spacing) * 4) !important;
}

@media (min-width: 640px) {
  .workspace-hero-container {
    padding-inline: 0 !important;
    padding-top: calc(var(--spacing) * 8) !important;
  }
}

@media (min-width: 1024px) {
  .workspace-hero-container {
    padding-inline: 0 !important;
    padding-top: calc(var(--spacing) * 8) !important;
  }
}
.workspace-hero-container.workspace-hero-compact {
  padding-top: calc(var(--spacing) * 4) !important;
  row-gap: calc(var(--spacing) * 4) !important;
}
</style>
