<template>
  <WorkspaceAI aria-label="KitchenAI" compact>
    <UChatPrompt
      :model-value="state.prompt"
      :placeholder="derived.placeholder"
      variant="soft"
      aria-label="Ask KitchenAI"
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

    <div class="flex flex-wrap gap-2" aria-label="KitchenAI suggestions">
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
