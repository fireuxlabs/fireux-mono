<template>
  <WorkspaceEntityTools :tools="tools" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePropertyWorkspace } from 'fireux-properties/runtime/property/composables/workspace/usePropertyWorkspace'
const workspace = usePropertyWorkspace()

const tools = computed(() =>
  Boolean(workspace.id.value)
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
