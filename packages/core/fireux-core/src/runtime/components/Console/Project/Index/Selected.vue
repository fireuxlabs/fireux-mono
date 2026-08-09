<!-- Concurrent edit — 2026-07-19 16:49 CEST — Repo Efficiency Pass 5 of 6: remove raw console debug label. -->
<!-- Concurrent edit — 2026-07-21 21:23 CEST — Console index parity: delegate selected-target chrome to Core. -->
<template>
  <ConsoleSelectedTarget
    label="Project"
    :selected-id="projectId"
    :description="projectName"
    @clear="emit('clear')"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ProjectSurface } from '../../../../composables/fireux/project/useProjectInterface'

const props = defineProps<{
  project?: ProjectSurface | null
  projectId?: string
}>()

const emit = defineEmits<{
  (event: 'clear'): void
}>()

const projectName = computed(() =>
  String(props.project?.name || '').trim()
)
</script>
