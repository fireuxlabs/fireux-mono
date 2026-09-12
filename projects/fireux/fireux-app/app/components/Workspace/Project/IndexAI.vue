<template>
  <WorkspaceAI aria-label="ProjectAI" compact>
    <WorkspaceAIComposer
      v-model="prompt"
      :placeholder="
        selectedId
          ? 'Ask ProjectAI about this workspace…'
          : 'Tell us about your workspace…'
      "
      :suggestions="suggestions"
      suggestions-aria-label="ProjectAI suggestions"
      aria-label="Ask ProjectAI"
      @select-suggestion="prompt = $event.label"
    />
  </WorkspaceAI>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useWorkspace } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspace'
import { useWorkspaceCreation } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceCreation'
import { useProjectAccess } from 'fireux-core/runtime/project/composables/useProjectAccess'

const prompt = ref('')
const { selectedId } = useWorkspace('project')
const access = useProjectAccess()
const creation = useWorkspaceCreation('project', () => ({
  count: access.ids.value.length,
  outcome: access.outcome.value,
}))
watch(selectedId, () => {
  prompt.value = ''
})
const suggestions = computed(() =>
  [
    ...(creation.canCreate.value
      ? [{ label: 'Help me get started', icon: 'i-lucide-sparkles' }]
      : []),
    {
      label: selectedId.value
        ? 'What should I work on next?'
        : 'What should I set up first?',
      icon: 'i-lucide-compass',
    },
    {
      label: 'Help me describe my Project',
      icon: 'i-lucide-message-square-text',
    },
    { label: 'Help me plan my workspace', icon: 'i-lucide-sparkles' },
  ].slice(0, 4)
)
</script>
