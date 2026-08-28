<template>
  <nav class="flex flex-wrap gap-2" aria-label="Search demand stages">
    <UButton
      v-for="stage in stages"
      :key="stage.id"
      :to="stage.to"
      color="neutral"
      :variant="stage.id === current ? 'solid' : 'outline'"
      :aria-current="stage.id === current ? 'step' : undefined"
    >
      {{ stage.order }}. {{ stage.label }}
    </UButton>
  </nav>
</template>

<script setup lang="ts">
defineProps<{
  current: 'domain' | 'analysis' | 'tools' | 'capabilities'
}>()

const stages = [
  {
    id: 'domain',
    order: 1,
    label: 'Understand the domain',
    to: '/search-demand',
  },
  {
    id: 'analysis',
    order: 2,
    label: 'Map demand',
    to: '/search-demand/analysis',
  },
  { id: 'tools', order: 3, label: 'Map tools', to: '/search-demand/tools' },
  {
    id: 'capabilities',
    order: 4,
    label: 'Define capabilities',
    to: '/search-demand/capabilities',
  },
] as const
</script>
