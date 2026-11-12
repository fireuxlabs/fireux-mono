<template>
  <UPage>
    <UPageBody>
      <ProjectDetail v-if="project" :project="project" />
      <FireState
        v-else-if="outcome === 'pending'"
        entity="project"
        outcome="pending"
      />
      <FireState
        v-else-if="outcome === 'error'"
        entity="project"
        outcome="error"
      />
      <UAlert
        v-else-if="outcome === 'empty'"
        title="Project not found"
        color="neutral"
        variant="soft"
        role="status"
        aria-live="polite"
      />
      <FireDiagnosticsDebugPanel
        title="Project detail acquisition"
        context="Canonical Project fetched by the detail route."
        object-origin="fetched"
        :objects="{ project }"
        :derived="{ projectId }"
        include-route
        launcher
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { useProjectDetail } from 'fireux-projects/runtime/project/composables/useProjectDetail'

definePageMeta({
  layout: 'default',
  title: 'Project',
  description: 'View Project details.',
})

const projectId = useRouteParam('id')
const { project, outcome, ready } = useProjectDetail(projectId)
await ready
</script>
