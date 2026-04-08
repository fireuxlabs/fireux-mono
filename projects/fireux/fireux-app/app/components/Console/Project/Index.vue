<template>
  <section class="space-y-6">
    <UAlert
      v-if="!projects.length"
      color="neutral"
      variant="soft"
      title="No live projects found"
      description="No live FireUX projects are currently available in this workspace."
    />

    <div v-else class="space-y-6">
      <div class="space-y-2">
        <div class="text-xs uppercase tracking-[0.16em] text-toned">Selected Project</div>

        <ProjectCardsPill
          v-if="project"
          v-bind="project"
          :link="false"
          :show-badges="false"
        />

        <p v-else class="text-sm text-dimmed">
          Choose a project below to load it into the console.
        </p>
      </div>

      <ProjectCollectionManager
        :collection="projects"
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
import { useProjectCollection } from 'fireux-core/runtime/composables/fireux/firestore/system/project/fetch/useProjectCollection'
import { useProjectConsole } from 'fireux-core/runtime/composables/fireux/app/project-console/useProjectConsole'
import { useProjectSelection } from 'fireux-core/runtime/composables/fireux/app/project-console/useProjectSelection'

const { project } = useProjectConsole()
const { setRuntimeProject } = useProjectSelection()
const { projects } = useProjectCollection('projects')

const selectProject = (projectId: string) => {
  setRuntimeProject({ projectId })
}
</script>
