<template>
  <WorkspaceAI aria-label="Project Test AI" compact>
    <WorkspaceAIComposer
      placeholder="Ask Project Test AI…"
      :suggestions="suggestions"
      suggestions-aria-label="Available Test primitives"
      aria-label="Ask Project Test AI"
    />
  </WorkspaceAI>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { useProjectWorkspaceTest } from '../../../../project/composables/workspace/test/useProjectWorkspaceTest'

type Workspace = ReturnType<typeof useProjectWorkspaceTest>
const props = defineProps<{
  state: Workspace['state']['value']
  derived: Workspace['derived']['value']
}>()
const suggestions = computed(() => [
  ...(props.derived.capability.primitives.create.available
    ? [{ label: 'Create a Test' }]
    : []),
  ...(props.derived.capability.primitives.read.available
    ? [{ label: 'Read the Tests' }]
    : []),
  ...(props.derived.capability.primitives.update.available
    ? [{ label: 'Update the selected Test' }]
    : []),
  ...(props.derived.capability.primitives.delete.available
    ? [{ label: 'Delete the selected Test' }]
    : []),
])
</script>
