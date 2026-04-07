<template>
  <section class="space-y-6">
    <UAlert
      v-if="!projectCards.length"
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
        />

        <p v-else class="text-sm text-dimmed">
          Choose a project below to load it into the console.
        </p>
      </div>

      <UCard>
        <template #header>
          <div class="space-y-1">
            <div class="text-sm font-semibold">Choose Project</div>
            <p class="text-sm text-dimmed">
              Select the live project you want to work on.
            </p>
          </div>
        </template>

        <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <UButton
            v-for="entry in projectCards"
            :key="entry.id"
            color="neutral"
            :variant="entry.id === selectedId ? 'solid' : 'soft'"
            class="justify-start"
            @click="selectProject(entry.id)"
          >
            <span class="truncate">{{ entry.title }}</span>
          </UButton>
        </div>
      </UCard>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Project } from 'fireux-core/runtime/models/system/project.model'
import { useProjectCollection } from 'fireux-core/runtime/composables/fireux/firestore/system/project/fetch/useProjectCollection'
import { useProjectInterface } from 'fireux-core/runtime/composables/fireux/firestore/system/project/utils/view/useProjectInterface'
import { useProjectConsole } from '~/composables/console/project/useProjectConsole'
import { useProjectSelection } from '~/composables/console/project/useProjectSelection'

const { project } = useProjectConsole()
const { selectedId, setRuntimeProject } = useProjectSelection()
const { projects } = useProjectCollection('projects')
const { interface: toProjectCard } = useProjectInterface()

const projectCards = computed(() =>
  (projects.value ?? [])
    .map((project) => toProjectCard(project as Project))
    .filter(
      (
        card
      ): card is {
        id: string
        title: string
      } => Boolean(card?.id && card?.title)
    )
)

const selectProject = (projectId: string) => {
  setRuntimeProject({ projectId })
}
</script>
