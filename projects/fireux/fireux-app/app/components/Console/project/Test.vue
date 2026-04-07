<template>
  <section class="space-y-4">
    <ConsoleRootDevNote
      :visible="showDevNotes"
      title="Projects Console · Test"
      summary="Test mode is Firestore-backed but isolated from real project records."
      :auth="authLabel"
      :items="[
        'Reads from the `test-projects` collection.',
        'The intent is safe experimentation with real document shapes.',
        'One test project is ensured per signed-in user on entry to test mode.',
        'If we later enable anonymous Firebase auth, anonymous users would count as authenticated here.',
        'Today the app does not create or link anonymous auth users, so test currently depends on normal sign-in flows.',
      ]"
    />

    <ConsoleRootSelectionStatus
      :has-selection="Boolean(activeProjectPill)"
      :has-options="ownedTestProjects.length > 0"
      select-title="Select a test project"
      empty-title="No test projects"
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
      :collection="ownedTestProjects"
      title="Test Projects"
      description="Choose your Firestore-backed test project."
      :action="true"
      :link="false"
      :show-badges="false"
      dev-json-title="Projects (JSON)"
      dev-json-context="console/projects · test collection"
      @select="selectProject"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useDevUi } from 'fireux-core/runtime/composables/fireux/app/ui/useDevUi'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useProjectCollection } from 'fireux-core/runtime/composables/fireux/firestore/system/project/fetch/useProjectCollection'
import { useProjectCreate } from 'fireux-core/runtime/composables/fireux/firestore/system/project/mutations/useProjectCreate'
import {
  useProjectInterface,
  type ProjectInterfaceInput,
} from 'fireux-core/runtime/composables/fireux/firestore/system/project/utils/view/useProjectInterface'
import type { Project } from 'fireux-core/runtime/models/system/project.model'
import { useProjectSelection } from '~/composables/console/project/useProjectSelection'
import { useProjectConsole } from '~/composables/console/project/useProjectConsole'

const normalizeString = (value: unknown): string => String(value || '').trim()
const stripTestProjectSuffix = (value: unknown): string =>
  normalizeString(value)
    .replace(/\s+test project$/i, '')
    .trim()

const { runtime } = useProjectConsole()
const projectSelection = useProjectSelection()
const { appId, ecosystem } = useFireUXConfig()
const { notesVisible } = useDevUi()
const { currentUser: authUser, uid, isAuthenticated, hasAuthState } = useAuth()
const { ensureProject } = useProjectCreate({ test: true })
const { projects: testProjects } = useProjectCollection('test-projects')
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
    title:
      normalizeString(authUser.value?.displayName) ||
      stripTestProjectSuffix(target?.name) ||
      'Your',
    subtitle: 'Test Project',
  }
}

const ownedTestProjects = computed<ProjectInterfaceInput[]>(() => {
  const currentUid = normalizeString(uid.value)
  if (!currentUid) return []

  return testProjects.value.filter(
    (entry) =>
      normalizeString((entry as Record<string, unknown>)?.id) === currentUid
  ) as ProjectInterfaceInput[]
})

const activeProjectPill = computed(() =>
  buildProjectPill(
    runtime.project.value as Project | null,
    runtime.scenario.value?.image_url,
    runtime.id.value
  )
)

if (import.meta.client) {
  const ensuringTestProject = ref(false)
  const ensuredTestProjectUid = ref('')

  watch(
    [hasAuthState, isAuthenticated, uid],
    async ([authReady, authenticated, currentUid]) => {
      const resolvedUid = normalizeString(currentUid)
      if (!authReady || !authenticated || !resolvedUid) return
      if (ensuringTestProject.value) return
      if (ensuredTestProjectUid.value === resolvedUid) return

      ensuringTestProject.value = true
      try {
        const ownerName = normalizeString(authUser.value?.displayName) || 'Your'
        await ensureProject(
          {
            id: resolvedUid,
            name: `${ownerName} Test Project`,
            slug: resolvedUid,
            description: '',
            image_url: '',
            status: 'active',
            source_url: `/console/projects/test/${resolvedUid}`,
            primary_project: false,
            project_type: 'standalone_app',
            console_endpoint_url: '/console/projects',
            app_id: normalizeString(appId),
            ecosystem_id: normalizeString(ecosystem),
            firebase_project_id: `test-${resolvedUid}`,
          },
          {
            mode: 'public',
            existingRootId: resolvedUid,
          }
        )
        ensuredTestProjectUid.value = resolvedUid
      } finally {
        ensuringTestProject.value = false
      }
    },
    { immediate: true }
  )
}

const selectProject = (projectId: string) => {
  const resolvedId = normalizeString(projectId)
  if (!resolvedId) return

  projectSelection.setRuntimeProject({
    projectId: resolvedId,
    mode: 'test',
  })
}
</script>
