<template>
  <EntityIndexCta
    title="Suppliers index"
    description="Suppliers are console workspaces. Select a supplier, then manage catalogue, products, and supplier operations in the supplier console."
    family="console"
    source="suppliers collection"
    :count-label="`${count} supplier${count === 1 ? '' : 's'}`"
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
    cta: 'Create supplier',
    to: '/suppliers/create',
    icon: 'i-lucide-plus',
  },
  {
    label: 'Console',
    cta: 'Open console',
    to: '/console/supplier',
    icon: 'i-lucide-layout-dashboard',
  },
] as const

const count = props.count
</script>
