<template>
  <section class="space-y-4">
    <ConsoleRootDevNote
      :visible="showDevNotes"
      title="Projects Console · Demo"
      summary="Demo mode is the demo scenario layer."
      :auth="authLabel"
      :items="[
        'Uses curated scenario data, not Firestore project docs.',
        'Anyone can browse demo targets.',
        'Selecting a demo project still enters the normal overview route.',
        'Demo is for showing the shape of the console without touching stored data.',
      ]"
    />

    <ConsoleRootSelectionStatus
      :has-selection="Boolean(activeProjectPill)"
      :has-options="demoProjects.length > 0"
      select-title="Select a demo project"
      empty-title="No demo projects"
    >
      <template #selected>
        <UAlert
          color="primary"
          variant="soft"
          :title="activeProjectPill?.title || ''"
          :description="activeProjectPill?.subtitle || ''"
        />
      </template>
    </ConsoleRootSelectionStatus>

    <ProjectCollectionManager
      :collection="demoProjects"
      title="Demo Projects"
      description="Choose one of the demo project scenarios."
      :action="true"
      :link="false"
      :show-badges="false"
      dev-json-title="Projects (JSON)"
      dev-json-context="console/projects · demo collection"
      @select="selectProject"
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDevUi } from 'fireux-core/runtime/composables/fireux/app/ui/useDevUi'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import {
  useProjectInterface,
  type ProjectInterfaceInput,
} from 'fireux-core/runtime/composables/fireux/firestore/system/project/utils/view/useProjectInterface'
import type { Project } from 'fireux-core/runtime/models/system/project.model'
import { useRuntimeProjectSelection } from '~/composables/console/project/state'
import { useRuntimeProjectConsole } from '~/composables/console/project/useRuntimeProjectConsole'

const normalizeString = (value: unknown): string => String(value || '').trim()

const { runtime, scenarios } = useRuntimeProjectConsole()
const projectSelection = useRuntimeProjectSelection()
const { notesVisible } = useDevUi()
const { currentUser: authUser, isAuthenticated } = useAuth()
const { interface: toProjectCard } = useProjectInterface()

const showDevNotes = computed(() => import.meta.dev && notesVisible.value)
const authLabel = computed(() =>
  !isAuthenticated.value
    ? 'Current auth state: guest. Anonymous Firebase users would count as authenticated, but this app does not currently create anonymous auth sessions.'
    : authUser.value?.isAnonymous
      ? 'Current auth state: signed in anonymously.'
      : 'Current auth state: signed in.'
)

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
    imageUrl: normalizeString(imageUrl) || pill.imageUrl,
  }
}

const demoProjects = computed<ProjectInterfaceInput[]>(() =>
  scenarios.value.map((entry) => ({
    ...(entry.project ?? {}),
    id: entry.id,
    image_url: entry.image_url,
  }))
)

const activeProjectPill = computed(() =>
  buildProjectPill(
    runtime.project.value as Project | null,
    runtime.scenario.value?.image_url,
    runtime.id.value
  )
)

const selectProject = (projectId: string) => {
  const resolvedId = normalizeString(projectId)
  if (!resolvedId) return

  projectSelection.setRuntimeProject({
    projectId: resolvedId,
    mode: 'demo',
  })
}
</script>
