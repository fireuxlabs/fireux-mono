<template>
  <WorkspaceEntityTools :tools="tools" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSupplierWorkspaceIndex } from 'fireux-suppliers/runtime/supplier/composables/workspace/index/useSupplierWorkspaceIndex'
const index = useSupplierWorkspaceIndex()

const tools = computed(() =>
  Boolean(index.selectedId.value)
    ? [
        {
          id: 'supplier.view',
          label: 'View Supplier',
          description: 'Open the selected Supplier.',
          icon: 'i-lucide-eye',
          to: '#workspace-entity-controls',
        },
      ]
    : []
)
</script>
