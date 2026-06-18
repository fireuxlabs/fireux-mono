<template>
  <ConsoleCta
    title="Portfolios"
    description="Manage your portfolio identity, properties, clients, units, documents, tasks, and team access."
    :count-label="countLabel"
    :actions="actions"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ count?: number }>()

const actions = [
  {
    label: 'Create',
    cta: 'Create portfolio',
    to: '/portfolios/create',
    icon: 'i-lucide-plus',
  },
  {
    label: 'Console',
    cta: 'Open console',
    to: '/console/portfolio',
    icon: 'i-lucide-layout-dashboard',
  },
  {
    label: 'Guide',
    cta: 'Learn more',
    to: '/portfolios/learn-more',
    icon: 'i-lucide-book-open',
  },
] as const

const countLabel = computed(() => {
  if (typeof props.count !== 'number') return undefined
  return `${props.count} portfolio${props.count === 1 ? '' : 's'}`
})
</script>
