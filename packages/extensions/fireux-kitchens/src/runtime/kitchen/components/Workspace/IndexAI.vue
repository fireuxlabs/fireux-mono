<template>
  <section
    class="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 sm:px-6"
    aria-label="KitchenAI"
  >
    <UChatPrompt
      :model-value="state.prompt"
      :placeholder="derived.placeholder"
      :loading="derived.submitting"
      variant="soft"
      aria-label="Ask KitchenAI"
      @update:model-value="state.prompt = $event"
      @submit="actions.sendPrompt"
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
          <UChatPromptSubmit
            :status="derived.submitting ? 'submitted' : 'ready'"
          />
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
        @click="state.prompt = suggestion.label"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import type { KitchenWorkspaceIndexState } from '../../composables/workspace/index/useKitchenWorkspaceIndex'
import type { KitchenWorkspaceIndexDerived } from '../../composables/workspace/index/useKitchenWorkspaceIndex'
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
