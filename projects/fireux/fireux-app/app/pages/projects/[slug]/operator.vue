<template>
  <EntityOperatorBridge
    entity-label="Project"
    :entity-title="projectTitle"
    :public-to="publicTo"
    console-to="/console/project"
    :signed-in="Boolean(userId)"
    :has-authority="hasAuthority"
    :missing="!publicProject && !pending"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import EntityOperatorBridge from 'fireux-core/runtime/components/entity/OperatorBridge.vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import {
  useProjectCollection,
  type ProjectCollectionFilter,
} from 'fireux-core/runtime/composables/fireux/firestore/core/project/fetch/useProjectCollection'

definePageMeta({
  layout: 'default',
  name: 'ProjectOperatorBridgePage',
})

const route = useRoute()
const { uid } = useAuth()
const routeSlug = computed(() => String(route.params.slug || '').trim())
const userId = computed(() => String(uid.value || '').trim())
const operatorFilter = computed<ProjectCollectionFilter>(() =>
  userId.value ? { operatorId: userId.value } : { ids: [] }
)
const { projects: publicProjects, pending } = useProjectCollection()
const { projects: operatorProjects } = useProjectCollection({
  filter: operatorFilter,
})

const publicProject = computed(() => {
  const slug = routeSlug.value.toLowerCase()
  return publicProjects.value.find(
    (project) => String(project.slug || '').trim().toLowerCase() === slug
  ) ?? null
})
const projectId = computed(() => String(publicProject.value?.id || '').trim())
const hasAuthority = computed(() =>
  Boolean(projectId.value && operatorProjects.value.some((project) => project.id === projectId.value))
)
const projectTitle = computed(() =>
  String(publicProject.value?.name || routeSlug.value || 'Project').trim()
)
const publicTo = computed(() =>
  routeSlug.value ? `/projects/${encodeURIComponent(routeSlug.value)}` : '/projects'
)
</script>
