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

    <UCard>
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="space-y-1">
            <div class="text-sm font-semibold">Refresh Stored Project Faces</div>
            <p class="text-sm text-dimmed">
              Pull fresh identity and image data from each project endpoint into the stored
              `projects` collection.
            </p>
          </div>

          <UButton
            color="neutral"
            variant="soft"
            icon="i-lucide-refresh-cw"
            :loading="refreshingProjects"
            @click="refreshProjects"
          >
            Refresh
          </UButton>
        </div>
      </template>

      <div class="space-y-3">
        <UAlert
          v-if="refreshError"
          color="warning"
          variant="soft"
          title="Project refresh flagged"
          :description="refreshError"
        />

        <UAlert
          v-else-if="refreshSummary"
          color="success"
          variant="soft"
          title="Project refresh complete"
          :description="refreshSummary"
        />

        <p class="text-sm text-dimmed">
          This updates the stored project face that powers the chooser and selected-project header.
        </p>
      </div>
    </UCard>

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
import { computed, ref } from 'vue'
import { useDevUi } from 'fireux-core/runtime/composables/fireux/app/ui/useDevUi'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import { useProjectCollection } from 'fireux-core/runtime/composables/fireux/firestore/system/project/fetch/useProjectCollection'
import { useProjectInterface } from 'fireux-core/runtime/composables/fireux/firestore/system/project/utils/view/useProjectInterface'
import type { Project } from 'fireux-core/runtime/models/system/project.model'
import { useProjectSelection } from '~/composables/console/project/useProjectSelection'
import { useProjectConsole } from '~/composables/console/project/useProjectConsole'

const normalizeString = (value: unknown): string => String(value || '').trim()

const { runtime } = useProjectConsole()
const projectSelection = useProjectSelection()
const { notesVisible } = useDevUi()
const { currentUser: authUser, isAuthenticated } = useAuth()
const { updateDocument } = useFirestoreUpdate()
const { projects: liveProjects } = useProjectCollection('projects')
const { interface: toProjectCard } = useProjectInterface()
const refreshingProjects = ref(false)
const refreshSummary = ref('')
const refreshError = ref('')

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

type FireuxConsoleProjectMeta = {
  name?: string
  slug?: string
  description?: string
  image_url?: string
  project_type?: string
  source_url?: string
  console_endpoint_url?: string
  app_id?: string
  ecosystem_id?: string
  firebase_project_id?: string
}

type FireuxConsolePayload = {
  project?: {
    id?: string
    main_app_id?: string
    main_ecosystem_id?: string
  }
  project_meta?: FireuxConsoleProjectMeta
}

const normalizeConsoleEndpoint = (value: unknown) => {
  const raw = normalizeString(value)
  if (!raw) return ''

  try {
    const url = new URL(raw)
    if (url.pathname === '' || url.pathname === '/') {
      url.pathname = '/api/fireux-console'
    }
    return url.toString()
  } catch {
    return ''
  }
}

const readProjectPatch = (
  existing: Project,
  payload: FireuxConsolePayload,
  requestedEndpoint: string
) => {
  const meta = payload.project_meta || {}
  const project = payload.project || {}
  const endpointOrigin = (() => {
    try {
      return new URL(requestedEndpoint).origin
    } catch {
      return ''
    }
  })()

  const patch: Partial<Project> = {
    name: normalizeString(meta.name) || normalizeString(existing.name),
    slug:
      normalizeString(meta.slug) ||
      normalizeString(existing.slug) ||
      normalizeString(existing.id),
    description:
      normalizeString(meta.description) || normalizeString(existing.description),
    status: normalizeString(existing.status) || 'active',
    image_url:
      normalizeString(meta.image_url) || normalizeString(existing.image_url),
    source_url:
      normalizeString(meta.source_url) ||
      normalizeString(existing.source_url) ||
      endpointOrigin,
    console_endpoint_url:
      normalizeString(meta.console_endpoint_url) || requestedEndpoint,
    app_id:
      normalizeString(meta.app_id) ||
      normalizeString(project.main_app_id) ||
      normalizeString(existing.app_id),
    ecosystem_id:
      normalizeString(meta.ecosystem_id) ||
      normalizeString(project.main_ecosystem_id) ||
      normalizeString(existing.ecosystem_id),
    firebase_project_id:
      normalizeString(meta.firebase_project_id) ||
      normalizeString(project.id) ||
      normalizeString(existing.firebase_project_id),
    project_type:
      (normalizeString(meta.project_type) ||
        normalizeString(existing.project_type) ||
        'ecosystem_app') as Project['project_type'],
    primary_project: Boolean(existing.primary_project),
    owner_user_id: normalizeString(existing.owner_user_id),
  }

  return patch
}

const refreshProjects = async () => {
  if (refreshingProjects.value) return

  refreshingProjects.value = true
  refreshSummary.value = ''
  refreshError.value = ''

  const updated: string[] = []
  const skipped: string[] = []
  const failed: string[] = []

  try {
    for (const entry of liveProjects.value as Project[]) {
      const projectId = normalizeString(entry.id)
      const endpoint =
        normalizeConsoleEndpoint(entry.console_endpoint_url) ||
        normalizeConsoleEndpoint(entry.source_url)

      if (!projectId || !endpoint) {
        skipped.push(projectId || normalizeString(entry.name) || 'unknown')
        continue
      }

      try {
        const payload = await fetch(endpoint).then(async (response) => {
          if (!response.ok) {
            throw new Error(`endpoint returned ${response.status}`)
          }

          return (await response.json()) as FireuxConsolePayload
        })

        const patch = readProjectPatch(entry, payload, endpoint)
        await updateDocument<Project>('projects', projectId, patch)
        updated.push(projectId)
      } catch {
        failed.push(projectId)
      }
    }

    refreshSummary.value = [
      `${updated.length} updated`,
      skipped.length ? `${skipped.length} skipped` : '',
      failed.length ? `${failed.length} failed` : '',
    ]
      .filter(Boolean)
      .join(' · ')

    if (failed.length) {
      refreshError.value = `Some project endpoints could not be synced: ${failed.join(', ')}`
    }
  } finally {
    refreshingProjects.value = false
  }
}
</script>
