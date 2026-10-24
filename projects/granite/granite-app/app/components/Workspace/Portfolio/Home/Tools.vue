<template>
  <WorkspaceEntityTools :tools="tools" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePortfolioWorkspace } from 'fireux-properties/runtime/portfolio/composables/workspace/usePortfolioWorkspace'
const workspace = usePortfolioWorkspace()

const tools = computed(() =>
  Boolean(workspace.id.value)
    ? [
        {
          id: 'portfolio.view',
          label: 'View Portfolio',
          description: 'Open the selected Portfolio.',
          icon: 'i-lucide-eye',
          to: '#workspace-entity-controls',
        },
      ]
    : []
)
</script>
