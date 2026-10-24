<template>
  <WorkspaceEntityTools :tools="tools" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSupplierWorkspace } from 'fireux-suppliers/runtime/supplier/composables/workspace/useSupplierWorkspace'
const workspace = useSupplierWorkspace()

const tools = computed(() =>
  Boolean(workspace.id.value)
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
