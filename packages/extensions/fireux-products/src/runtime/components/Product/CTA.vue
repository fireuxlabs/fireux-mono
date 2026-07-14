<template>
  <EntityIndexCta
    title="Products"
    description="Browse products, modules, and add-ons available for this app."
    family="admin-managed"
    :actions="actions"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useProductPermissions } from '../../composables/useProductPermissions'

const { canManageProducts } = useProductPermissions()

const actions = computed(() => {
  const items = [
    {
      label: 'Related',
      cta: 'Browse blog',
      to: '/blog',
      icon: 'i-lucide-newspaper',
    },
  ]

  if (canManageProducts.value) {
    items.unshift({
      label: 'Create',
      cta: 'Create product',
      to: '/dashboard/admin/products/create',
      icon: 'i-lucide-plus',
    })
  }

  return items
})
</script>
