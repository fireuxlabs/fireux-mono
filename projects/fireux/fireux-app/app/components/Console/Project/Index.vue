<template>
  <section class="space-y-6">
    <UAlert
      v-if="!liveProjects.length"
      color="neutral"
      variant="soft"
      title="No live projects found"
      description="No live FireUX projects are currently available in this workspace."
    />

    <div v-else class="space-y-6">
      <div class="space-y-2">
        <div class="flex items-center justify-between gap-3">
          <div class="text-xs uppercase tracking-[0.16em] text-toned">
            {{ selectedProject ? 'Selected Project' : 'Select a project' }}
          </div>

          <UButton
            v-if="selectedProject"
            color="neutral"
            variant="ghost"
            size="sm"
            icon="i-lucide-x"
            @click="clearSelectedProject"
          >
            Clear
          </UButton>
        </div>

        <ProjectCardsPill
          v-if="selectedProjectCard"
          v-bind="selectedProjectCard"
          :link="false"
          :show-badges="false"
        />

        <p v-else class="text-sm text-dimmed">
          Choose a project below to load it into the console.
        </p>
      </div>

      <ProjectCollectionManager
        :collection="liveProjects"
        title="Choose Project"
        description="Select the live project you want to work on."
        :link="false"
        :action="true"
        :show-badges="false"
        @select="selectProject"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useProjectSelection } from 'fireux-core/runtime/composables/fireux/app/project-console/useProjectSelection'
import { useProjectCollection } from 'fireux-core/runtime/composables/fireux/firestore/core/project/fetch/useProjectCollection'
import { useProjectInterface } from 'fireux-core/runtime/composables/fireux/firestore/core/project/utils/view/useProjectInterface'

const { projects: liveProjects } = useProjectCollection()
const { pill } = useProjectInterface()
const { selectedId, setRuntimeProject, clearRuntimeProject } = useProjectSelection()

const selectedProject = computed(
  () =>
    liveProjects.value.find(
      (project) => String(project?.id || '').trim() === selectedId.value
    ) ?? null
)

const selectedProjectCard = computed(() => pill(selectedProject.value))

const clearSelectedProject = () => {
  clearRuntimeProject()
}

const selectProject = (projectId: string) => {
  setRuntimeProject({
    projectId,
    mode: 'live',
  })
}
</script>
