<template>
  <WorkspaceKitchenAIAssistant
    :kitchen-id="workspaceState.kitchen.id"
    :show-intro="false"
    :placeholder="placeholder"
    :starters="[]"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type {
  KitchenWorkspaceIndexDerived,
  KitchenWorkspaceIndexState,
} from '../../composables/workspace/index/useKitchenWorkspaceIndex'

const props = defineProps<{
  workspaceState: KitchenWorkspaceIndexState
  workspaceDerived: KitchenWorkspaceIndexDerived
}>()

const placeholder = computed(() => {
  if (
    props.workspaceDerived.outcome === 'idle' ||
    props.workspaceDerived.outcome === 'pending' ||
    props.workspaceState.kitchen.name
  ) {
    return 'Ask Kitchen AI…'
  }
  return 'Tell us about your Kitchen…'
})
</script>
