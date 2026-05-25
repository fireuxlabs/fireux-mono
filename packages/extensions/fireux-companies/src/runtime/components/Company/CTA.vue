<template>
  <EntityIndexCta
    title="Companies index"
    description="Browse company records derived from places, then use the company creation flow when a claimed place is ready for a company layer."
    family="domain-managed"
    source="companies collection"
    :count-label="`${count} compan${count === 1 ? 'y' : 'ies'}`"
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

const count = props.count
</script>
