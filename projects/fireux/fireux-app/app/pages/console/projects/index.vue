<template>
  <UDashboardPanel id="console-project-home">
    <template #header>
      <LayoutsConsoleNavbar title="Projects">
        <template #right>
          <UButton
            v-if="runtime.id"
            color="neutral"
            variant="ghost"
            icon="i-lucide-x"
            @click="clearSelection"
          >
            Clear
          </UButton>
        </template>
      </LayoutsConsoleNavbar>
    </template>

    <template #body>
      <section class="space-y-4">
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-[11px] font-semibold uppercase tracking-[0.16em] text-toned">
            Mode
          </span>

          <div class="inline-flex items-center gap-1 rounded-lg border border-default bg-default/60 p-1">
            <UButton
              v-for="option in modeOptions"
              :key="option.value"
              size="xs"
              :color="selectedMode === option.value ? 'primary' : 'neutral'"
              :variant="selectedMode === option.value ? 'solid' : 'ghost'"
              :aria-pressed="selectedMode === option.value"
              @click="selectMode(option.value)"
            >
              {{ option.label }}
            </UButton>
          </div>
        </div>

        <UAlert
          v-if="activeProjectPill"
          color="primary"
          variant="soft"
          :title="activeProjectPill.title"
          :description="activeProjectPill.subtitle || ''"
        />

        <UAlert
          v-else-if="availableProjectPills.length"
          color="neutral"
          variant="soft"
          :title="selectTitle"
        />

        <UAlert
          v-else
          color="neutral"
          variant="soft"
          :title="emptyTitle"
        />

        <div v-if="availableProjectPills.length" class="space-y-2">
          <ProjectCardsPill
            v-for="item in availableProjectPills"
            :key="item.id"
            v-bind="item"
            :link="false"
            :action="true"
            :show-badges="false"
            class="cursor-pointer"
            @action="selectProject(item.id)"
          />
        </div>

        <template v-if="selectedMode === 'live'">
          <USeparator />

          <section class="space-y-3">
            <div class="space-y-1">
              <p class="text-sm font-medium text-highlighted">Create Project</p>
              <p class="text-sm text-dimmed">
                Keep creation here for now while we simplify the console flow.
              </p>
            </div>

            <ProjectCreateSystem
              mode="console"
              return-to="/console/projects"
              cancel-to="/console/projects"
            />
          </section>
        </template>

        <DevJson
          title="Project Console (JSON)"
          context="console/projects · selection snapshot"
          :data="debugJson"
          :default-open="false"
          :hide-when-empty="false"
        />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { navigateTo, useState } from '#imports'
import { useProjectCollection } from 'fireux-core/runtime/composables/fireux/firestore/system/project/fetch/useProjectCollection'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { useProjectInterface } from 'fireux-core/runtime/composables/fireux/firestore/system/project/utils/view/useProjectInterface'
import type { Project } from 'fireux-core/runtime/models/system/project.model'
import { computed, watchEffect } from 'vue'
import { useRuntimeProjectSelection } from '~/composables/console/project/state'
import { useRuntimeProjectConsole } from '~/composables/console/project/useRuntimeProjectConsole'

definePageMeta({
  layout: 'console',
  nav: {
    key: 'console-projects',
    label: 'Projects',
    icon: 'i-lucide-briefcase-business',
    order: 10,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})

const modeOptions = [
  { value: 'read-only', label: 'Demo' },
  { value: 'live', label: 'Real' },
  { value: 'test', label: 'Test' },
] as const

const normalizeString = (value: unknown): string => String(value || '').trim()

const { runtime, scenarios } = useRuntimeProjectConsole()
const projectSelection = useRuntimeProjectSelection()
const { currentUser } = useUser()
const { interface: toProjectCard } = useProjectInterface()
const { projects: liveProjects } = useProjectCollection('projects')
const { projects: testProjects } = useProjectCollection('test-projects')

type ProjectPill = NonNullable<ReturnType<typeof toProjectCard>>
type ConsoleMode = (typeof modeOptions)[number]['value']

const buildProjectPill = (
  target?: Project | null,
  imageUrl?: unknown,
  id?: unknown
): ProjectPill | null => {
  const pill = toProjectCard({
    ...(target ?? {}),
    id: normalizeString(id) || normalizeString(target?.id),
  } as Project)

  if (!pill) return null

  return {
    ...pill,
    imageUrl: pill.imageUrl || normalizeString(imageUrl),
  }
}

const demoProjectPills = computed(() =>
  scenarios.value
    .map((entry) => buildProjectPill(entry.project as Project, entry.image_url, entry.id))
    .filter((entry): entry is ProjectPill => Boolean(entry))
)

const liveProjectPills = computed(() =>
  liveProjects.value
    .map((entry) => buildProjectPill(entry as Project))
    .filter((entry): entry is ProjectPill => Boolean(entry))
)

const testProjectPills = computed(() =>
  testProjects.value
    .map((entry) => buildProjectPill(entry as Project))
    .filter((entry): entry is ProjectPill => Boolean(entry))
)

const selectedMode = projectSelection.mode
const availableProjectPills = computed(() => {
  if (selectedMode.value === 'live') return liveProjectPills.value
  if (selectedMode.value === 'test') return testProjectPills.value
  return demoProjectPills.value
})

const activeProjectPill = computed(() =>
  availableProjectPills.value.find((item) => item.id === runtime.id.value) ??
  buildProjectPill(
    runtime.project.value as Project | null,
    runtime.scenario.value?.image_url,
    runtime.id.value
  )
)
const selectTitle = computed(() => {
  if (selectedMode.value === 'live') return 'Select a real project'
  if (selectedMode.value === 'test') return 'Select a test project'
  return 'Select a demo project'
})
const emptyTitle = computed(() => {
  if (selectedMode.value === 'live') return 'No real projects'
  if (selectedMode.value === 'test') return 'No test projects'
  return 'No demo projects'
})

const consoleHeader = useState<{ component: string; props: Record<string, unknown> } | null>(
  'console-header-pill',
  () => null
)

watchEffect(() => {
  consoleHeader.value = activeProjectPill.value
    ? {
        component: 'ProjectCardsPill',
        props: {
          ...activeProjectPill.value,
          link: false,
          showBadges: false,
        },
      }
    : null
})

if (import.meta.client) {
  watchEffect(() => {
    if (runtime.id.value) return
    if (availableProjectPills.value.length !== 1) return
    selectProject(String(availableProjectPills.value[0]?.id || ''))
  })
}

const selectProject = (projectId: string, openOverview = true) => {
  const resolvedId = normalizeString(projectId)
  if (!resolvedId) return
  projectSelection.setRuntimeProject({
    projectId: resolvedId,
    mode: selectedMode.value,
  })
  if (openOverview) void navigateTo('/console/projects/overview')
}

const selectMode = (mode: ConsoleMode) => {
  projectSelection.setRuntimeProject({
    selectedId: '',
    mode,
  })
}

const clearSelection = () => {
  projectSelection.setRuntimeProject({
    selectedId: '',
    mode: selectedMode.value,
  })
}

const debugJson = computed(() => ({
  mode: selectedMode.value,
  selectedProject: runtime.project.value ?? null,
  availableProjects: runtime.project.value
    ? null
    : selectedMode.value === 'read-only'
      ? scenarios.value.map((entry) => ({
          id: entry.id,
          name: entry.name,
          label: entry.label,
          image_url: entry.image_url,
          project: entry.project,
        }))
      : (selectedMode.value === 'test' ? testProjects.value : liveProjects.value),
  user: currentUser.value ?? null,
}))
</script>
