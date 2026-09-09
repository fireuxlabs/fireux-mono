<template>
  <WorkspaceAI aria-label="KitchenAI" compact>
    <WorkspaceAIComposer
      v-model="prompt"
      :placeholder="
        selectedId
          ? 'Ask KitchenAI about this workspace…'
          : 'Tell us about your workspace…'
      "
      :suggestions="suggestions"
      suggestions-aria-label="KitchenAI suggestions"
      aria-label="Ask KitchenAI"
      @select-suggestion="prompt = $event.label"
    />
  </WorkspaceAI>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useWorkspace } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspace'
import { useKitchenWorkspace } from '../../composables/workspace/useKitchenWorkspace'

const prompt = ref('')
const { selectedId } = useWorkspace('kitchen')
const creation = useKitchenWorkspace()
watch(selectedId, () => {
  prompt.value = ''
})
const suggestions = computed(() =>
  [
    ...(creation.canCreate.value
      ? [{ label: 'Help me create my workspace', icon: 'i-lucide-plus' }]
      : []),
    {
      label: selectedId.value
        ? 'What should I work on next?'
        : 'What should I set up first?',
      icon: 'i-lucide-compass',
    },
    {
      label: 'Help me describe my Kitchen',
      icon: 'i-lucide-message-square-text',
    },
    { label: 'Help me plan my workspace', icon: 'i-lucide-sparkles' },
  ].slice(0, 4)
)
</script>
