<template>
  <UPageGrid class="grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-6">
    <UPageCard
      v-for="operation in operations"
      :key="operation.to"
      :title="operation.label"
      :description="operation.description"
      :icon="operation.icon"
      :to="operation.to"
      class="aspect-square"
      :ui="{
        container: 'p-4 sm:p-4',
        title: 'line-clamp-2',
        description: 'line-clamp-3',
      }"
      spotlight
    />
  </UPageGrid>
</template>

<script setup lang="ts">
const operations = [
  {
    label: 'Apps',
    description: 'Inspect Apps composed by this Project.',
    icon: 'i-lucide-panels-top-left',
    to: '/operations/apps',
  },
  {
    label: 'Ecosystem',
    description: 'Inspect upstream Ecosystem relationships.',
    icon: 'i-lucide-orbit',
    to: '/operations/ecosystem',
  },
] as const
</script>
