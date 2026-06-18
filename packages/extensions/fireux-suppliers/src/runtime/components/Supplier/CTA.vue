<template>
  <ConsoleCta
    title="Suppliers"
    description="Find suppliers and manage catalogue items, ingredients, and sourcing work."
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

const countLabel = computed(() => {
  if (typeof props.count !== 'number') return undefined
  return `${props.count} supplier${props.count === 1 ? '' : 's'}`
})
</script>
