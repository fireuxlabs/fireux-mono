<template>
  <EntityIndexCta
    title="Companies"
    description="Browse companies and create one when a place is ready for a public business profile."
    family="domain-managed"
    :actions="actions"
  />
</template>

<script setup lang="ts">
const actions = [
  {
    label: 'Create',
    cta: 'Create company',
    to: '/companies/create',
    icon: 'i-lucide-plus',
  },
  {
    label: 'Related',
    cta: 'Browse places',
    to: '/places',
    icon: 'i-lucide-map-pin',
  },
  {
    label: 'Guide',
    cta: 'Learn more',
    to: '/companies/learn-more',
    icon: 'i-lucide-book-open',
  },
] as const
</script>
