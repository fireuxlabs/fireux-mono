<!-- Concurrent edit — 2026-07-19 16:49 CEST — Repo Efficiency Pass 5 of 6: remove raw workspace debug label. -->
<!-- Concurrent edit — 2026-07-21 21:23 CEST — Workspace index parity: delegate selected-target chrome to Core. -->
<template>
  <WorkspaceSelectedTarget
    label="Project"
    :selected-id="projectId"
    :description="projectName"
    :outcome="outcome"
    @clear="emit('clear')"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { WorkspaceTargetOutcome } from '../../../../composables/fireux/workspace/useWorkspaceDirectoryIndex'
import type { ProjectSurface } from '../../../composables/useProjectInterface'

const props = withDefaults(
  defineProps<{
    project?: ProjectSurface | null
    projectId?: string
    outcome?: WorkspaceTargetOutcome
  }>(),
  {
    project: null,
    projectId: '',
    outcome: 'ready',
  }
)

const emit = defineEmits<{
  (event: 'clear'): void
}>()

const projectName = computed(() => String(props.project?.name || '').trim())
</script>
