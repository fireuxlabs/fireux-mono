<template>
  <UPage>
    <UPageHeader
      title="Dev · Projects"
      description="Model shape for the FireUX projects collection."
    />

    <UPageBody class="pagebody">
      <DevModel
        :title="'Projects · Model'"
        :model="projectModelRuntime"
      />

      <ProjectCollectionManager :collection="collection" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useProjectCollection } from 'fireux-core/runtime/composables/fireux/firestore/system/project/fetch/useProjectCollection'
import { FireuxProjectModel as ProjectModelRuntime } from 'fireux-core/runtime/models/system/project.model'

definePageMeta({
  layout: 'dev',
  title: 'Dev · Projects',
  nav: {
    key: 'dev-projects',
    label: 'Projects',
    icon: 'i-lucide-folders',
    desktop: true,
    group: 'core',
    order: 25,
    layouts: ['dev'],
  },
})

const projectModelRuntime = ProjectModelRuntime

const { projects } = useProjectCollection()

const collection = computed(() =>
  (projects.value ?? []).map((item) => {
    const key = String(item.id || item.slug || '').trim()
    const name = String(item.name || key || 'Untitled project').trim()
    const status = String(item.status || 'active').trim()

    return {
      key,
      name,
      status,
    }
  })
)
</script>
