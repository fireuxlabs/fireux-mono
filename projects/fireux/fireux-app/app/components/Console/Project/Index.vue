<template>
  <ConsoleEntityIndex
    entity-label="Project"
    entity-lower-label="project"
    entity-plural-lower-label="projects"
    empty-description="No live FireUX projects are currently available in this workspace."
    :live-count="projects.live.length"
    :has-selected="Boolean(selectedProject)"
    :selected-card="selectedProjectCard"
    :demo-cards="demoProjectCards"
    :test-card="testProjectCard"
    v-model:show-simulations="state.showSimulations"
    :creating-test="state.creatingTest"
    :can-create-test="Boolean(actions.createTest)"
    :debug="debug"
    @clear="clearSelectedProject"
    @select-demo="actions.selectDemo"
    @select-test="actions.selectTest"
    @create-test="actions.createTest?.()"
  >
    <template #selected-card="{ card }">
      <ProjectCardsPill
        v-bind="card"
        :link="false"
        :show-badges="false"
      />
    </template>

    <template #live-collection>
      <ProjectCollectionManager
        :collection="projects.live"
        title="Choose Live Project"
        description="Select the live project you want to work on."
        :link="false"
        :action="true"
        :show-badges="false"
        @select="actions.selectLive"
      />
    </template>

    <template #demo-card="{ card, select }">
      <ProjectCardsPill
        v-bind="card"
        :link="false"
        :action="true"
        :show-badges="false"
        @action="select(card.id)"
      />
    </template>

    <template #test-card="{ card, select }">
      <ProjectCardsPill
        v-bind="card"
        :link="false"
        :action="true"
        :show-badges="false"
        @action="select"
      />
    </template>
  </ConsoleEntityIndex>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ConsoleEntityIndex from 'fireux-core/runtime/components/organisms/Console/EntityIndex.vue'
import {
  useProjectInterface,
  type ProjectSurface,
} from 'fireux-core/runtime/composables/fireux/firestore/core/project/utils/view/useProjectInterface'
import { useProjectConsoleIndex } from '../../../composables/fireux/project-console/useProjectConsoleIndex'

type ProjectPillCard = NonNullable<
  ReturnType<ReturnType<typeof useProjectInterface>['pill']>
>

const {
  state,
  projects,
  actions,
  selectedProject,
  debug,
  clearSelectedProject,
} = useProjectConsoleIndex()
const { pill } = useProjectInterface()

const demoProjectCards = computed<ProjectPillCard[]>(() =>
  projects.value.demo
    .map((project) => pill(project))
    .filter((card): card is ProjectPillCard => Boolean(card))
)

const selectedProjectCard = computed<ProjectPillCard | null>(() => {
  const project = selectedProject.value as ProjectSurface | null
  if (!project) return null

  return pill(project as ProjectSurface) ?? null
})

const testProjectCard = computed<ProjectPillCard | null>(() => {
  const project = projects.value.test
  if (!project) return null

  return pill(project) ?? null
})
</script>
