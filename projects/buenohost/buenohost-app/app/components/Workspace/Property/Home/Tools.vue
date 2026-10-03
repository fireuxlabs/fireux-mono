<template>
  <WorkspaceEntityTools :tools="tools" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePropertyWorkspaceIndex } from 'fireux-properties/runtime/property/composables/workspace/usePropertyWorkspaceIndex'
const index = usePropertyWorkspaceIndex()

const tools = computed(() =>
  Boolean(index.selectedId.value)
    ? [
        {
          id: 'property.view',
          label: 'View Property',
          description: 'Open the selected Property.',
          icon: 'i-lucide-eye',
          to: '#workspace-entity-controls',
        },
      ]
    : []
)
</script>
