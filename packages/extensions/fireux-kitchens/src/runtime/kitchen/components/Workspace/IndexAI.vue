<template>
  <WorkspaceAI aria-label="KitchenAI" compact>
    <WorkspaceAIComposer
      :model-value="state.prompt"
      :placeholder="derived.placeholder.value"
      :suggestions="derived.suggestions.value"
      suggestions-aria-label="KitchenAI suggestions"
      aria-label="Ask KitchenAI"
      @update:model-value="state.prompt = $event"
      @select-suggestion="actions.selectSuggestion($event.label)"
    />
  </WorkspaceAI>
</template>

<script setup lang="ts">
import type {
  KitchenWorkspaceIndexDerived,
  KitchenWorkspaceIndexState,
} from '../../composables/workspace/index/useKitchenWorkspaceIndex'
import { useKitchenAIIndex } from '../../composables/workspace/index/useKitchenAIIndex'

const props = defineProps<{
  workspaceState: KitchenWorkspaceIndexState
  workspaceDerived: KitchenWorkspaceIndexDerived
}>()

const { state, derived, actions } = useKitchenAIIndex(() => ({
  state: props.workspaceState,
  derived: props.workspaceDerived,
}))
</script>
