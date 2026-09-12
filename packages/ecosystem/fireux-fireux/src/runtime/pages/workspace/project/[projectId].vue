<template>
  <UDashboardPanel id="workspace-project-detail">
    <template #header>
      <WorkspaceProjectNav />
    </template>
    <template #body>
      <section class="workspace-surface workspace-surface--compact">
        <UButton
          to="/"
          label="Back to Projects"
          icon="i-lucide-arrow-left"
          color="neutral"
          variant="soft"
          class="w-fit"
        />
        <template v-if="project">
          <UAvatar
            :src="project.image_url || undefined"
            :alt="project.name"
            icon="i-lucide-briefcase-business"
            size="3xl"
          />
          <div>
            <h1 class="text-2xl font-semibold text-highlighted">
              {{ project.name }}
            </h1>
            <p v-if="project.description" class="mt-1 text-muted">
              {{ project.description }}
            </p>
          </div>
        </template>
        <USkeleton v-else-if="loading" class="h-32 w-full rounded-xl" />
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
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { useProjectCollection } from 'fireux-core/runtime/project/composables/useProjectCollection'

const projectId = useRouteParam('projectId')
const source = useProjectCollection({
  filter: computed(() => ({ ids: [projectId.value] })),
})
const project = computed(() =>
  source.projects.value.find((candidate) => candidate.id === projectId.value)
)
const loading = source.pending

definePageMeta({
  layout: 'workspace',
  pageTransition: false,
  workspace: 'project',
  workspaceSurface: 'detail',
  visibility: { ecosystems: ['fireux'] },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
