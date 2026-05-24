<template>
  <EntityIndexCta
    title="Portfolios index"
    description="Portfolios are console workspaces. Select a portfolio, then manage properties, clients, finance, incidents, and documents in the portfolio console."
    family="console"
    source="portfolios collection"
    :count-label="`${count} portfolio${count === 1 ? '' : 's'}`"
    :actions="actions"
  />
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{ count?: number }>(), {
  count: 0,
})

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

const count = props.count
</script>
