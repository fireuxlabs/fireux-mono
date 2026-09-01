<template>
  <WorkspaceAI aria-label="Project Team AI" compact>
    <WorkspaceAIComposer
      placeholder="Project Team AI is not connected yet."
      :suggestions="suggestions"
      suggestions-aria-label="Suggested Project actions"
      suggestions-disabled
      aria-label="Ask Project Team AI"
    />
  </WorkspaceAI>
</template>

<script setup lang="ts">
import type { useProjectWorkspaceTeam } from 'fireux-core/runtime/project/composables/workspace/team/useProjectWorkspaceTeam'

type Workspace = ReturnType<typeof useProjectWorkspaceTeam>

defineProps<{
  state: Workspace['state']['value']
  derived: Workspace['derived']['value']
  actions: Workspace['actions']
}>()

const suggestions = [
  { label: 'Who is on my Project Team?' },
  { label: 'Add a Team member' },
  { label: 'How do Team invitations work?' },
] as const
</script>
