<template>
  <WorkspaceAI aria-label="ProjectAI" compact>
    <WorkspaceAIComposer
      :model-value="state.prompt"
      :placeholder="derived.placeholder.value"
      :suggestions="derived.suggestions.value"
      suggestions-aria-label="ProjectAI suggestions"
      aria-label="Ask ProjectAI"
      @update:model-value="state.prompt = $event"
      @select-suggestion="actions.selectSuggestion($event.label)"
    />
  </WorkspaceAI>
</template>

<script setup lang="ts">
import type {
  ProjectWorkspaceIndexDerived,
  ProjectWorkspaceIndexState,
} from 'fireux-core/runtime/project/composables/workspace/index/useProjectWorkspaceIndex'
import { useProjectAIIndex } from 'fireux-fireux/runtime/project/composables/workspace/index/useProjectAIIndex'

const props = defineProps<{
  workspaceState: ProjectWorkspaceIndexState
  workspaceDerived: ProjectWorkspaceIndexDerived
}>()

const { state, derived, actions } = useProjectAIIndex(() => ({
  state: props.workspaceState,
  derived: props.workspaceDerived,
}))
</script>
