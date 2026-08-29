<template>
  <WorkspaceEntityTools :tools="tools" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type {
  PortfolioWorkspaceIndexDerived,
  PortfolioWorkspaceIndexState,
} from 'fireux-properties/runtime/portfolio/composables/workspace/index/usePortfolioWorkspaceIndex'

const props = defineProps<{
  state: PortfolioWorkspaceIndexState
  derived: PortfolioWorkspaceIndexDerived
}>()

const tools = computed(() =>
  props.derived.hasSelection
    ? [
        {
          id: 'portfolio.view',
          label: 'View Portfolio',
          description: 'Open the primary Portfolio.',
          icon: 'i-lucide-eye',
          to: '#workspace-entity-controls',
        },
      ]
    : []
)
</script>
