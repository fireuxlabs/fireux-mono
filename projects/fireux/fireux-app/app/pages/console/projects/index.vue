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

        <div
          v-if="showDevNotes"
          data-dev-note="true"
          :data-dev-note-title="modeDevNote.title"
          class="fireux-dev-note rounded-lg px-4 py-3 text-xs text-dimmed"
        >
          <p class="fireux-dev-note__label mb-1 text-[11px] font-semibold uppercase tracking-[0.16em]">
            Developer Note
          </p>

          <p class="mb-2">{{ modeDevNote.summary }}</p>
          <p class="mb-2">{{ modeDevNote.auth }}</p>

          <ul data-dev-note-body class="list-disc space-y-1 pl-4">
            <li v-for="item in modeDevNote.items" :key="item">
              {{ item }}
            </li>
          </ul>
        </div>

        <UAlert
          v-if="activeProjectPill"
          color="primary"
          variant="soft"
          :title="activeProjectPill.title"
          :description="activeProjectPill.subtitle || ''"
        />

        <ProjectCollectionManager
          :collection="availableProjects"
          :title="managerTitle"
          :description="managerDescription"
          :action="true"
          :link="false"
          :show-badges="false"
          dev-json-title="Projects (JSON)"
          dev-json-context="console/projects · available collection"
          @select="selectProject"
        />

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
import { useState } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useDevUi } from 'fireux-core/runtime/composables/fireux/app/ui/useDevUi'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useProjectCreate } from 'fireux-core/runtime/composables/fireux/firestore/system/project/mutations/useProjectCreate'
import { useProjectCollection } from 'fireux-core/runtime/composables/fireux/firestore/system/project/fetch/useProjectCollection'
import {
  useProjectInterface,
  type ProjectInterfaceInput,
} from 'fireux-core/runtime/composables/fireux/firestore/system/project/utils/view/useProjectInterface'
import type { Project } from 'fireux-core/runtime/models/system/project.model'
import { computed, ref, watch, watchEffect } from 'vue'
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
const stripTestProjectSuffix = (value: unknown): string =>
  normalizeString(value).replace(/\s+test project$/i, '').trim()

const { runtime, scenarios } = useRuntimeProjectConsole()
const projectSelection = useRuntimeProjectSelection()
const { appId, ecosystem } = useFireUXConfig()
const { currentUser: authUser, uid, isAuthenticated, hasAuthState } = useAuth()
const { ensureProject } = useProjectCreate({ test: true })
const { notesVisible } = useDevUi()
const { interface: toProjectCard } = useProjectInterface()
const { projects: liveProjects } = useProjectCollection('projects')
const { projects: testProjects } = useProjectCollection('test-projects')
const selectedMode = projectSelection.mode

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
    imageUrl: normalizeString(imageUrl) || pill.imageUrl,
    title:
      selectedMode.value === 'test'
        ? normalizeString(authUser.value?.displayName) ||
          stripTestProjectSuffix(target?.name) ||
          'Your'
        : pill.title,
    subtitle:
      selectedMode.value === 'test'
        ? 'Test Project'
        : pill.subtitle,
  }
}
const demoProjects = computed<ProjectInterfaceInput[]>(() =>
  scenarios.value.map((entry) => ({
    ...(entry.project ?? {}),
    id: entry.id,
    image_url: entry.image_url,
  }))
)

const availableProjects = computed<ProjectInterfaceInput[]>(() => {
  if (selectedMode.value === 'live') return liveProjects.value as ProjectInterfaceInput[]
  if (selectedMode.value === 'test') {
    const currentUid = normalizeString(uid.value)
    if (!currentUid) return []
    return testProjects.value.filter(
      (entry) => normalizeString((entry as Record<string, unknown>)?.id) === currentUid
    ) as ProjectInterfaceInput[]
  }
  return demoProjects.value
})
const availableProjectPills = computed(() =>
  availableProjects.value
    .map((entry) => buildProjectPill(entry as Project, entry.image_url, entry.id))
    .filter((entry): entry is ProjectPill => Boolean(entry))
)

const activeProjectPill = computed(() =>
  availableProjectPills.value.find((item) => item.id === runtime.id.value) ??
  buildProjectPill(
    runtime.project.value as Project | null,
    runtime.scenario.value?.image_url,
    runtime.id.value
  )
)
const managerTitle = computed(() => {
  if (selectedMode.value === 'live') return 'Real Projects'
  if (selectedMode.value === 'test') return 'Test Projects'
  return 'Demo Projects'
})
const managerDescription = computed(() => {
  if (selectedMode.value === 'live') return 'Choose one of your real projects.'
  if (selectedMode.value === 'test') {
    return 'Choose your Firestore-backed test project.'
  }
  return 'Choose one of the demo project scenarios.'
})
const showDevNotes = computed(() => import.meta.dev && notesVisible.value)
const modeDevNote = computed(() => {
  const authLabel = !isAuthenticated.value
    ? 'Current auth state: guest. Anonymous Firebase users would count as authenticated, but this app does not currently create anonymous auth sessions.'
    : authUser.value?.isAnonymous
      ? 'Current auth state: signed in anonymously.'
      : 'Current auth state: signed in.'

  if (selectedMode.value === 'live') {
    return {
      title: 'Projects Console · Real',
      summary: 'Real mode is the working Firestore-backed project space.',
      auth: authLabel,
      items: [
        'Reads from the `projects` collection.',
        'Current page behavior is chooser first, then `/console/projects/overview` after selection.',
        'Create Project stays here for now while we keep the flow simple.',
        'Canon target is “my real projects”, but the access filtering is not finished yet.',
      ],
    }
  }

  if (selectedMode.value === 'test') {
    return {
      title: 'Projects Console · Test',
      summary: 'Test mode is Firestore-backed but isolated from real project records.',
      auth: authLabel,
      items: [
        'Reads from the `test-projects` collection.',
        'The intent is safe experimentation with real document shapes.',
        'One test project is ensured per signed-in user on entry to test mode.',
        'If we later enable anonymous Firebase auth, anonymous users would count as authenticated here.',
        'Today the app does not create or link anonymous auth users, so test currently depends on normal sign-in flows.',
      ],
    }
  }

  return {
    title: 'Projects Console · Demo',
    summary: 'Demo mode is the read-only scenario layer.',
    auth: authLabel,
    items: [
      'Uses curated scenario data, not Firestore project docs.',
      'Anyone can browse demo targets.',
      'Selecting a demo project still enters the normal overview route.',
      'Demo is for showing the shape of the console without touching stored data.',
    ],
  }
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
  const ensuringTestProject = ref(false)
  const ensuredTestProjectUid = ref('')

  watch(
    [selectedMode, hasAuthState, isAuthenticated, uid],
    async ([mode, authReady, authenticated, currentUid]) => {
      const resolvedUid = normalizeString(currentUid)
      if (mode !== 'test') return
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
    mode: selectedMode.value,
  })
}

const selectMode = (mode: ConsoleMode) => {
  projectSelection.setRuntimeProject({
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
      : availableProjects.value,
  user: {
    state: !isAuthenticated.value
      ? 'guest'
      : authUser.value?.isAnonymous
        ? 'signed-in-anonymously'
        : 'signed-in',
  },
}))
</script>
