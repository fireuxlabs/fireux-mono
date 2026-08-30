<template>
  <UPage>
    <UPageBody>
      <!-- 01 Detail — the route resolves the Project and passes its Apps. -->
      <DirectoryProjectDetail
        v-if="project"
        :project="project"
        :apps="projectApps"
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAsyncData } from '#imports'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { useApps } from 'fireux-core/runtime/app/composables/useApps'
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
const { apps } = useApps('/api/platform/apps')
const project = computed(() => data.value?.item ?? null)
const projectApps = computed(() =>
  apps.value.filter((app) => app.project_id === projectId.value)
)

useSeo({
  title: computed(() =>
    project.value ? `${project.value.name} · FireUX Project` : 'FireUX Project'
  ),
  description: computed(
    () =>
      project.value?.description ||
      'View a FireUX Project and its connected Apps.'
  ),
  path: computed(() => `/projects/${encodeURIComponent(projectId.value)}`),
  image: computed(() => project.value?.image_url || undefined),
})
</script>
