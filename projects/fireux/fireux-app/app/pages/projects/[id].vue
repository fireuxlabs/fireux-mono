<template>
  <UPage>
    <UPageBody>
      <ProjectDetail v-if="project" :project="project" />
      <FireStateCard
        v-else-if="outcome === 'pending'"
        entity="project"
        kind="document"
        loading
      />
      <FireStateCard
        v-else-if="outcome === 'error'"
        entity="project"
        kind="document"
        state="error"
      />
      <FireStateCard
        v-else-if="outcome === 'missing'"
        entity="project"
        kind="document"
        state="missing"
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
import { useProjectDetail } from 'fireux-fireux/runtime/project/composables/useProjectDetail'

definePageMeta({
  layout: 'default',
  title: 'Project',
  description: 'View Project details.',
})

const projectId = useRouteParam('id')
const { project, outcome, ready } = useProjectDetail(projectId)
await ready
</script>
