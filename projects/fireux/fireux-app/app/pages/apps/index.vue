<template>
  <UPage>
    <UPageHeader
      class="pageheader"
      :title="pageTitle"
      description="Platform app index for the current FireUX project."
    />
    <UPageBody class="pagebody">
      <EntityIndexCta
        title="Apps index"
        description="Browse app records from the FireUX project and jump into the project console when you need to manage them."
        family="project"
        source="db.collections.apps"
        :count-label="`${collection.length} app${collection.length === 1 ? '' : 's'}`"
        :actions="actions"
      />
      <AppCollectionManager :collection="collection" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useAppCollection } from 'fireux-core/runtime/composables/fireux/firestore/core/app/fetch/useAppCollection'
import { computed } from 'vue'

definePageMeta({
  tag: 'apps',
  nav: {
    key: 'apps',
    label: 'Apps',
    icon: 'i-lucide-app-window',
    order: 40,
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
  tenant: 'global',
  title: 'Apps',
  description: 'Current app and other apps in this ecosystem.',
  layout: 'default',
  name: 'AppsIndexPage',
})

const { appName } = useFireUXConfig()
const pageTitle = 'Apps'

useHead({ title: `${appName} | ${pageTitle}` })

const { apps } = useAppCollection()
const collection = computed(() => apps.value ?? [])

const actions = [
  {
    label: 'Project',
    cta: 'Open Project Console',
    to: '/console/projects/overview',
    icon: 'i-lucide-layout-dashboard',
  },
  {
    label: 'Manage',
    cta: 'Manage apps',
    to: '/console/projects/apps',
    icon: 'i-lucide-app-window',
  },
  {
    label: 'Guide',
    cta: 'Learn more',
    to: '/apps/learn-more',
    icon: 'i-lucide-book-open',
  },
] as const
</script>
