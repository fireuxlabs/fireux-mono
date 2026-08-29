<template>
  <UPageGrid
    aria-label="Workspace Entity tools"
    class="grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-6"
  >
    <UPageCard
      v-for="tool in tools"
      :key="tool.id"
      :title="tool.label"
      :description="tool.description"
      :icon="tool.icon"
      :to="tool.to"
      class="aspect-square"
      :ui="{
        container: 'p-4 sm:p-4',
        title: 'line-clamp-2',
        description: 'line-clamp-3',
      }"
      spotlight
    />
    <slot />
  </UPageGrid>
</template>

<script setup lang="ts">
type WorkspaceEntityToolItem = {
  id: string
  label: string
  description: string
  icon: string
  to: string
}

defineProps<{
  tools: readonly WorkspaceEntityToolItem[]
}>()
</script>
