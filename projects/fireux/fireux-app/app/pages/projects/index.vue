<template>
  <UPage>
    <UPageHeader
      class="pageheader"
      :title="pageTitle"
      :description="pageDescription"
    />

    <UPageBody class="pagebody">
      <ProjectCollectionManager
        :collection="projects"
        :link="true"
        :show-badges="false"
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { computed } from 'vue'
import { getDemoProjects } from 'fireux-core/runtime/composables/fireux/app/utils/project-demo-scenarios/demo-scenarios'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import type { ProjectSurface } from 'fireux-core/runtime/composables/fireux/firestore/core/project/utils/view/useProjectInterface'

definePageMeta({
  title: 'Projects',
  tag: 'projects',
  nav: {
    key: 'projects',
    label: 'Projects',
    icon: 'i-lucide-folders',
    order: 20,
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
  layout: 'default',
  name: 'ProjectsIndexPage',
})

const { appName } = useFireUXConfig()
const pageTitle = 'Projects'
const pageDescription = 'Choose a project surface for the current runtime.'

useHead({ title: `${appName} | ${pageTitle}` })

useSeoMeta({
  title: 'Projects · FireUX',
  description: pageDescription,
})

const projects = computed<ProjectSurface[]>(() =>
  getDemoProjects().map((project) => ({
    id: project.id,
    slug: project.id,
    name: project.name,
    description: project.label,
    image_url: project.image_url,
    project_type: 'demo',
    status: 'active',
  }))
)
</script>
