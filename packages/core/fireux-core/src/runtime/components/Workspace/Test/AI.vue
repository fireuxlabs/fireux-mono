<template>
  <WorkspaceAI :aria-label="`${entityLabel} Test AI`" compact>
    <WorkspaceAIComposer
      :placeholder="`Ask ${entityLabel} Test AI…`"
      :suggestions="suggestions"
      suggestions-aria-label="Available Test primitives"
      :aria-label="`Ask ${entityLabel} Test AI`"
    />
  </WorkspaceAI>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { useTest } from '../../../composables/fireux/workspace/useTest'
type WorkspaceTestDerived = ReturnType<typeof useTest>['derived']['value']
const props = defineProps<{
  entityLabel: string
  derived: WorkspaceTestDerived
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
