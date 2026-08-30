<template>
  <UPage>
    <UPageBody>
      <!-- 01 Detail — the route resolves the App and passes its named relationships. -->
      <DirectoryAppDetail
        v-if="app"
        :app="app"
        :project="project"
        :ecosystem="ecosystem"
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAsyncData } from '#imports'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import {
  buildPublicPageJsonLd,
  useSeo,
} from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import type { App } from 'fireux-core/runtime/app/models/app.model'
import type { Project } from 'fireux-core/runtime/project/models/project.model'
import type {
  DetailResponse,
  EcosystemDirectoryEntry,
} from 'fireux-core/runtime/models/utils/directory'
import { usePlatformDirectory } from '../../composables/usePlatformDirectory'
import { useProjects } from 'fireux-core/runtime/project/composables/useProjects'
import { isDirectoryAppIndexable } from '../../utils/directorySearchPolicy'

definePageMeta({
  layout: 'default',
  title: 'App',
  description: 'View a FireUX App and its relationships.',
  name: 'FireuxAppDetailPage',
})

const routeId = useRouteParam('id')
const { data: directoryData } = usePlatformDirectory()
const { data } = await useAsyncData<DetailResponse<App>>(
  () => `fireux-app-detail-${routeId.value}`,
  () => $fetch(`/api/platform/apps/${encodeURIComponent(routeId.value)}`),
  { server: true, lazy: false, watch: [routeId] }
)
const { projects } = useProjects()
const app = computed<App | null>(() => data.value?.item ?? null)
const project = computed(
  () =>
    projects.value.find(
      (entry: Project) => entry.id === app.value?.project_id
    ) ?? null
)
const ecosystem = computed<EcosystemDirectoryEntry | null>(() => {
  const id = app.value?.ecosystem_id
  return id
    ? (directoryData.value?.ecosystems.find(
        (entry: EcosystemDirectoryEntry) => entry.id === id
      ) ?? null)
    : null
})
const pageDescription = computed(
  () => app.value?.description || app.value?.short_bio || 'FireUX App.'
)
const canonicalPath = computed(
  () => `/apps/${encodeURIComponent(app.value?.id || routeId.value)}`
)
const isIndexable = computed(() =>
  Boolean(app.value && isDirectoryAppIndexable(app.value.id))
)

useSeo({
  title: computed(() =>
    app.value ? `${app.value.name} · FireUX App` : 'FireUX App'
  ),
  description: pageDescription,
  path: canonicalPath,
  image: computed(
    () =>
      app.value?.media?.cover_url ||
      app.value?.media?.thumbnail_url ||
      undefined
  ),
  robots: computed(() =>
    isIndexable.value ? 'index, follow' : 'noindex, nofollow'
  ),
  jsonLdBuilder: (context) => {
    if (!isIndexable.value || !app.value) return null
    const items = []
    if (project.value)
      items.push({
        name: project.value.name,
        url: context.absoluteUrl(`/projects/${project.value.id}`),
      })
    if (ecosystem.value)
      items.push({
        name: ecosystem.value.name,
        url: context.absoluteUrl(ecosystem.value.detail_url),
      })
    return buildPublicPageJsonLd({
      canonicalUrl: context.canonicalUrl,
      description: context.description,
      image: context.image,
      title: context.title,
      items,
    })
  },
})
</script>
