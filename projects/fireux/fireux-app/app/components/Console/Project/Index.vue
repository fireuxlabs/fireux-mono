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
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  useProjectInterface,
  type ProjectSurface,
} from 'fireux-core/runtime/composables/fireux/firestore/core/project/utils/view/useProjectInterface'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'

type ProjectConsoleSelectionMode = 'live' | 'demo' | 'test'

type DemoProjectListItem = {
  id: string
  name: string
  label: string
  image_url?: string
  mode: 'demo'
}

const normalizeString = (value: unknown) => String(value ?? '').trim()

const { projects } = useProjectConsole()
const { currentUser, avatarSrc } = useUser()
const { pill } = useProjectInterface()

const isDev = import.meta.dev
const showSimulations = ref(false)
const selectedProjectId = ref('')
const selectedMode = ref<ProjectConsoleSelectionMode>('live')

const liveProjects = computed<ProjectSurface[]>(() =>
  Array.isArray(projects.value.live) ? projects.value.live : []
)

const demoProjects = computed<DemoProjectListItem[]>(() =>
  Array.isArray(projects.value.demo) ? projects.value.demo : []
)

const demoProjectCards = computed(() =>
  demoProjects.value
    .map((project) =>
      pill({
        id: project.id,
        slug: project.id,
        name: project.name,
        description: project.label,
        image_url: project.image_url,
        project_type: 'demo',
        status: 'active',
      })
    )
    .filter(Boolean)
)

const testProject = computed<ProjectSurface | null>(() => {
  const value = projects.value.test
  return value && typeof value === 'object' ? (value as ProjectSurface) : null
})

const testProjectAvatar = computed(() =>
  normalizeString(avatarSrc.value)
)
const testProjectDisplayName = computed(() =>
  normalizeString(currentUser.value?.display_name)
)

const testProjectCardInput = computed<ProjectSurface | null>(() => {
  const project = testProject.value
  if (!project) return null

  return {
    ...project,
    image_url: normalizeString(project.image_url) || testProjectAvatar.value,
  }
})

const testProjectCard = computed(() => {
  const card = pill(testProjectCardInput.value)
  if (!card) return null

  return {
    ...card,
    title: 'Test Project',
    subtitle: testProjectDisplayName.value,
  }
})

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

const selectedProject = computed<ProjectSurface | DemoProjectListItem | null>(() => {
  const projectId = String(selectedProjectId.value || '').trim()
  if (!projectId) return null

  if (selectedMode.value === 'demo') {
    return demoProjects.value.find((project) => project.id === projectId) ?? null
  }

  if (selectedMode.value === 'test') {
    const project = testProjectCardInput.value
    return project?.id === projectId ? project : null
  }

  return liveProjects.value.find((project) => String(project.id || '').trim() === projectId) ?? null
})

const selectedProjectCard = computed(() => {
  const project = selectedProject.value
  if (!project) return null

  if (selectedMode.value === 'demo') {
    return pill({
      id: project.id,
      slug: project.id,
      name: project.name,
      description: project.label,
      image_url: project.image_url,
      project_type: 'demo',
      status: 'active',
    })
  }

  if (selectedMode.value === 'test') {
    return testProjectCard.value
  }

  return pill(project as ProjectSurface)
})

const selectProject = (projectId: string) => {
  selectedProjectId.value = String(projectId || '').trim()
  selectedMode.value = 'live'
}

const selectDemoProject = (projectId: string) => {
  selectedProjectId.value = String(projectId || '').trim()
  selectedMode.value = 'demo'
}

const selectTestProject = () => {
  selectedProjectId.value = String(testProject.value?.id || '').trim()
  selectedMode.value = 'test'
}

const clearSelectedProject = () => {
  selectedProjectId.value = ''
  selectedMode.value = 'live'
}
</script>
