<template>
  <UPage>
    <UPageBody>
      <ProjectDetail v-if="project" :project="project" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { usePlatformProjectDetail } from '../../composables/usePlatformProjectDetail'

definePageMeta({
  layout: 'default',
  title: 'Project',
  description: 'View Project details.',
})

const projectId = useRouteParam('id')
const { project, ready } = usePlatformProjectDetail(projectId)
await ready
</script>
