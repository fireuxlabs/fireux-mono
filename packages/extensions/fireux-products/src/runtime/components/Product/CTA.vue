<template>
  <EntityIndexCta
    title="Products index"
    description="Browse canonical product records for this runtime. Publishing and merchandising actions stay in the admin product workspace."
    family="admin-managed"
    source="products collection"
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
      to: '/admin/products/create',
      icon: 'i-lucide-plus',
    })
  }

  return items
})
</script>
