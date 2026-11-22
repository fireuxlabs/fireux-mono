<template>
  <UPageGrid aria-label="Workspace Entity tools">
    <UPageCard
      v-for="tool in tools"
      :key="tool.id"
      :title="tool.label"
      :description="tool.description"
      :icon="tool.icon"
      :to="tool.to"
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
