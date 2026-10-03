<template>
  <WorkspaceEntityTools :tools="tools" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePortfolioWorkspaceIndex } from 'fireux-properties/runtime/portfolio/composables/workspace/usePortfolioWorkspaceIndex'
const index = usePortfolioWorkspaceIndex()

const tools = computed(() =>
  Boolean(index.selectedId.value)
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
