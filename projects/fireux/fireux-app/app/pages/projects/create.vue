<template>
  <UPage>
    <UPageHeader
      class="pageheader"
      title="Create Project"
      description="Create the public project record from the endpoint metadata. Console setup happens separately."
    />

    <UPageBody class="pagebody">
      <ProjectCreateSystem mode="public" :cancel-to="cancelTo" :return-to="returnTo" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useHead, useRoute } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import ProjectCreateSystem from 'fireux-core/runtime/components/organisms/Project/Create/System.vue'

definePageMeta({
  layout: 'default',
  requiresAuth: true,
  title: 'Create Project',
  description: 'Create the public project record.',
  nav: {
    key: 'projects-create',
    label: 'Create project',
    icon: 'i-lucide-plus',
    order: 36,
    desktop: false,
    mobile: false,
    layouts: ['default'],
  },
  name: 'ProjectsCreatePage',
})

const route = useRoute()
const { appName } = useFireUXConfig()

useHead({ title: `${appName} | Create Project` })

const returnTo = computed(() => {
  const value = String(route.query.returnTo || '').trim()
  return value.startsWith('/') ? value : '/projects'
})

const cancelTo = computed(() => {
  return '/projects'
})
</script>
