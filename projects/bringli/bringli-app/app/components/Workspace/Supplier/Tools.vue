<template>
  <WorkspaceEntityTools :tools="tools" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type {
  SupplierWorkspaceIndexDerived,
  SupplierWorkspaceIndexState,
} from 'fireux-suppliers/runtime/supplier/composables/workspace/index/useSupplierWorkspaceIndex'

const props = defineProps<{
  state: SupplierWorkspaceIndexState
  derived: SupplierWorkspaceIndexDerived
}>()

const tools = computed(() =>
  props.derived.hasSelection
    ? [
        {
          id: 'supplier.view',
          label: 'View Supplier',
          description: 'Open the primary Supplier.',
          icon: 'i-lucide-eye',
          to: '#workspace-entity-controls',
        },
      ]
    : []
)
</script>
