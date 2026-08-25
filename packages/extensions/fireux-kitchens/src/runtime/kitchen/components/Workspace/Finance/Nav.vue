<template>
  <nav class="flex flex-wrap items-center gap-1" aria-label="Finance sections">
    <UButton
      v-for="item in items"
      :key="item.to"
      :to="item.to"
      :label="item.label"
      :icon="item.icon"
      color="neutral"
      :variant="route.path === item.to ? 'soft' : 'ghost'"
    />
  </nav>
</template>

<script setup lang="ts">
import { useRoute } from '#imports'

const route = useRoute()
const items = [
  {
    label: 'Overview',
    icon: 'i-lucide-layout-dashboard',
    to: '/workspace/kitchen/finance',
  },
  {
    label: 'Transactions',
    icon: 'i-lucide-list-filter',
    to: '/workspace/kitchen/finance/transactions',
  },
  {
    label: 'Reports',
    icon: 'i-lucide-file-chart-column',
    to: '/workspace/kitchen/finance/reports',
  },
]
</script>
