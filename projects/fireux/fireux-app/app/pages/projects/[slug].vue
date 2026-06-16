<template>
  <UPage>
    <UPageHeader
      class="pageheader"
      :title="pageTitle"
      :description="pageDescription"
    />

    <UPageBody class="pagebody">
      <UPageCard v-if="pending" variant="subtle">
        <p class="text-sm text-dimmed">Loading project…</p>
      </UPageCard>

      <UPageCard
        v-else-if="!project"
        title="Project not found"
        description="This project could not be found in the current runtime."
        variant="subtle"
      />

      <div v-else class="space-y-4">
        <!-- profile -->
        <ProjectCardsProfile v-if="profileCard" :card="profileCard" />

        <!-- main -->

        <!-- operator -->
        <ProjectPublicOperatorPanel :project="project" />

        <!-- dev -->
      </div>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead, useRoute } from '#imports'
import { computed } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useProjectFetch } from 'fireux-core/runtime/composables/fireux/firestore/core/project/fetch/useProjectFetch'
import {
  useProjectInterface,
} from 'fireux-core/runtime/composables/fireux/firestore/core/project/utils/view/useProjectInterface'

definePageMeta({
  layout: 'default',
  title: 'Project',
  description: 'View a FireUX project.',
  name: 'ProjectDetailPage',
})

const route = useRoute()
const { appName } = useFireUXConfig()
const { profile } = useProjectInterface()

const routeKey = computed<string | null>(() => String(route.params.slug || '').trim() || null)
const { project, pending } = useProjectFetch(routeKey)

const profileCard = computed(() => profile(project.value))
const pageTitle = computed(
  () =>
    profileCard.value?.title ||
    String(project.value?.name || project.value?.slug || routeKey.value || 'Project').trim()
)
const pageDescription = computed(() => {
  if (project.value?.description) return String(project.value.description).trim()
  if (profileCard.value?.meta) return profileCard.value.meta
  return 'Project details for the current runtime.'
})
useHead(() => ({
  title: `${appName} | ${pageTitle.value}`,
}))

useSeoMeta({
  title: computed(() => `${pageTitle.value} · FireUX`),
  description: pageDescription,
})
</script>
