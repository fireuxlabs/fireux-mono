<template>
  <UPage>
    <UPageBody>
      <!-- 01 Detail — the route resolves the Ecosystem and passes named relationships. -->
      <DirectoryEcosystemDetail
        v-if="ecosystem"
        :ecosystem="ecosystem"
        :apps="ecosystemApps"
        :project="project"
        :explore-path="explorePath"
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
import type {
  EcosystemDirectoryEntry,
  PlatformDirectoryResponse,
} from 'fireux-core/runtime/models/utils/directory'
import type { Project } from 'fireux-core/runtime/project/models/project.model'
import { useApps } from 'fireux-core/runtime/app/composables/useApps'
import { useProjects } from 'fireux-core/runtime/project/composables/useProjects'

definePageMeta({
  layout: 'default',
  title: 'Ecosystem',
  description: 'View a FireUX Ecosystem and its connected Apps.',
  name: 'FireuxEcosystemDetailPage',
})

const routeId = useRouteParam('id')
const { data } = await useAsyncData<PlatformDirectoryResponse>(
  'fireux-default-directory',
  () => $fetch('/api/directory'),
  { server: true, lazy: false }
)
const { projects } = useProjects()
const { apps } = useApps('/api/platform/apps')
const ecosystem = computed(
  () =>
    data.value?.ecosystems.find(
      (entry: EcosystemDirectoryEntry) =>
        entry.id === routeId.value ||
        entry.detail_url === `/ecosystems/${routeId.value}`
    ) ?? null
)
const ecosystemApps = computed(() =>
  ecosystem.value
    ? apps.value.filter((app) => app.ecosystem_id === ecosystem.value?.id)
    : []
)
const project = computed(
  () =>
    projects.value.find(
      (item: Project) => item.id === ecosystem.value?.project_id
    ) ?? null
)
const explorePath = computed(() =>
  ['misebox', 'werkbox'].includes(routeId.value)
    ? `/ecosystems/${routeId.value}/explore`
    : ''
)
const canonicalPath = computed(
  () => ecosystem.value?.detail_url || `/ecosystems/${routeId.value}`
)

useSeo({
  title: computed(() =>
    ecosystem.value
      ? `${ecosystem.value.name} · FireUX Ecosystem`
      : 'FireUX Ecosystem'
  ),
  description: computed(
    () =>
      ecosystem.value?.description ||
      'View a FireUX Ecosystem and its connected Apps.'
  ),
  path: canonicalPath,
  image: computed(() => ecosystem.value?.image_url || '/img/app/cover.png'),
  robots: computed(() =>
    ecosystem.value ? 'index, follow' : 'noindex, nofollow'
  ),
  jsonLdBuilder: (context) =>
    ecosystem.value
      ? buildPublicPageJsonLd({
          canonicalUrl: context.canonicalUrl,
          description: context.description,
          image: context.image,
          pageType: 'CollectionPage',
          title: context.title,
          items: ecosystemApps.value.map((app) => ({
            name: app.name,
            url: context.absoluteUrl(`/apps/${app.id}`),
          })),
        })
      : null,
})
</script>
