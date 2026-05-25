<template>
  <UPage>
    <UPageHeader
      class="pageheader"
      :title="pageTitle"
      :description="pageDescription"
    />

    <UPageBody class="pagebody">
      <UCard v-if="pending">
        <p>Loading projects…</p>
      </UCard>

      <ProjectCollectionManager
        v-else
        :collection="projects"
        :filter-mode="filterMode"
        :source-mode="sourceMode"
        :link="true"
        :show-filter-toggle="sourceMode === 'live'"
        :show-source-toggle="true"
        :show-badges="false"
        @update:filter-mode="filterMode = $event"
        @update:source-mode="sourceMode = $event"
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import {
  useProjectCollection,
  type ProjectCollectionSource,
} from 'fireux-core/runtime/composables/fireux/firestore/core/project/fetch/useProjectCollection'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'

definePageMeta({
  title: 'Projects',
  tag: 'projects',
  nav: {
    key: 'projects',
    label: 'Projects',
    icon: 'i-lucide-folders',
    order: 60,
    desktop: true,
    mobile: true,
    layouts: ['default', 'landing'],
  },
  layout: 'default',
  name: 'ProjectsIndexPage',
})

const { appName } = useFireUXConfig()
const { user } = useUser()
const pageTitle = 'Projects'
const pageDescription = 'Choose a project surface for the current runtime.'
const sourceMode = ref<ProjectCollectionSource>('live')
const filterMode = ref<'all' | 'mine'>('all')
const projectFilter = computed(() =>
  sourceMode.value === 'live' && filterMode.value === 'mine'
    ? { ids: Array.isArray(user.value?.projects) ? user.value.projects : [] }
    : undefined
)
const { projects, pending } = useProjectCollection({
  source: sourceMode,
  filter: projectFilter,
})

useHead({ title: `${appName} | ${pageTitle}` })

useSeoMeta({
  title: 'Projects · FireUX',
  description: pageDescription,
})
</script>
