<template>
  <WorkspaceCta
    title="Suppliers"
    description="Manage your supplier identity, catalogue, items, ingredients, team access, and sourcing work."
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
    label: 'Workspace',
    cta: 'Open workspace',
    to: '/workspace/supplier',
    icon: 'i-lucide-layout-dashboard',
  },
] as const

const countLabel = computed(() => {
  if (typeof props.count !== 'number') return undefined
  return `${props.count} supplier${props.count === 1 ? '' : 's'}`
})
</script>
