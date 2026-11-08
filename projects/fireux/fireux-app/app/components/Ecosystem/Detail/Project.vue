<template>
  <FireState
    :outcome="publicOutcome"
    entity="published Project"
    :error="error"
  />
  <UCard v-if="publicProject">
    <template #header>Project</template>
    <ULink :to="`/projects/${encodeURIComponent(publicProject.id)}`">
      {{ publicProject.identity.name || publicProject.id }}
    </ULink>
    <p class="fx-type-caption">{{ publicProject.identity.description }}</p>
  </UCard>
  <FireDiagnosticsDebugPanel
    title="Ecosystem Project relation"
    context="The exact Project related to the passed Ecosystem."
    object-origin="fetched"
    :objects="{ project }"
    :derived="{ projectId: ecosystem.project_id, publicOutcome }"
    launcher
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Ecosystem } from 'fireux-core/runtime/ecosystem/models/ecosystem.model'
import { useProjectDetail } from 'fireux-projects/runtime/project/composables/useProjectDetail'
import type { ReadOutcome } from 'fireux-core/runtime/utils/read-outcome'

const props = defineProps<{ ecosystem: Ecosystem }>()
const { project, outcome, error } = useProjectDetail(
  () => props.ecosystem.project_id
)
const publicProject = computed(() =>
  project.value?.identity.status === 'active' ? project.value : null
)
const publicOutcome = computed<ReadOutcome>(() =>
  outcome.value === 'ready' && !publicProject.value ? 'empty' : outcome.value
)
</script>
