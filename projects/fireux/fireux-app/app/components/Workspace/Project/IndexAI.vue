<template>
  <WorkspaceAI aria-label="ProjectAI" compact>
    <div class="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 sm:px-6">
      <UChatPrompt
        :model-value="state.prompt"
        :placeholder="derived.placeholder"
        variant="soft"
        aria-label="Ask ProjectAI"
        @update:model-value="state.prompt = $event"
      >
        <template #footer>
          <div class="flex w-full items-center justify-between">
            <UButton
              type="button"
              icon="i-lucide-paperclip"
              color="neutral"
              variant="ghost"
              aria-label="Attach file"
              disabled
            />
            <UChatPromptSubmit status="ready" disabled />
          </div>
        </template>
      </UChatPrompt>

      <div class="flex flex-wrap gap-2" aria-label="ProjectAI suggestions">
        <UButton
          v-for="suggestion in derived.suggestions"
          :key="suggestion.label"
          :label="suggestion.label"
          :icon="suggestion.icon"
          color="neutral"
          variant="outline"
          size="sm"
          class="rounded-full"
          @click="actions.selectSuggestion(suggestion.label)"
        />
      </div>
    </div>
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
