<template>
  <UDashboardPanel id="console-project-home">
    <template #header>
      <LayoutsConsoleNavbar title="Project Overview">
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
        <UAlert
          v-if="activeProjectPill"
          color="primary"
          variant="soft"
          :title="activeProjectPill.title"
          :description="activeProjectPill.subtitle || ''"
        />

        <UAlert
          v-else-if="showSelector"
          color="neutral"
          variant="soft"
          title="Select a demo project"
        />

        <UAlert
          v-else
          color="neutral"
          variant="soft"
          title="No demo projects"
        />

        <div v-if="showSelector" class="space-y-2">
          <ProjectCardsPill
            v-for="item in projectPills"
            :key="item.id"
            v-bind="item"
            :link="false"
            :action="true"
            :show-badges="false"
            class="cursor-pointer"
            @action="selectProject(item.id)"
          />
        </div>

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
import { useState } from '#imports'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { useProjectInterface } from 'fireux-core/runtime/composables/fireux/firestore/system/project/utils/view/useProjectInterface'
import type { Project } from 'fireux-core/runtime/models/system/project.model'
import { computed, onScopeDispose, watchEffect } from 'vue'
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

type ConsoleHeaderPill = {
  component: string
  props: Record<string, unknown>
}

const normalizeString = (value: unknown): string => String(value || '').trim()

const { runtime, scenarios, setActiveProject } = useRuntimeProjectConsole()
const { clearRuntimeProject } = useRuntimeProjectSelection()
const { currentUser } = useUser()
const { interface: toProjectCard } = useProjectInterface()

type ProjectPill = NonNullable<ReturnType<typeof toProjectCard>>

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

const projectPills = computed(() =>
  scenarios.value
    .map((entry) => buildProjectPill(entry.project as Project, entry.image_url, entry.id))
    .filter((entry): entry is ProjectPill => Boolean(entry))
)

const activeProjectPill = computed(() =>
  projectPills.value.find((item) => item.id === runtime.id.value) ??
  buildProjectPill(
    runtime.project.value as Project | null,
    runtime.scenario.value?.image_url,
    runtime.id.value
  )
)

const showSelector = computed(() => scenarios.value.length > 1)
const projectHeaderPill = useState<ConsoleHeaderPill | null>(
  'console-header-pill-project',
  () => null
)

watchEffect(() => {
  const pill = activeProjectPill.value

  projectHeaderPill.value = pill
    ? {
        component: 'ProjectCardsPill',
        props: {
          ...pill,
          link: false,
          showBadges: false,
        },
      }
    : null
})

onScopeDispose(() => {
  projectHeaderPill.value = null
})

if (import.meta.client) {
  watchEffect(() => {
    if (runtime.id.value) return
    if (scenarios.value.length !== 1) return
    setActiveProject(String(scenarios.value[0]?.id || ''))
  })
}

const selectProject = (projectId: string) => {
  setActiveProject(projectId)
}

const clearSelection = () => {
  clearRuntimeProject()
}

const debugJson = computed(() => ({
  selectedProject: runtime.project.value ?? null,
  availableProjects: runtime.project.value
    ? null
    : scenarios.value.map((entry) => ({
        id: entry.id,
        name: entry.name,
        label: entry.label,
        image_url: entry.image_url,
        project: entry.project,
      })),
  user: currentUser.value ?? null,
}))
</script>
