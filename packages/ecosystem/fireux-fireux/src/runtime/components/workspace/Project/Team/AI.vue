<template>
  <WorkspaceAI aria-label="Project Team AI" compact>
    <WorkspaceAIComposer
      placeholder="Ask Project Team AI…"
      :suggestions="suggestions"
      suggestions-aria-label="Suggested Project actions"
      aria-label="Ask Project Team AI"
    />
  </WorkspaceAI>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { useProjectWorkspaceTeam } from 'fireux-core/runtime/project/composables/workspace/team/useProjectWorkspaceTeam'

type Workspace = ReturnType<typeof useProjectWorkspaceTeam>

const props = defineProps<{
  state: Workspace['state']['value']
  derived: Workspace['derived']['value']
  actions: Workspace['actions']
}>()

const suggestions = computed(() => [
  ...(props.derived.capability.primitives.create.available
    ? [
        { label: 'Create a Team member' },
        { label: 'Find and link an existing User' },
        { label: 'Add an unlinked named person' },
      ]
    : []),
  ...(props.derived.capability.primitives.read.available
    ? [{ label: 'Read the Project Team' }]
    : []),
])
</script>
