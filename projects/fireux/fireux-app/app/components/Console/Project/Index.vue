<template>
  <section class="space-y-6">
    <UAlert
      v-if="!projects.live.length"
      color="neutral"
      variant="soft"
      title="No live projects found"
      description="No live FireUX projects are currently available in this workspace."
    />

    <div class="space-y-6">
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
          Choose a live, demo, or test project to load it into the console.
        </p>
      </div>

      <div v-if="isDev">
        <DevFireuxDebugPanel
          title="Project index"
          scope="console"
          :data="debug"
        />
      </div>

      <ProjectCollectionManager
        v-if="projects.live.length"
        :collection="projects.live"
        title="Choose Live Project"
        description="Select the live project you want to work on."
        :link="false"
        :action="true"
        :show-badges="false"
        @select="actions.selectLive"
      />
    </div>

    <section v-if="projects.demo.length" class="w-full max-w-xl space-y-3">
      <div class="flex items-center gap-3">
        <div class="h-px flex-1 bg-default/60" />
        <div class="text-xs uppercase tracking-[0.16em] text-toned">Or</div>
        <div class="h-px flex-1 bg-default/60" />
      </div>

      <div class="space-y-2">
        <div class="text-sm font-medium text-highlighted">Try a project simulation</div>

        <USwitch
          v-model="state.showSimulations"
          unchecked-icon="i-lucide-x"
          checked-icon="i-lucide-check"
          label="Show project simulations"
        />
      </div>

      <div v-if="state.showSimulations" class="space-y-2">
        <div class="text-sm text-dimmed">
          Read-only demo projects wired into the same console stack.
        </div>

        <div class="space-y-2">
          <ProjectCardsPill
            v-for="scenario in demoProjectCards"
            :key="scenario.id"
            v-bind="scenario"
            :link="false"
            :action="true"
            :show-badges="false"
            @action="actions.selectDemo(scenario.id)"
          />
        </div>
      </div>
    </section>

    <section v-if="projects.test || actions.createTest" class="w-full max-w-xl space-y-3">
      <div class="flex items-center gap-3">
        <div class="h-px flex-1 bg-default/60" />
        <div class="text-xs uppercase tracking-[0.16em] text-toned">Or</div>
        <div class="h-px flex-1 bg-default/60" />
      </div>

      <div class="space-y-2">
        <div class="text-sm font-medium text-highlighted">Use your test project</div>

        <div class="text-sm text-dimmed">
          Personal sandbox project for experiments and console setup.
        </div>

        <ProjectCardsPill
          v-if="testProjectCard"
          v-bind="testProjectCard"
          :link="false"
          :action="true"
          :show-badges="false"
          @action="actions.selectTest"
        />

        <UButton
          v-else-if="actions.createTest"
          color="neutral"
          variant="soft"
          icon="i-lucide-plus"
          :loading="state.creatingTest"
          @click="actions.createTest"
        >
          Create Test Project
        </UButton>
      </div>
    </section>

  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
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
const isDev = import.meta.dev

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
