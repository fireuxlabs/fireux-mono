<template>
  <UPage>
    <UPageBody>
      <DirectoryProjectDetail v-if="project" :project="project" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAsyncData } from '#imports'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import type { Project } from 'fireux-core/runtime/project/models/project.model'
import type { DetailResponse } from 'fireux-core/runtime/models/utils/directory'

definePageMeta({
  layout: 'default',
  title: 'Project',
  description: 'View a FireUX Project and its connected Apps.',
  name: 'FireuxProjectDetailPage',
})

const projectId = useRouteParam('id')
const { data } = await useAsyncData<DetailResponse<Project>>(
  () => `project:${projectId.value}`,
  () => $fetch(`/api/projects/${encodeURIComponent(projectId.value)}`),
  { server: true, lazy: false, watch: [projectId] }
)
const project = computed(() => data.value?.item ?? null)
</script>
