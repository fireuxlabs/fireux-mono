<template>
  <section class="space-y-6">
    <UAlert
      v-if="!liveProjects.length"
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

      <ProjectCollectionManager
        v-if="liveProjects.length"
        :collection="liveProjects"
        title="Choose Live Project"
        description="Select the live project you want to work on."
        :link="false"
        :action="true"
        :show-badges="false"
        @select="selectProject"
      />
    </div>

    <section v-if="demoProjects.length" class="w-full max-w-xl space-y-3">
      <div class="flex items-center gap-3">
        <div class="h-px flex-1 bg-default/60" />
        <div class="text-xs uppercase tracking-[0.16em] text-toned">Or</div>
        <div class="h-px flex-1 bg-default/60" />
      </div>

      <div class="space-y-2">
        <div class="text-sm font-medium text-highlighted">Try a project simulation</div>

        <USwitch
          v-model="showSimulations"
          unchecked-icon="i-lucide-x"
          checked-icon="i-lucide-check"
          label="Show project simulations"
        />
      </div>

      <div v-if="showSimulations" class="space-y-2">
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
            @action="selectDemoProject(scenario.id)"
          />
        </div>
      </div>
    </section>

    <section v-if="testProject" class="w-full max-w-xl space-y-3">
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
          @action="selectTestProject"
        />

        <DevJson
          v-if="isDev"
          title="Test Project (Debug)"
          context="console projects · test project · raw and fallback analysis"
          :data="testProjectDebug"
          :default-open="false"
        />
      </div>
    </section>

  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useConsoleIndex } from 'fireux-core/runtime/composables/fireux/console/useConsoleIndex'
import { getDemoProjects } from 'fireux-core/runtime/composables/fireux/app/utils/project-demo-scenarios/demo-scenarios/index'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useProjectCollection } from 'fireux-core/runtime/composables/fireux/firestore/core/project/fetch/useProjectCollection'
import { useProjectFetch } from 'fireux-core/runtime/composables/fireux/firestore/core/project/fetch/useProjectFetch'
import {
  useProjectInterface,
  type ProjectSurface,
} from 'fireux-core/runtime/composables/fireux/firestore/core/project/utils/view/useProjectInterface'

type DemoProjectListItem = {
  id: string
  name: string
  label: string
  image_url?: string
}

const {
  selectedProject,
  selectedMode,
  selectProject,
  clearSelectedProject,
} = useProjectConsole()
const { projects: liveProjectSource } = useProjectCollection({ scope: 'mine' })
const { uid } = useAuth()
const { project: testProjectSource } = useProjectFetch(uid, { source: 'test' })
const { pill } = useProjectInterface()

const normalizeString = (value: unknown) => String(value ?? '').trim()

const projects = computed(() => ({
  live: liveProjectSource.value,
  demo: getDemoProjects(),
  test: testProjectSource.value,
}))

const {
  showSimulations,
  userAvatar: testProjectAvatar,
  liveItems: liveProjects,
  demoItems: demoProjects,
  testItem: testProject,
  demoCards: demoProjectCards,
  selectedCard: selectedProjectCard,
  testCard: testProjectCard,
  selectDemoEntity: selectDemoProject,
  selectTestEntity: selectTestProject,
} = useConsoleIndex({
  entities: projects,
  selectedEntity: selectedProject,
  selectedMode,
  selectEntity: selectProject,
  toDemoCard: (project: DemoProjectListItem) =>
    pill({
      id: project.id,
      slug: project.id,
      name: project.name,
      description: project.label,
      image_url: project.image_url,
      project_type: 'demo',
      status: 'active',
    }),
  toSelectedCard: (project, mode, user) => {
    if (mode === 'test') {
      const card = pill({
        ...(project as Record<string, unknown>),
        image_url:
          normalizeString((project as Record<string, unknown>)?.image_url) || user.avatarSrc,
      } as ProjectSurface)

      if (!card) return null

      return {
        ...card,
        title: 'Test Project',
        subtitle: user.displayName,
      }
    }

    return pill(project as ProjectSurface)
  },
  toTestCard: (project: ProjectSurface, user) => {
    const card = pill({
      ...project,
      image_url: normalizeString(project.image_url) || user.avatarSrc,
    })
    if (!card) return null

    return {
      ...card,
      title: 'Test Project',
      subtitle: user.displayName,
    }
  },
  getTestId: (project: ProjectSurface) => normalizeString(project.id),
})
const isDev = import.meta.dev

const testProjectDebug = computed(() => {
  const project = testProject.value
  const card = testProjectCard.value

  if (!project) return null

  const missing = [
    !normalizeString(project.slug) ? 'slug' : '',
    !normalizeString(project.image_url) ? 'image_url' : '',
    !normalizeString(project.description) ? 'description' : '',
    !normalizeString(project.console_endpoint_url) ? 'console_endpoint_url' : '',
    !normalizeString(project.source_url) ? 'source_url' : '',
  ].filter(Boolean)

  return {
    raw: project,
    card,
    missing,
    fallback: {
      to: normalizeString(project.slug)
        ? 'uses slug'
        : normalizeString(project.id)
          ? 'falls back to id'
          : 'missing',
      imageUrl: normalizeString(project.image_url)
        ? 'uses image_url'
        : testProjectAvatar.value
          ? 'falls back to current user avatar'
        : 'falls back to default project logo',
      title: normalizeString(project.name)
        ? 'uses name'
        : normalizeString(project.id)
          ? 'falls back to id'
          : 'falls back to Untitled project',
      subtitle: normalizeString(project.id)
        ? 'uses id'
        : normalizeString(project.slug)
          ? 'falls back to slug'
          : 'empty',
      meta: normalizeString(project.description)
        ? 'uses description'
        : 'falls back to derived type/key meta',
      statusBadge: normalizeString(project.status)
        ? 'uses status'
        : 'falls back to active',
      projectTypeBadge: normalizeString(project.project_type)
        ? 'uses project_type'
        : 'missing',
    },
  }
})

</script>
