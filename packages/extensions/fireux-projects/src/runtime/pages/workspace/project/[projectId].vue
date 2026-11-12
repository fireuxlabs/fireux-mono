<template>
  <WorkspaceProjectHomeHeader />
  <section class="workspace-surface workspace-surface--compact">
    <UButton
      to="/"
      label="Back to Projects"
      icon="i-lucide-arrow-left"
      color="neutral"
      variant="soft"
    />
    <template v-if="project">
      <UAvatar
        :src="project.identity.image_url || undefined"
        :alt="project.identity.name"
        icon="i-lucide-briefcase-business"
        size="3xl"
      />
      <div>
        <h1 class="fx-type-page-title">
          {{ project.identity.name }}
        </h1>
        <p v-if="project.identity.description">
          {{ project.identity.description }}
        </p>
      </div>
    </template>
    <FireState v-else-if="loading" outcome="pending" />
    <UAlert
      v-else-if="source.outcome.value === 'error'"
      title="Project could not be loaded"
      description="Please try again."
      color="error"
      variant="soft"
      role="alert"
      aria-live="assertive"
    >
      <template #actions>
        <FireCopyError
          message="Project could not be loaded&#10;Please try again."
        />
      </template>
    </UAlert>
    <UAlert
      v-else
      color="neutral"
      variant="subtle"
      icon="i-lucide-file-question"
      title="Project not found"
      description="Return to Projects and choose an available record."
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { useProjectCollection } from '../../../project/composables/useProjectCollection'

const projectId = useRouteParam('projectId')
const source = useProjectCollection({
  filter: computed(() => ({ ids: [projectId.value] })),
})
const project = computed(() =>
  source.projects.value.find((candidate) => candidate.id === projectId.value)
)
const loading = source.pending

definePageMeta({
  layout: false,
  workspacePage: true,
  pageTransition: false,
  workspace: 'project',
  workspaceSurface: 'detail',
  visibility: { ecosystems: ['fireux'] },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
