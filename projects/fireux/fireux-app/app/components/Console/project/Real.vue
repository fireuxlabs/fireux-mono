<template>
  <section class="space-y-4">
    <ConsoleRootDevNote
      :visible="showDevNotes"
      title="Projects Console · Real"
      summary="Real mode is the working Firestore-backed project space."
      :auth="authLabel"
      :items="[
        'Reads from the `projects` collection.',
        'Current page behavior is chooser first, then `/console/projects/overview` after selection.',
        'Create Project stays here for now while we keep the flow simple.',
        'Canon target is “my real projects”, but the access filtering is not finished yet.',
      ]"
    />

    <ConsoleRootSelectionStatus
      :has-selection="Boolean(activeProjectPill)"
      :has-options="liveProjects.length > 0"
      select-title="Select a real project"
      empty-title="No real projects"
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
      :collection="liveProjects"
      title="Real Projects"
      description="Choose one of your real projects."
      :action="true"
      :link="false"
      :show-badges="false"
      dev-json-title="Projects (JSON)"
      dev-json-context="console/projects · real collection"
      @select="selectProject"
    />

    <ConsoleRootCreateSection
      :visible="true"
      title="Create Project"
      description="Keep creation here for now while we simplify the console flow."
    >
      <ProjectCreateSystem
        mode="console"
        return-to="/console/projects"
        cancel-to="/console/projects"
      />
    </ConsoleRootCreateSection>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDevUi } from 'fireux-core/runtime/composables/fireux/app/ui/useDevUi'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useProjectCollection } from 'fireux-core/runtime/composables/fireux/firestore/system/project/fetch/useProjectCollection'
import { useProjectInterface } from 'fireux-core/runtime/composables/fireux/firestore/system/project/utils/view/useProjectInterface'
import type { Project } from 'fireux-core/runtime/models/system/project.model'
import { useRuntimeProjectSelection } from '~/composables/console/project/state'
import { useRuntimeProjectConsole } from '~/composables/console/project/useRuntimeProjectConsole'

const normalizeString = (value: unknown): string => String(value || '').trim()

const { runtime } = useRuntimeProjectConsole()
const projectSelection = useRuntimeProjectSelection()
const { notesVisible } = useDevUi()
const { currentUser: authUser, isAuthenticated } = useAuth()
const { projects: liveProjects } = useProjectCollection('projects')
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
    mode: 'live',
  })
}
</script>
