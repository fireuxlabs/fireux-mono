<template>
  <WorkspaceAI :aria-label="`${entityLabel} Test AI`" compact>
    <WorkspaceAIComposer
      v-model="prompt"
      @select-suggestion="prompt = $event.label"
      :placeholder="`Ask ${entityLabel} Test AI…`"
      :suggestions="suggestions"
      suggestions-aria-label="Available Test primitives"
      :aria-label="`Ask ${entityLabel} Test AI`"
    />
  </WorkspaceAI>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTestAI } from '../../../composables/fireux/workspace/useTestAI'
import type { useTest } from '../../../composables/fireux/workspace/useTest'
type WorkspaceTestDerived = ReturnType<typeof useTest>['derived']['value']
const props = defineProps<{
  entityLabel: string
  derived: WorkspaceTestDerived
}>()
const prompt = ref('')
const { suggestions } = useTestAI(() => props.derived)
</script>
