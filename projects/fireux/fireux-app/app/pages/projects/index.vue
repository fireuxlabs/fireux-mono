<template>
  <UPage>
    <UPageHeader
      class="pageheader"
      title="FireUX projects"
      description="Browse published project records in the FireUX ecosystem."
    />

    <UPageBody class="pagebody">
      <EntityIndexCta
        title="Published project directory"
        description="Projects connect ecosystems, apps, Firebase setup, operators, and runtime ownership."
        family="console"
        source="projects/{projectId}"
        :count-label="`${publishedCount} project${publishedCount === 1 ? '' : 's'}`"
        :actions="actions"
      />

      <UCard v-if="pending">
        <p>Loading projects…</p>
      </UCard>

      <ProjectCollectionManager
        v-else-if="featuredProjects.length"
        :collection="featuredProjects"
        title="Featured projects"
        description="Selected project records for FireUX."
        :link="true"
        :show-search="false"
        :show-variant-toggle="false"
        :show-badges="false"
        initial-variant="cell"
      />

      <ProjectCollectionManager
        v-if="!pending"
        :collection="publishedProjects"
        title="All projects"
        description="Browse the full published project collection."
        :link="true"
        :show-source-toggle="false"
        :show-filter-toggle="false"
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppPublicSettings } from 'fireux-core/runtime/composables/fireux/app/useAppPublicSettings'
import {
  useProjectCollection,
} from 'fireux-core/runtime/composables/fireux/firestore/core/project/fetch/useProjectCollection'
import type { ProjectSurface } from 'fireux-core/runtime/composables/fireux/firestore/core/project/utils/view/useProjectInterface'

definePageMeta({
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
  title: 'Projects',
  description: 'Browse published FireUX projects.',
})

useSeoMeta({
  title: 'FireUX Projects',
  description:
    'Browse published project records in FireUX, including ecosystem apps, runtime setup, and operator surfaces.',
})

const { projects, pending } = useProjectCollection()
const { featuredSlugsFor } = useAppPublicSettings()
const featuredProjectSlugs = featuredSlugsFor('project')

const clean = (value: unknown) => String(value ?? '').trim()

const publishedProjects = computed(() =>
  (projects.value ?? [])
    .filter((entry) => clean(entry.status) === 'active')
    .filter((entry) => clean(entry.id) && clean(entry.slug))
    .sort((a, b) => clean(a.name).localeCompare(clean(b.name)))
)
const publishedCount = computed(() => publishedProjects.value.length)
const featuredProjects = computed(() => {
  const bySlug = new Map(
    publishedProjects.value.map((entry) => [clean(entry.slug), entry])
  )

  return featuredProjectSlugs.value
    .map((slug) => bySlug.get(slug))
    .filter((entry): entry is ProjectSurface => Boolean(entry))
})

const actions = [
  {
    label: 'Pricing',
    cta: 'Launch a project',
    to: '/pricing/apps',
    icon: 'i-lucide-badge-dollar-sign',
  },
  {
    label: 'Guide',
    cta: 'Learn more',
    to: '/projects/learn-more',
    icon: 'i-lucide-book-open',
  },
  {
    label: 'Project',
    cta: 'Project Console',
    to: '/console/project',
    icon: 'i-lucide-layout-dashboard',
  },
] as const
</script>
