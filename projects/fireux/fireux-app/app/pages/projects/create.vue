<template>
  <UPage>
    <UPageHeader
      class="pageheader"
      title="Create Project"
      description="Create a project once, then enter the same project console from anywhere."
    />

    <UPageBody class="pagebody">
      <ProjectCreateSystem :cancel-to="cancelTo" :return-to="returnTo" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useHead, useRoute } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import ProjectCreateSystem from '../../components/project/Create/System.vue'

definePageMeta({
  layout: 'default',
  requiresAuth: true,
  title: 'Create Project',
  description: 'Create a FireUX project.',
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
  return value.startsWith('/') ? value : '/console/projects/overview'
})

const cancelTo = computed(() => {
  return returnTo.value === '/console/projects/overview' ? '/projects' : returnTo.value
})
</script>
