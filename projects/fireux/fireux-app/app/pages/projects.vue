<template>
  <UPage>
    <UPageHeader
      class="pageheader"
      :title="pageTitle"
      description="Platform project index for the current FireUX runtime."
    />

    <UPageBody class="pagebody">
      <ProjectCTA />
      <ProjectCollectionManager :collection="projects" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useProjectCollection } from 'fireux-core/runtime/composables/fireux/firestore/system/project/fetch/useProjectCollection'

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

useHead({ title: `${appName} | ${pageTitle}` })

useSeoMeta({
  title: 'Projects · FireUX',
  description: 'Entity index for FireUX projects stored in db.collections.projects.',
})

const { projects } = useProjectCollection()
</script>
